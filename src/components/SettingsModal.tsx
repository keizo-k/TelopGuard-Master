import { useState, useEffect } from 'react';
import { Settings, X, Keyboard } from 'lucide-react';
import { ShortcutAction, ShortcutKeyBinding, SHORTCUT_LABELS, formatShortcut, DEFAULT_SHORTCUTS } from '../config/shortcuts';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentShortcuts: Record<ShortcutAction, ShortcutKeyBinding>;
    onSave: (shortcuts: Record<ShortcutAction, ShortcutKeyBinding>) => void;
}

export function SettingsModal({ isOpen, onClose, currentShortcuts, onSave }: SettingsModalProps) {
    const [editingAction, setEditingAction] = useState<ShortcutAction | null>(null);
    const [tempShortcuts, setTempShortcuts] = useState<Record<ShortcutAction, ShortcutKeyBinding>>(currentShortcuts);

    // Reset temp state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempShortcuts(currentShortcuts);
            setEditingAction(null);
        }
    }, [isOpen, currentShortcuts]);

    // Global keyboard listener for capturing shortcuts
    useEffect(() => {
        if (!isOpen || !editingAction) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();

            // Ignore modifier-only key presses
            if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
                return;
            }

            const newBinding: ShortcutKeyBinding = {
                key: e.key,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                metaKey: e.metaKey
            };

            setTempShortcuts(prev => ({
                ...prev,
                [editingAction]: newBinding
            }));

            setEditingAction(null);
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [isOpen, editingAction]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(tempShortcuts);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <Settings size={20} className="text-indigo-400" />
                        キーボードショートカット設定
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-slate-700/50 p-1.5 rounded transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                    <p className="text-sm text-slate-400 mb-6">
                        各アクションのボタンをクリックしてから、割り当てたいキー（キーの組み合わせ）を押してください。
                    </p>

                    <div className="grid gap-3">
                        {(Object.keys(SHORTCUT_LABELS) as ShortcutAction[]).map((action) => {
                            const isEditing = editingAction === action;
                            const binding = tempShortcuts[action];

                            return (
                                <div key={action} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Keyboard size={16} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                                        <span className="text-sm font-medium text-slate-200">{SHORTCUT_LABELS[action]}</span>
                                    </div>
                                    <button
                                        onClick={() => setEditingAction(isEditing ? null : action)}
                                        className={`px-4 py-2 min-w-[140px] rounded font-mono text-sm transition-all text-center
                                            ${isEditing
                                                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] ring-2 ring-indigo-400 animate-pulse'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
                                            }`}
                                    >
                                        {isEditing ? 'キーを入力...' : formatShortcut(binding)}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-xs text-slate-400 font-medium">
                        ※ Windowsでは、Cmd = Ctrl、Option = Alt と読みかえてください。
                    </div>
                    <div className="flex gap-2 sm:gap-3 items-center">
                        <button
                            onClick={() => setTempShortcuts(DEFAULT_SHORTCUTS)}
                            className="px-3 py-2 rounded text-xs font-medium text-amber-200/80 hover:text-amber-200 hover:bg-amber-950/50 transition-colors mr-2"
                        >
                            初期設定に戻す
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 rounded text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition-all"
                        >
                            設定を保存
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
