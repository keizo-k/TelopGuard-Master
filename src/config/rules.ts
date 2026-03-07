/**
 * ============================================================================
 * TelopGuard 校正ルール設定ファイル (Formatting & Grammar Rules)
 * ============================================================================
 * 
 * ⚠️ 【編集注意】 ⚠️
 * このファイルには、TelopGuardの「機械的な文字校正（正規表現ルール）」が定義されています。
 * 辞書（dictionaries.ts）とは異なり、プログラムの挙動そのものを制御する正規表現が含まれます。
 * 構造を誤るとシステムがエラーで止まる可能性があるため、追加・編集には十分ご注意ください。
 */

export const FORMATTING_RULES = {
    // ---------------------------------------------------------
    // 0. 基本フォーマット（Critical）
    // ---------------------------------------------------------

    // Rule 0.1: 全角スペースを半角スペースに変換
    fullWidthSpace: {
        pattern: /　/g,
        replacement: ' ',
        reason: "空白は半角"
    },

    // Rule 0.2: 句読点（、。）の削除・スペース化
    punctuation: {
        pattern: /[、。]/g,
        replaceMaru: { pattern: /。/g, replacement: '' },
        replaceTen: { pattern: /、/g, replacement: ' ' },
        reason: "句読点は使わない"
    },

    // Rule 0.3: 連続する半角スペースを1つにまとめる
    consecutiveSpaces: {
        pattern: / {2,}/g,
        replacement: ' ',
        reason: "空白は連続しない"
    },

    // Rule 1: 全角数字を半角数字に変換
    fullWidthNumbers: {
        pattern: /[０-９]/g,
        reason: "数字は半角"
    },

    // Rule 1.5: 全角ピリオド・カンマの半角化
    // ユーザー指定: 1.1 や 2,000 などの数字でしか使わないため半角統一
    fullWidthPeriodComma: {
        pattern: /[．，]/g,
        replacePeriod: { pattern: /．/g, replacement: '.' },
        replaceComma: { pattern: /，/g, replacement: ',' },
        reason: "ピリオドとカンマは半角"
    },

    // Rule 1.6: 全角コロン・スラッシュの半角化
    // ユーザー指定: 全角コロン(：)とスラッシュ(／)は使わないため半角統一
    fullWidthColonSlash: {
        pattern: /[：／]/g,
        replaceColon: { pattern: /：/g, replacement: ':' },
        replaceSlash: { pattern: /／/g, replacement: '/' },
        reason: "コロンとスラッシュは半角"
    },

    // Rule 2: 半角記号を全角記号に変換
    // ⚠️ 【開発者向け注意】 ⚠️
    // ここにある正規表現（pattern）は「画面上でどの記号を検知してハイライトするか」のためだけに存在します。
    // 実際の「半角→全角」への変換ロジック（例外判定や文字コードの置換）は、
    // `textProcessor.ts` の `halfWidthSymbolsToFull` のブロック内に直接ハードコーディングされています。
    // もし『この記号は全角化の対象から外したい』等の仕様変更があった場合は、
    // 1. このファイルの正規表現から該当記号を削除する
    // 2. `textProcessor.ts` 内の例外判定（charCodeのループ等）もあわせて書き換える
    // という「2箇所の修正」がセットで必要になる点に注意してください。
    // ※ 現在、ピリオド(.)、カンマ(,)、コロン(:)、スラッシュ(/)は半角統一のため全角化から除外済です。
    halfWidthSymbolsToFull: {
        pattern: /[!"#$%&'()*+\-;<=>?@[\\\]^_`{|}~]/,
        reason: "一般記号は全角"
    },

    // Rule 2.5: 半角カタカナを全角カタカナに変換
    halfWidthKatakana: {
        pattern: /[ｦ-ﾟ]/g,
        reason: "カタカナは全角"
    }
};
