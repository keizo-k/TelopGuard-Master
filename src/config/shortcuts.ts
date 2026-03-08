export type ShortcutKeyBinding = {
    key: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
};

export type ShortcutAction =
    | 'prevLine'
    | 'nextLine'
    | 'prevIssue'
    | 'nextIssue'
    | 'copyCorrection'
    | 'copyTimecode'
    | 'copyDirector'
    | 'copyReport';

export const SHORTCUT_LABELS: Record<ShortcutAction, string> = {
    prevLine: '上の行（原文）へ',
    nextLine: '下の行（原文）へ',
    prevIssue: '前の修正行へジャンプ',
    nextIssue: '次の修正行へジャンプ',
    copyCorrection: '選択行の修正案をコピー',
    copyTimecode: '選択行のタイムコードをコピー',
    copyDirector: 'ディレクター向け形式でコピー',
    copyReport: 'レポート全文をコピー'
};

export const DEFAULT_SHORTCUTS: Record<ShortcutAction, ShortcutKeyBinding> = {
    prevLine: { key: 'ArrowUp', ctrlKey: false, shiftKey: false, altKey: false, metaKey: false },
    nextLine: { key: 'ArrowDown', ctrlKey: false, shiftKey: false, altKey: false, metaKey: false },
    prevIssue: { key: 'ArrowUp', ctrlKey: false, shiftKey: true, altKey: false, metaKey: false },
    nextIssue: { key: 'ArrowDown', ctrlKey: false, shiftKey: true, altKey: false, metaKey: false },
    copyCorrection: { key: 'v', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false },
    copyTimecode: { key: 'c', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false },
    copyDirector: { key: 'c', ctrlKey: false, shiftKey: false, altKey: true, metaKey: false },
    copyReport: { key: 'c', ctrlKey: true, shiftKey: true, altKey: false, metaKey: false },
};

export const formatShortcut = (binding: ShortcutKeyBinding): string => {
    const parts = [];
    if (binding.ctrlKey) parts.push('Ctrl');
    if (binding.altKey) parts.push('Alt');
    if (binding.shiftKey) parts.push('Shift');
    if (binding.metaKey) parts.push('Meta');

    let keyName = binding.key;
    if (keyName === ' ') keyName = 'Space';
    else if (keyName === 'ArrowUp') keyName = '↑';
    else if (keyName === 'ArrowDown') keyName = '↓';
    else if (keyName === 'ArrowLeft') keyName = '←';
    else if (keyName === 'ArrowRight') keyName = '→';
    else if (keyName.length === 1) keyName = keyName.toUpperCase();

    parts.push(keyName);
    return parts.join(' + ');
};

export const matchesShortcut = (e: KeyboardEvent, binding: ShortcutKeyBinding): boolean => {
    return e.key.toLowerCase() === binding.key.toLowerCase() &&
        e.ctrlKey === binding.ctrlKey &&
        e.shiftKey === binding.shiftKey &&
        e.altKey === binding.altKey &&
        e.metaKey === binding.metaKey;
};
