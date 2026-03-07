import { useState, useRef } from 'react';
import { Upload, ShieldCheck, Play, Loader2, PlugZap } from 'lucide-react';
import { parseTelopText, applyDeterministicRules, LineData, ReasonDetail } from './utils/textProcessor';
import { checkTeopWithGemini, listAvailableModels } from './services/gemini';
import { DiffLineRight } from './components/DiffViewer';

function App() {
    const [lines, setLines] = useState<LineData[]>([]);
    const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
    const [isAIChecked, setIsAIChecked] = useState(false);
    const [loadedFile, setLoadedFile] = useState<File | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [debugLog, setDebugLog] = useState('');
    const [progress, setProgress] = useState<{ current: number, total: number } | null>(null);

    // Scroll sync refs (now only one scrollable container)
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const isSyncing = useRef(false);

    const handleLeftScroll = () => {
        if (isSyncing.current || !rightPanelRef.current || !leftPanelRef.current) return;
        isSyncing.current = true;
        rightPanelRef.current.scrollTop = leftPanelRef.current.scrollTop;
        requestAnimationFrame(() => { isSyncing.current = false; });
    };

    const handleRightScroll = () => {
        if (isSyncing.current || !leftPanelRef.current || !rightPanelRef.current) return;
        isSyncing.current = true;
        leftPanelRef.current.scrollTop = rightPanelRef.current.scrollTop;
        requestAnimationFrame(() => { isSyncing.current = false; });

    };

    // ファイルを読み込んで機械的チェックを適用する共通処理
    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const parsed = parseTelopText(text);
            const withDeterministic = parsed.map(line => {
                if (line.isNoise) return line;
                const check = applyDeterministicRules(line.originalText);
                if (check) {
                    const reasons = check.reasons.map(r => ({ text: `[機械] ${r.text}`, level: r.level }));
                    const hasCritical = reasons.some(r => r.level === 'Critical');
                    const hasWarning = reasons.some(r => r.level === 'Warning');
                    return {
                        ...line,
                        correction: check.text,
                        reasons,
                        level: (hasCritical ? 'Critical' : hasWarning ? 'Warning' : 'Info') as 'Critical' | 'Warning' | 'Info' | 'AI'
                    };
                }
                return line;
            });
            setLines(withDeterministic);
            setIsAIChecked(false);
        };
        reader.readAsText(file);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setLoadedFile(file);
        processFile(file);
    };

    const handleReload = () => {
        if (!loadedFile) return;
        processFile(loadedFile);
    };

    const saveApiKey = (key: string) => {
        setApiKey(key);
        localStorage.setItem('gemini_api_key', key);
    };

    const testConnection = async () => {
        if (!apiKey) {
            alert("API Keyを入力してください");
            return;
        }
        setDebugLog("Testing connection...");
        try {
            const models = await listAvailableModels(apiKey);
            const names = models.map((m: any) => m.name.replace('models/', ''));

            // Filter and sort the models that we actually care about (just like gemini.ts prioritized list)
            const prioritize = (name: string) => {
                if (name.includes('-latest')) return 110;
                if (name === 'gemini-3.1-pro-preview') return 100;
                if (name.includes('gemini-2.5-pro')) return 90;
                if (name.includes('gemini-3.0-flash')) return 80;
                if (name === 'gemini-2.5-flash') return 70;
                if (name.includes('gemini-1.5-pro')) return 60;
                if (name.includes('gemini-1.5-flash')) return 50;
                if (name.includes('gemini-1.0-pro')) return 40;
                return 0;
            };

            const targetModels = names
                .filter((n: string) => prioritize(n) > 0)
                .sort((a: string, b: string) => prioritize(b) - prioritize(a));

            setDebugLog(`✅ Connection Success!\nAvailable Models:\n${targetModels.join('\n')}`);
            alert(`✅ 接続成功！\n\n実際にシステムが使用するモデル候補（優先度順）:\n${targetModels.join('\n')}`);
        } catch (err: any) {
            setDebugLog(`❌ Connection Failed:\n${err.message}`);
            alert(`❌ 接続失敗：\n${err.message}\n\n※正しいAPIキーが入力されているか確認してください。`);
        }
    };

    const runAICheck = async () => {
        if (!apiKey) {
            alert("API Keyを設定してください");
            return;
        }
        setIsLoading(true);
        setError('');
        setProgress({ current: 0, total: lines.filter(l => !l.isNoise).length });
        setDebugLog('Running AI Check...');

        try {
            const corrections = await checkTeopWithGemini(apiKey, lines, (current, total) => {
                setProgress({ current, total });
                setDebugLog(`Checking chunk... (${current}/${total} lines)`);
            });

            // Update lines with corrections (Merge AI + Deterministic Rules)
            const updatedLines = lines.map(line => {
                // BUG FIX: Ignore noise lines (e.g. English-only lines, URLs) that were intentionally skipped in mechanical checks
                if (line.isNoise) return line;

                const fix = corrections.find((c: any) => c.id === line.id);
                const codeCheck = applyDeterministicRules(line.originalText);

                if (fix || codeCheck) {
                    let correctedText = line.originalText;
                    let combinedReasons: ReasonDetail[] = []; // Now dealing with an array of ReasonDetail objects

                    // Apply AI fix first (Meaning/Context)
                    if (fix) {
                        correctedText = fix.corrected;
                        combinedReasons.push({ text: `[AI] ${fix.reason}`, level: "AI" });
                    }

                    // Apply Deterministic fix on top of AI fix (or original text if no AI fix)
                    const finalCodeCheck = applyDeterministicRules(correctedText);
                    if (finalCodeCheck) {
                        correctedText = finalCodeCheck.text;
                        // Map the text field to prepend [機械] and merge existing level
                        const mechanicalReasons = finalCodeCheck.reasons.map(r => ({
                            text: `[機械] ${r.text}`,
                            level: r.level
                        }));
                        combinedReasons = combinedReasons.concat(mechanicalReasons);
                    }

                    // For the overall line's highlight state (if needed in some UI places), determine highest level
                    const hasCritical = combinedReasons.some(r => r.level === "Critical");
                    const hasWarning = combinedReasons.some(r => r.level === "Warning");
                    const hasAI = combinedReasons.some(r => r.level === "AI");
                    const finalLevel = hasCritical ? "Critical" : hasWarning ? "Warning" : hasAI ? "AI" : "Info";

                    return {
                        ...line,
                        correction: correctedText,
                        reasons: combinedReasons,
                        level: finalLevel as "Critical" | "Warning" | "Info" | "AI"
                    };
                }

                return line;
            });

            setLines(updatedLines);
            setIsAIChecked(true);
            setDebugLog('✅ AI Check Complete');
        } catch (err: any) {
            const rawMessage = err.message || String(err);
            let friendlyMessage = "【エラー】予期せぬシステムエラーが発生しました。AIモデルの仕様変更などの原因が考えられます。";
            let actionText = "💡 対処法: 対処法が不明な場合は、お手数ですが下部の[詳細エラー]をコピーして、依頼者までお問い合わせください。";

            if (rawMessage.includes("429") || rawMessage.includes("Quota exceeded") || rawMessage.includes("rate-limits")) {
                friendlyMessage = "【エラー】AIの利用制限（一時的な無料枠の上限）に達しました。";
                actionText = "💡 対処法: 時間を置く（数分〜数十分）と自動で回復します。急ぎの場合は、別のGoogleアカウントのAPIキーを使用するか、有料プランをご検討ください。";
            } else if (rawMessage.includes("400") || rawMessage.includes("API_KEY_INVALID")) {
                friendlyMessage = "【エラー】APIキーが間違っているか、無効です。";
                actionText = "💡 対処法: 右上の「API KEY」欄に入力されているキーが正しいか確認してください。";
            } else if (rawMessage.includes("503") || rawMessage.includes("high demand") || rawMessage.includes("overloaded")) {
                friendlyMessage = "【エラー】現在AIサーバーへのアクセスが集中しており、一時的に処理が失敗しました。";
                actionText = "💡 対処法: 数十秒から数分ほど待ってから、もう一度「Run AI Check」ボタンを押してください。";
            } else if (rawMessage.includes("403") || rawMessage.includes("permission denied")) {
                friendlyMessage = "【エラー】このAPIキーでは指定されたAIモデル（Gemini）を利用する権限がないか、サービスが登録されていません。";
                actionText = "💡 対処法: Google AI Studioで該当のAPIキーが有効化されているか、プランを確認してください。";
            } else if (rawMessage.includes("404") || rawMessage.match(/models\/[a-zA-Z0-9.\-]+ not found/i)) {
                friendlyMessage = "【エラー】指定されたAIモデル（Gemini）が存在しないか、利用できません。";
                actionText = "💡 対処法: プログラムで指定されているモデル名が変更された可能性があります。システムの管理者に確認してください。";
            }

            setError(`${friendlyMessage}\n${actionText}\n\n[詳細エラー]: ${rawMessage}`);
            setDebugLog(`❌ Error:\n${rawMessage}`);
        } finally {
            setIsLoading(false);
            setProgress(null);
        }
    };

    // Generate Chatwork Report
    const copyReport = () => {
        const totalLines = lines.length;
        const validLines = lines.filter(l => !l.isNoise).length;
        const issues = lines.filter(l => l.correction);

        const details = issues.map(line => {
            const levelIcon = line.level === "Critical" ? "⛔" : line.level === "Warning" ? "⚠️" : line.level === "AI" ? "✨" : "ℹ️";
            const formattedReasons = line.reasons?.map(r => `  ・${r.text}`).join('\n') || "理由なし";
            return `--------------------------------------------------
${levelIcon} [${line.level || "AI"}] ${line.timestamp || "(No Time)"}
原文: ${line.originalText}
修正: ${line.correction}
理由: \n${formattedReasons}`;
        }).join('\n');

        const report = `[info][title]TelopGuard 校正レポート[/title]✅ AI校正チェック完了

■ 検査統計
・総行数: ${totalLines}行
・検査対象: ${validLines}行
・AI指摘数: ${issues.length}件

■ 詳細レポート
${details}

※このレポートはAIによる自動チェック結果です。
誤検知（過剰な指摘）が含まれる可能性があるため、
最終的な採用・不採用は編集者の目視判断で行っています。
(Generated by TelopGuard v2.4)[/info]`;

        // ① 修正理由の中にURL（Web検索結果）が含まれている行を抽出する
        const webSearchedTerms = issues
            .filter(line => line.reasons && line.reasons.some(r => r.text.includes('http')))
            .map(line => {
                const urlReasons = line.reasons!.filter(r => r.text.includes('http')).map(r => r.text).join(' ・ ');
                return `- ${line.originalText} (理由: ${urlReasons.replace(/^\[.*?\]\s*/, '')})`;
            });

        // ② もしWeb検索された用語があれば、レポートの末尾に「新規用語の登録候補」として追記する
        const finalReport = webSearchedTerms.length > 0
            ? `${report}\n\n【📝 新規用語の登録候補（一時辞書）】\nAIがWeb検索で実在を確認した用語です。後日、機械的辞書やAI文脈辞書への登録リストとしてご活用ください。\n${webSearchedTerms.join('\n')}`
            : report;

        navigator.clipboard.writeText(finalReport);
        alert("Chatwork用レポートをコピーしました！");
    };

    return (

        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex flex-col">
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-4 bg-[#1e293b] border-b border-slate-700 shadow-md">
                <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
                    <ShieldCheck className="w-6 h-6" />
                    TelopGuard <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full">v2.4</span>
                </h1>
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded border border-slate-600">
                        <span className="text-xs text-slate-400 font-medium">APIキー:</span>
                        <input
                            type="text"
                            autoComplete="off"
                            data-1p-ignore="true"
                            placeholder="Gemini APIキー"
                            style={{ WebkitTextSecurity: "disc" } as React.CSSProperties & { WebkitTextSecurity: string }}
                            className="bg-transparent border-none text-sm w-32 focus:outline-none text-slate-200 placeholder-slate-600"
                            value={apiKey}
                            onChange={(e) => saveApiKey(e.target.value)}
                        />
                    </div>
                    <button onClick={testConnection} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition-colors text-slate-300 flex items-center gap-1">
                        <PlugZap size={14} /> 接続テスト
                    </button>
                </div>
            </header>

            {/* Main Content - Unified Per-Row Layout */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="p-3 border-b border-slate-700 bg-[#1e293b] flex justify-between items-center shrink-0">
                    <h2 className="text-sm font-bold flex items-center gap-2 text-slate-300">
                        <Upload size={16} /> テロップ原稿
                        {loadedFile && <span className="text-[10px] text-slate-500 font-normal font-mono truncate max-w-[160px]" title={loadedFile.name}>{loadedFile.name}</span>}
                        {lines.length > 0 && (
                            isAIChecked
                                ? <span className="ml-2 text-[10px] bg-fuchsia-900 text-fuchsia-200 border border-fuchsia-700 px-2 py-0.5 rounded-full font-bold">✨ 機械 ＋ AI 統合版</span>
                                : <span className="ml-2 text-[10px] bg-amber-900 text-amber-200 border border-amber-700 px-2 py-0.5 rounded-full font-bold">⚙️ 機械的チェックのみ</span>
                        )}
                    </h2>
                    <div className="flex gap-2 items-center">
                        {loadedFile && (
                            <button onClick={handleReload} className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 px-2 py-1 rounded transition-colors flex items-center gap-1" title="再読み込み">
                                🔄 再読み込み
                            </button>
                        )}
                        {lines.length > 0 && (
                            <button onClick={() => { setLines([]); setLoadedFile(null); }} className="text-xs text-slate-500 hover:text-slate-300">クリア</button>
                        )}
                        {lines.length > 0 && (
                            <button onClick={copyReport} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded border border-slate-600 transition-colors flex items-center gap-1" title="Chatwork用レポートをコピー">
                                📑 レポートをコピー
                            </button>
                        )}
                        <button
                            onClick={runAICheck}
                            disabled={isLoading || lines.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded text-sm font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all relative overflow-hidden"
                        >
                            {isLoading && progress && progress.total > 0 && (
                                <div className="absolute left-0 top-0 bottom-0 bg-indigo-400/30 transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                            )}
                            <div className="relative flex items-center gap-2">
                                {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Play fill="currentColor" size={14} />}
                                {isLoading ? (progress && progress.total > 0 ? `チェック中... (${Math.round((progress.current / progress.total) * 100)}%)` : 'チェック中...') : 'AIチェック実行'}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Column Headers */}
                {lines.length > 0 && (
                    <div className="grid grid-cols-2 border-b border-slate-700 bg-[#1e293b] shrink-0">
                        <div className="px-4 py-2 text-xs font-bold text-slate-400 border-r border-slate-700">元テキスト</div>
                        <div className="px-4 py-2 text-xs font-bold flex items-center gap-2 text-slate-400">
                            <ShieldCheck size={12} className="text-green-500" /> 分析結果
                        </div>
                    </div>
                )}

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {lines.length === 0 ? (
                        // Drop zone
                        <div className="h-full p-6">
                            <div className="h-full border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-indigo-500 hover:bg-slate-800 transition-all cursor-pointer relative">
                                <input type="file" accept=".txt" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <Upload size={48} className="mb-4 text-indigo-500" />
                                <p className="font-bold text-lg text-slate-400">テキストファイルをドラッグ＆ドロップ</p>
                                <p className="text-xs mt-2">.txt形式 (Premiere Pro / Vrew)</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* AI Check guidance banner */}
                            {!isAIChecked && (
                                <div className="mx-4 mt-3 mb-1 p-3 rounded-lg border border-amber-800/60 bg-amber-950/40 text-amber-200 text-xs leading-relaxed space-y-1">
                                    <div className="font-bold text-amber-300">⚙️ 現在、機械的チェックの結果のみ表示しています</div>
                                    <div className="text-amber-300/80">まず結果を確認し、必要な箇所を修正してください（修正不要な指摘は無視してOKです）。</div>
                                    <div className="text-amber-300/80">確認が完了したら、右上の <span className="font-bold text-indigo-300">[AIチェック実行]</span> ボタンで意味的チェックを実行してください。</div>
                                    <div className="text-amber-500/60 text-[10px] pt-1">※ APIのquota（利用量）が消費されるのはAIチェックのみです。機械的チェックは無料です。</div>
                                </div>
                            )}

                            {error && (
                                <div className="mx-4 mt-3 bg-red-900/50 text-red-200 p-4 rounded mb-4 border border-red-800 text-sm whitespace-pre-wrap">{error}</div>
                            )}

                            {/* Per-row grid: each line renders left (original) and right (correction) side by side */}
                            {lines.map(line => {
                                if (line.isNoise && !line.correction) return null;
                                const hasIssue = !!line.correction;
                                return (
                                    <div
                                        key={line.id}
                                        className={`grid grid-cols-2 border-b border-slate-800/70 ${hasIssue ? 'bg-slate-800/30' : ''
                                            }`}
                                    >
                                        {/* Left: Original Text */}
                                        <div className={`px-4 py-3 border-r border-slate-700/50 font-mono text-sm ${line.isNoise ? 'opacity-30' : ''
                                            }`}>
                                            <div className="text-[10px] text-slate-600 mb-1 font-sans">{line.timestamp}</div>
                                            <div className="text-slate-400 leading-relaxed">{line.originalText}</div>
                                        </div>

                                        {/* Right: Correction / Analysis */}
                                        <div className="px-4 py-3 text-sm">
                                            <DiffLineRight line={line} />
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}

export default App
