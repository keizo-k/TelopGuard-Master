export interface ReasonDetail {
    text: string;
    level: "Critical" | "Warning" | "Info" | "AI";
}

export interface LineData {
    id: string;
    timestamp: string;
    originalText: string;
    isNoise: boolean;
    noiseReason?: string;
    correction?: string;
    reasons?: ReasonDetail[]; // Individual reasons with their own levels
    level?: "Critical" | "Warning" | "Info" | "AI"; // Overall highest severity of the line
}

import { DETERMINISTIC_DICTIONARY, CORE_RULES, STYLE_DICTIONARY } from '../config/dictionaries';
import { FORMATTING_RULES } from '../config/rules';

const NOISE_PATTERNS = [
    { reason: 'Plugin Error', regex: /^if\s*the\s*transition/i },
    { reason: 'Plugin Error', regex: /visit:\s*misterhorse/i },
    { reason: 'Metadata', regex: /^\d{2}[:;]\d{2}[:;]\d{2}[:;]\d{2}$/ }, // Timestamp only lines if they appear alone
    { reason: 'Empty', regex: /^\s*$/ },
];

// Helper for strict rules

export const applyDeterministicRules = (text: string): { text: string, reasons: ReasonDetail[] } | null => {
    let correction = text;
    let reasons: ReasonDetail[] = [];
    let isChanged = false;

    // ----- [NEW] Rule 0: Deterministic Dictionary -----
    DETERMINISTIC_DICTIONARY.forEach(entry => {
        if (entry.pattern.test(correction)) {
            const temp = correction.replace(entry.pattern, entry.correct);
            if (temp !== correction) {
                correction = temp;
                reasons.push({ text: entry.reason, level: "Critical" });
                isChanged = true;
            }
        }
    });

    // Rule 0.1: Full-width Space -> Half-width Space
    if (FORMATTING_RULES.fullWidthSpace.pattern.test(correction)) {
        correction = correction.replace(FORMATTING_RULES.fullWidthSpace.pattern, FORMATTING_RULES.fullWidthSpace.replacement);
        reasons.push({ text: FORMATTING_RULES.fullWidthSpace.reason, level: "Critical" });
        isChanged = true;
    }

    // Rule 0.2: Punctuation (、 。) -> Remove or Space
    if (FORMATTING_RULES.punctuation.pattern.test(correction)) {
        correction = correction
            .replace(FORMATTING_RULES.punctuation.replaceMaru.pattern, FORMATTING_RULES.punctuation.replaceMaru.replacement)
            .replace(FORMATTING_RULES.punctuation.replaceTen.pattern, FORMATTING_RULES.punctuation.replaceTen.replacement);
        reasons.push({ text: FORMATTING_RULES.punctuation.reason, level: "Critical" });
        isChanged = true;
    }

    // Rule 0.3: Consecutive Spaces -> Single Space
    // これにより Rule 0.2 で発生した余分なスペースも1つにまとまる
    if (FORMATTING_RULES.consecutiveSpaces.pattern.test(correction)) {
        correction = correction.replace(FORMATTING_RULES.consecutiveSpaces.pattern, FORMATTING_RULES.consecutiveSpaces.replacement);
        reasons.push({ text: FORMATTING_RULES.consecutiveSpaces.reason, level: "Critical" });
        isChanged = true;
    }

    // Rule 1: Full-width numbers -> Half-width
    if (FORMATTING_RULES.fullWidthNumbers.pattern.test(correction)) {
        correction = correction.replace(FORMATTING_RULES.fullWidthNumbers.pattern, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
        reasons.push({ text: FORMATTING_RULES.fullWidthNumbers.reason, level: "Critical" }); // Changed to ReasonDetail object
        isChanged = true;
    }

    // Rule 1.5: Full-width Period/Comma -> Half-width (, .)
    if (FORMATTING_RULES.fullWidthPeriodComma.pattern.test(correction)) {
        correction = correction
            .replace(FORMATTING_RULES.fullWidthPeriodComma.replacePeriod.pattern, FORMATTING_RULES.fullWidthPeriodComma.replacePeriod.replacement)
            .replace(FORMATTING_RULES.fullWidthPeriodComma.replaceComma.pattern, FORMATTING_RULES.fullWidthPeriodComma.replaceComma.replacement);
        reasons.push({ text: FORMATTING_RULES.fullWidthPeriodComma.reason, level: "Critical" }); // Changed to ReasonDetail object
        isChanged = true;
    }

    // Rule 1.6: Full-width Colon/Slash -> Half-width (: /)
    if (FORMATTING_RULES.fullWidthColonSlash.pattern.test(correction)) {
        correction = correction
            .replace(FORMATTING_RULES.fullWidthColonSlash.replaceColon.pattern, FORMATTING_RULES.fullWidthColonSlash.replaceColon.replacement)
            .replace(FORMATTING_RULES.fullWidthColonSlash.replaceSlash.pattern, FORMATTING_RULES.fullWidthColonSlash.replaceSlash.replacement);
        reasons.push({ text: FORMATTING_RULES.fullWidthColonSlash.reason, level: "Critical" });
        isChanged = true;
    }

    // Rule 2: Half-width Symbols -> Full-width
    // ※ ユーザー指定により、カンマ(,) と ピリオド(.) は除外（全角化の対象外、半角のままにする）
    if (FORMATTING_RULES.halfWidthSymbolsToFull.pattern.test(correction)) {
        let tempCorrection = correction;
        let symbolsReplaced = false;
        let replacedChars = new Set<string>();

        // 行全体が英語テキスト・URLであれば記号変換をスキップ
        // （英数字・半角スペース・記号のみで構成されており、日本語文字を含まない場合）
        const isEnglishLine = /^[\x00-\x7F]*$/.test(tempCorrection); // ASCII文字のみの行
        if (isEnglishLine) {
            // 英語のみの行は全角記号変換不要 → そのまま通過
        } else {
            // 1文字ずつ判定して置換するかどうかを決める
            let chars = tempCorrection.split('');
            for (let i = 0; i < chars.length; i++) {
                let char = chars[i];
                let charCode = char.charCodeAt(0);

                // 半角記号の範囲 (ASCII 0x21-0x2F, 0x3A-0x40, 0x5B-0x60, 0x7B-0x7E)
                // ただし . (0x2E), , (0x2C), : (0x3A), / (0x2F) は変換対象外とするためスキップ
                if (charCode === 0x2E || charCode === 0x2C || charCode === 0x3A || charCode === 0x2F) {
                    continue;
                }

                if (charCode >= 0x21 && charCode <= 0x7E && !/[a-zA-Z0-9]/.test(char)) {
                    // 上記例外に当てはまらない場合は全角に変換 (+0xFEE0)
                    // ※一部の文字（半角カナの記号など）は除外、純粋なASCII記号のみ対象
                    chars[i] = String.fromCharCode(charCode + 0xFEE0);
                    replacedChars.add(char);
                    symbolsReplaced = true;
                }
            }

            if (symbolsReplaced) {
                correction = chars.join('');
            }
        } // end of non-English block

        if (symbolsReplaced) {

            let specificMsgs: string[] = [];
            if (replacedChars.has('(') || replacedChars.has(')')) {
                specificMsgs.push('丸括弧（（））は全角');
                replacedChars.delete('('); replacedChars.delete(')');
            }
            if (replacedChars.has('!') || replacedChars.has('?')) {
                specificMsgs.push('感嘆符・疑問符（！？）は全角');
                replacedChars.delete('!'); replacedChars.delete('?');
            }
            if (replacedChars.has('[') || replacedChars.has(']')) {
                specificMsgs.push('角括弧（［］）は全角');
                replacedChars.delete('['); replacedChars.delete(']');
            }
            if (replacedChars.has('%')) {
                specificMsgs.push('パーセント（％）は全角');
                replacedChars.delete('%');
            }
            if (replacedChars.size > 0) {
                specificMsgs.push('一般記号は全角');
            }

            // JOIN instead of push multiple to keep them as one "Critical" reason line if preferred, 
            // OR we can push them individually. Pushing individually is cleaner.
            specificMsgs.forEach(msg => {
                reasons.push({ text: msg, level: "Critical" });
            });
            isChanged = true;
        }
    }

    // Rule 2.5: Half-width Katakana -> Full-width Katakana (Critical)
    if (FORMATTING_RULES.halfWidthKatakana.pattern.test(correction)) {
        const kanaMap: { [key: string]: string } = {
            'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
            'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
            'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
            'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
            'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
            'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
            'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
            'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
            'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
            'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
            'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
            'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
            'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
            'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
            'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
            'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
            'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
            'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
            'ｰ': 'ー', '､': '、', 'ﾟ': '゜', 'ﾞ': '゛', '･': '・', '｢': '「', '｣': '」'
        };

        // First replace combined characters (like ｶﾞ) using lookahead for the voicing marks
        correction = correction.replace(/[ｶ-ﾄﾊ-ﾎｳﾜｦ][ﾞﾟ]/g, (match) => {
            return kanaMap[match] || match;
        });

        // Then replace the remaining single half-width katakana
        correction = correction.replace(FORMATTING_RULES.halfWidthKatakana.pattern, (match) => {
            return kanaMap[match] || match;
        });

        reasons.push({ text: FORMATTING_RULES.halfWidthKatakana.reason, level: "Critical" });
        isChanged = true;
    }

    // --- WARNING STRINGS (Context Depdendent) ---

    // Rule 3: 表現・表記ゆれの統一ルール（ひらがな・漢字の使い分け等）
    STYLE_DICTIONARY.forEach(rule => {
        if (rule.pattern.test(correction)) {
            const temp = correction.replace(rule.pattern, rule.correct);
            if (temp !== correction) {
                correction = temp;
                if (!reasons.some(r => r.text === rule.reason)) {
                    reasons.push({ text: rule.reason, level: "Warning" });
                }
                isChanged = true;
            }
        }
    });

    // Rule 9: Readability check for consecutive characters (Warning)
    // CORE_RULESに基づく動的な字数制限
    const longHiragana = new RegExp(`[\\u3040-\\u309F]{${CORE_RULES.maxConsecutiveHiragana},}`);
    const longKanji = new RegExp(`[\\u4E00-\\u9FFF]{${CORE_RULES.maxConsecutiveKanji},}`);
    if (longHiragana.test(correction)) {
        reasons.push({ text: "ひらがなが続いて読みにくい可能性があります（例：「だよね」の「ね」の前など、終助詞の直前で改行か半角スペースを入れるか、表記を工夫してください）", level: "Warning" });
        isChanged = true;
    }
    if (longKanji.test(correction)) {
        reasons.push({ text: "漢字が続いて読みにくい可能性があります", level: "Warning" });
        isChanged = true;
    }

    if (isChanged || reasons.length > 0) {
        return {
            text: correction,
            reasons: reasons
        };
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
        // Supports both colons (00:00:00:00) and semicolons for drop-frame (00;00;00;00)
        const timestampMatch = trimmed.match(/^(\d{2}[:;]\d{2}[:;]\d{2}[:;]\d{2})\s*-\s*(\d{2}[:;]\d{2}[:;]\d{2}[:;]\d{2})/);
        if (timestampMatch) {
            currentTimestamp = trimmed;
            return;
        }

        if (trimmed.length === 0) return;

        // Identify Noise (Plugin errors, metadata, empty lines, etc)
        let isNoise = false;
        let noiseReasons: ReasonDetail[] = []; // Changed to array of ReasonDetail

        // 英語のみ・URLのみの行（ASCII文字のみ）もノイズとして扱う
        // → 機械チェック・AIチェック両方の対象から除外される
        const isAsciiOnly = /^[\x00-\x7F]+$/.test(trimmed);
        if (isAsciiOnly) {
            isNoise = true;
            noiseReasons.push({ text: '英語テキスト（無視）', level: 'Info' });
        }

        for (const pattern of NOISE_PATTERNS) {
            if (pattern.regex.test(trimmed)) {
                isNoise = true;
                noiseReasons.push({ text: pattern.reason, level: "Info" }); // Noise is typically "Info" level
                // No break here, as a line might match multiple noise patterns, though unlikely for current patterns
            }
        }

        parsedLines.push({
            id: `line-${index}`,
            timestamp: currentTimestamp,
            originalText: trimmed,
            isNoise,
            reasons: noiseReasons.length > 0 ? noiseReasons : undefined // Assign noise reasons if any
        });

        // 🚨 IMPORTANT: Do NOT apply deterministic rules or duplicate checks to NOISE lines
        if (!isNoise) {
            // Check for Duplicates (Consecutive identical lines)
            // Filter out all noise lines from history to find the true "previous" telop
            const prevValid = parsedLines.slice(0, parsedLines.length - 1).reverse().find(l => !l.isNoise);

            if (prevValid && prevValid.originalText === trimmed) {
                const currentLine = parsedLines[parsedLines.length - 1];
                currentLine.correction = "（重複行です）";
                currentLine.reasons = [{ text: "前の行と内容が重複しています", level: "Warning" }]; // Changed to reasons array
            } else {
                const check = applyDeterministicRules(trimmed);
                if (check) {
                    parsedLines[parsedLines.length - 1].correction = check.text;
                    parsedLines[parsedLines.length - 1].reasons = check.reasons; // Changed to reasons array
                }
            }
        }
    });

    return parsedLines;
};
