import { LineData } from '../utils/textProcessor';

interface DiffViewerProps {
    lines: LineData[];
}

export function DiffViewer({ lines }: DiffViewerProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 text-xs font-bold border-b border-slate-700 pb-2 text-slate-500 uppercase tracking-wider">
                <div className="col-span-2">Time</div>
                <div className="col-span-8">Result</div>
                <div className="col-span-2 text-right">Action</div>
            </div>
            {lines.map((line) => (
                (!line.correction && !line.isNoise) ? null : // Show only issues or corrections for cleaner view? OR keep all? User wants to see result.
                    // Actually user screenshot shows a list of results. Let's keep all logic but style safely.
                    <div key={line.id} className={`grid grid-cols-12 gap-4 py-3 border-b border-slate-800 items-start ${line.correction ? 'bg-indigo-900/20' : ''} ${line.isNoise ? 'hidden' : ''}`}>
                        <div className="col-span-2 font-mono text-xs text-slate-500 pt-1">{line.timestamp.split('-')[0]}</div>
                        <div className="col-span-8 whitespace-pre-wrap text-sm">
                            {line.correction ? (
                                <div>
                                    <div className="font-bold text-indigo-300">{line.correction}</div>
                                    <div className="text-xs text-slate-400 mt-1 flex items-start gap-1 flex-wrap">
                                        {line.level === "Critical" && <span className="bg-red-900 text-red-100 px-1 rounded text-[10px] border border-red-700">Critical</span>}
                                        {line.level === "Warning" && <span className="bg-amber-900 text-amber-100 px-1 rounded text-[10px] border border-amber-700">Warning</span>}
                                        {line.level === "Info" && <span className="bg-blue-900 text-blue-100 px-1 rounded text-[10px] border border-blue-700">Info</span>}
                                        <span className="text-amber-400">💡</span> {line.reason}
                                    </div>
                                    <div className="text-xs text-slate-600 mt-1 line-through">{line.originalText}</div>
                                </div>
                            ) : (
                                <span className="text-slate-600">{line.originalText} <span className="text-green-900 text-xs ml-2">✔ OK</span></span>
                            )}
                        </div>
                        <div className="col-span-2 text-right">
                            {line.correction && (
                                <button
                                    onClick={() => navigator.clipboard.writeText(line.correction || "")}
                                    className="bg-slate-800 text-indigo-400 hover:text-indigo-300 text-xs px-2 py-1 rounded border border-slate-700 transition-colors"
                                    title="Copy Correction"
                                >
                                    Copy
                                </button>
                            )}
                        </div>
                    </div>
            ))}
        </div>
    );
}
