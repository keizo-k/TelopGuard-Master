import { LineData } from '../utils/textProcessor';
import { diffChars } from 'diff';

interface DiffViewerProps {
    lines: LineData[];
}

// 1行分の「右カラム（修正詳細）」を描画するコンポーネント
export function DiffLineRight({ line }: { line: LineData }) {
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

    if (line.correction === "（重複行です）") {
        originalElements = <span className="text-rose-400 font-bold bg-rose-950/80 px-1 py-0.5 rounded leading-relaxed">{line.originalText}</span>;
        correctedElements = <span className="text-emerald-400 font-bold bg-emerald-950/80 px-1 py-0.5 rounded leading-relaxed">{line.correction}</span>;
    } else {
        const diff = diffChars(line.originalText, line.correction);
        originalElements = diff.map((part, index) => {
            if (part.added) return null;
            if (part.removed) return <span key={index} className="text-rose-400 font-bold bg-rose-950/80 px-0.5 rounded mx-0.5">{part.value}</span>;
            return <span key={index} className="text-slate-300">{part.value}</span>;
        });
        correctedElements = diff.map((part, index) => {
            if (part.removed) return null;
            if (part.added) return <span key={index} className="text-emerald-400 font-bold bg-emerald-950/80 px-0.5 rounded mx-0.5">{part.value}</span>;
            return <span key={index} className="text-slate-100">{part.value}</span>;
        });
    }

    return (
        <div className="space-y-2">
            {/* Reasons */}
            <div className="flex flex-col gap-1">
                {line.reasons?.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-2 flex-wrap">
                        {r.level === "Critical" && <span className="bg-red-900 text-red-100 px-1.5 py-0.5 rounded text-[10px] border border-red-700 font-bold shadow-sm">Critical</span>}
                        {r.level === "Warning" && <span className="bg-amber-900 text-amber-100 px-1.5 py-0.5 rounded text-[10px] border border-amber-700 font-bold shadow-sm">Warning</span>}
                        {r.level === "AI" && <span className="bg-fuchsia-900 text-fuchsia-100 px-1.5 py-0.5 rounded text-[10px] border border-fuchsia-700 font-bold shadow-sm flex items-center gap-0.5">✨ AI Check</span>}
                        {r.level === "Info" && <span className="bg-blue-900 text-blue-100 px-1.5 py-0.5 rounded text-[10px] border border-blue-700 font-bold shadow-sm">Info</span>}
                        <span className="text-[12px] text-slate-300 font-medium whitespace-pre-wrap">💡 {r.text}</span>
                    </div>
                ))}
            </div>

            {/* Diff */}
            <div className="pl-3 border-l-2 border-slate-600 space-y-2">
                <div className="text-sm leading-relaxed">
                    <div className="text-[10px] text-slate-500 mb-0.5 font-bold">原文</div>
                    <div>{originalElements}</div>
                </div>
                <div className="text-sm leading-relaxed">
                    <div className="text-[10px] text-indigo-400 mb-0.5 font-bold">修正案</div>
                    <div className="flex items-center justify-between gap-4">
                        <div>{correctedElements}</div>
                        <button
                            onClick={() => navigator.clipboard.writeText(line.correction || "")}
                            className="shrink-0 bg-slate-800 text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 text-[11px] font-bold px-3 py-1.5 rounded border border-slate-600 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 flex items-center gap-1"
                            title="Copy Correction"
                        >
                            📋 Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 後方互換のため全行レンダリング版も残す（現在は App.tsx では使われない）
export function DiffViewer({ lines }: DiffViewerProps) {
    return (
        <div className="space-y-4">
            <div className="text-xs font-bold border-b border-slate-700 pb-2 text-slate-500 uppercase tracking-wider">
                Analysis Results
            </div>
            {lines.map((line) => {
                if (!line.correction && line.isNoise) return null;
                return (
                    <div key={line.id} className={`py-4 border-b border-slate-800 ${line.correction ? 'bg-slate-800/20 px-4 rounded -mx-4' : ''}`}>
                        <DiffLineRight line={line} />
                    </div>
                );
            })}
        </div>
    );
}
