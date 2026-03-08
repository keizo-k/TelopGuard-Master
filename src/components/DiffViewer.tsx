import { LineData, extractStartTime } from '../utils/textProcessor';
import { diffChars } from 'diff';
import { Copy } from 'lucide-react';
import { ShortcutAction, ShortcutKeyBinding, formatShortcut } from '../config/shortcuts';

interface DiffViewerProps {
    lines: LineData[];
}

// 1行分の「右カラム（修正詳細）」を描画するコンポーネント
export function DiffLineRight({ line, shortcuts }: { line: LineData, shortcuts: Record<ShortcutAction, ShortcutKeyBinding> }) {
    if (!line.correction) {
        // 修正なし
        return (
            <span className="text-emerald-900/80 text-[10px] font-bold px-1.5 py-0.5 bg-emerald-950/30 rounded border border-emerald-900/50">
                ✔ OK
            </span>
        );
    }

    let originalElements: React.ReactNode = line.originalText;
    let correctedElements: React.ReactNode = line.correction;

    const hasCorrection = line.originalText !== line.correction;

    const renderLines = (text: string, className: string) => {
        if (!text) return null;
        return text.split('\n').map((str: string, i: number, arr: any[]) => (
            <span key={i}>
                {str ? <span className={className}>{str}</span> : null}
                {i < arr.length - 1 && <br />}
            </span>
        ));
    };

    if (line.correction === "（重複行です）") {
        originalElements = renderLines(line.originalText, "text-rose-400 font-bold bg-rose-950/80 px-1 py-0.5 rounded leading-relaxed");
        correctedElements = <span className="text-emerald-400 font-bold bg-emerald-950/80 px-1 py-0.5 rounded leading-relaxed">{line.correction}</span>;
    } else if (!hasCorrection) {
        // 修正案がない（警告のみ）の場合
        originalElements = renderLines(line.originalText, "text-rose-400 font-bold bg-rose-950/80 px-1 py-0.5 rounded leading-relaxed");
        correctedElements = <span className="text-emerald-400 font-bold bg-emerald-950/80 px-1 py-0.5 rounded leading-relaxed">（修正案なし）</span>;
    } else {
        const diff = diffChars(line.originalText, line.correction || "");

        const renderPart = (part: any, className: string, defaultClassName: string) => {
            if (!part.value) return null;
            // Split by newline and interleave with <br/> tags
            return part.value.split('\n').map((str: string, i: number, arr: any[]) => (
                <span key={`${part.value}-${i}`}>
                    {str ? <span className={className || defaultClassName}>{str}</span> : null}
                    {i < arr.length - 1 && <br />}
                </span>
            ));
        };

        originalElements = diff.map((part, index) => {
            if (part.added) return null;
            if (part.removed) return <span key={index}>{renderPart(part, "text-rose-400 font-bold bg-rose-950/80 px-0.5 rounded mx-0.5", "")}</span>;
            return <span key={index}>{renderPart(part, "", "text-slate-300")}</span>;
        });
        correctedElements = diff.map((part, index) => {
            if (part.removed) return null;
            if (part.added) return <span key={index}>{renderPart(part, "text-emerald-400 font-bold bg-emerald-950/80 px-0.5 rounded mx-0.5", "")}</span>;
            return <span key={index}>{renderPart(part, "", "text-slate-100")}</span>;
        });
    }

    return (
        <div className="space-y-2 group/right">
            {/* Header: Timecode & Copy Buttons */}
            <div className="flex items-center justify-between">
                <div className="text-xs text-indigo-300 font-sans px-2 py-0.5 rounded bg-indigo-950/30 border border-indigo-900/50">
                    ⏱ {line.timestamp}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const startTime = extractStartTime(line.timestamp);
                            if (startTime) navigator.clipboard.writeText(startTime);
                        }}
                        className="shrink-0 bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-600 text-[11px] font-bold px-3 py-1.5 rounded border border-slate-600/50 transition-all focus:ring-2 focus:ring-slate-500 flex items-center gap-2 opacity-80 group-hover/right:opacity-100 group/btn"
                        title="開始タイムコードをコピー"
                    >
                        <span className="flex items-center gap-1.5"><Copy size={12} />タイムコード</span>
                        <kbd className="text-[9px] font-medium text-slate-400 bg-slate-800 px-1 py-0.5 rounded border border-slate-600/50 font-mono group-hover/btn:text-slate-200 group-hover/btn:border-slate-500 transition-colors">
                            {formatShortcut(shortcuts.copyTimecode)}
                        </kbd>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const copyText = !hasCorrection ? "（修正案なし）" : (line.correction || "");
                            navigator.clipboard.writeText(copyText);
                        }}
                        className="shrink-0 bg-indigo-600/20 text-indigo-300 hover:text-white hover:bg-indigo-600 text-[11px] font-bold px-3 py-1.5 rounded border border-indigo-500/50 transition-all focus:ring-2 focus:ring-indigo-500 flex items-center gap-2 opacity-80 group-hover/right:opacity-100 group/btn"
                        title="修正案をコピー"
                    >
                        <span className="flex items-center gap-1.5"><Copy size={12} />修正案</span>
                        <kbd className="text-[9px] font-medium text-indigo-400/80 bg-indigo-900/50 px-1 py-0.5 rounded border border-indigo-500/30 font-mono group-hover/btn:text-indigo-200 group-hover/btn:border-indigo-400 transition-colors">
                            {formatShortcut(shortcuts.copyCorrection)}
                        </kbd>
                    </button>
                </div>
            </div>

            {/* Reasons */}
            <div className="flex flex-col gap-1">
                {line.reasons?.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-2 flex-wrap bg-slate-800/50 p-1.5 rounded border border-slate-700/50">
                        {r.level === "Critical" && <span className="bg-red-900 text-red-100 px-1.5 py-0.5 rounded text-[10px] border border-red-700 font-bold shadow-sm flex items-center gap-1">🚨 重要</span>}
                        {r.level === "Warning" && <span className="bg-amber-900 text-amber-100 px-1.5 py-0.5 rounded text-[10px] border border-amber-700 font-bold shadow-sm flex items-center gap-1">💡 注意</span>}
                        {r.level === "Duplicate" && <span className="bg-cyan-900 text-cyan-100 px-1.5 py-0.5 rounded text-[10px] border border-cyan-700 font-bold shadow-sm flex items-center gap-1">🔂 重複</span>}
                        {r.level === "AI" && <span className="bg-fuchsia-900 text-fuchsia-100 px-1.5 py-0.5 rounded text-[10px] border border-fuchsia-700 font-bold shadow-sm flex items-center gap-1">✨ AI Check</span>}
                        {r.level === "Info" && <span className="bg-blue-900 text-blue-100 px-1.5 py-0.5 rounded text-[10px] border border-blue-700 font-bold shadow-sm flex items-center gap-1">ℹ️ 情報</span>}
                        <span className="text-[12px] text-slate-300 font-medium whitespace-pre-wrap">{r.text}</span>
                    </div>
                ))}
            </div>

            {/* Diff */}
            <div className="pl-3 border-l-2 border-slate-600 space-y-2 mt-2">
                <div className="text-sm leading-relaxed">
                    <div className="text-[10px] text-slate-500 mb-0.5 font-bold">原文</div>
                    <div className="whitespace-pre-wrap">{originalElements}</div>
                </div>
                <div className={`text-sm leading-relaxed ${!hasCorrection ? 'opacity-60' : ''}`}>
                    <div className="text-[10px] text-indigo-400 mb-0.5 font-bold flex items-center gap-2">
                        修正案
                        {!hasCorrection && <span className="text-slate-500 font-normal">（修正テキストなし）</span>}
                    </div>
                    <div className="whitespace-pre-wrap">{correctedElements}</div>
                </div>
            </div>
        </div>
    );
}

interface LegacyDiffViewerProps extends DiffViewerProps {
    shortcuts: Record<ShortcutAction, ShortcutKeyBinding>;
}

// 後方互換のため全行レンダリング版も残す（現在は App.tsx では使われない）
export function DiffViewer({ lines, shortcuts }: LegacyDiffViewerProps) {
    return (
        <div className="space-y-4">
            <div className="text-xs font-bold border-b border-slate-700 pb-2 text-slate-500 uppercase tracking-wider">
                Analysis Results
            </div>
            {lines.map((line) => {
                if (!line.correction && line.isNoise) return null;
                return (
                    <div key={line.id} className={`py - 4 border - b border - slate - 800 ${line.correction ? 'bg-slate-800/20 px-4 rounded -mx-4' : ''} `}>
                        <DiffLineRight line={line} shortcuts={shortcuts} />
                    </div>
                );
            })}
        </div>
    );
}
