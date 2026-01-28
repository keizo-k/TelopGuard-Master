export interface LineData {
    id: string;
    timestamp: string;
    originalText: string;
    isNoise: boolean;
    noiseReason?: string;
    correction?: string;
    reason?: string;
    level?: "Critical" | "Warning" | "Info";
}

const NOISE_PATTERNS = [
    { reason: 'Plugin Error', regex: /^If the transition isn.*t working/i },
    { reason: 'Plugin Error', regex: /^visit:misterhorse/i },
    { reason: 'Metadata', regex: /^\d{2}:\d{2}:\d{2}:\d{2}$/ }, // Timestamp only lines if they appear alone
    { reason: 'Empty', regex: /^\s*$/ },
];

// Helper for strict rules
export const applyDeterministicRules = (text: string): { text: string, reason?: string, level: "Critical" | "Warning" | "Info" } | null => {
    let correction = text;
    let reasons: string[] = [];

    // Rule 1: Full-width numbers -> Half-width
    if (/[０-９]/.test(correction)) {
        correction = correction.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
        reasons.push("数字は半角");
    }

    // Rule 2: Half-width symbols -> Full-width (? ! %)
    if (/[!|?|%]/.test(correction)) {
        correction = correction
            .replace(/!/g, '！')
            .replace(/\?/g, '？')
            .replace(/%/g, '％');
        reasons.push("記号は全角");
    }

    // Rule 3: Punctuation (、 。) -> Remove or Space
    if (/[、。]/.test(correction)) {
        correction = correction
            .replace(/。/g, '')
            .replace(/、/g, ' ');
        reasons.push("句読点は削除/スペース");
    }

    if (correction !== text) {
        return { text: correction, reason: reasons.join('・'), level: "Critical" };
    }
    return null;
};

export const parseTelopText = (text: string): LineData[] => {
    const lines = text.split(/\r?\n/);
    const parsedLines: LineData[] = [];

    let currentTimestamp = "";

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        // Check if line is a timestamp range
        const timestampMatch = trimmed.match(/^(\d{2}:\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}:\d{2}:\d{2}:\d{2})/);
        if (timestampMatch) {
            currentTimestamp = trimmed;
            return;
        }

        // Identify Noise
        let isNoise = false;
        let noiseReason = "";

        for (const pattern of NOISE_PATTERNS) {
            if (pattern.regex.test(trimmed)) {
                isNoise = true;
                noiseReason = pattern.reason;
                break;
            }
        }

        if (trimmed.length > 0) {
            parsedLines.push({
                id: `line-${index}`,
                timestamp: currentTimestamp,
                originalText: trimmed,
                isNoise,
                noiseReason
            });

            if (!isNoise) {
                // Check for Duplicates (Consecutive identical lines)
                const prevValid = parsedLines.slice(0, parsedLines.length - 1).reverse().find(l => !l.isNoise);

                if (prevValid && prevValid.originalText === trimmed) {
                    const currentLine = parsedLines[parsedLines.length - 1];
                    currentLine.correction = "（重複行です）";
                    currentLine.reason = "前の行と内容が重複しています";
                    currentLine.level = "Warning";
                } else {
                    const check = applyDeterministicRules(trimmed);
                    if (check) {
                        parsedLines[parsedLines.length - 1].correction = check.text;
                        parsedLines[parsedLines.length - 1].reason = check.reason;
                        parsedLines[parsedLines.length - 1].level = check.level;
                    }
                }
            }
        }
    });

    return parsedLines;
};
