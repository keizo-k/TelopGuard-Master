import { GoogleGenerativeAI } from "@google/generative-ai";
import { LineData } from "../utils/textProcessor";

// System Prompt that defines the strict rules
const SYSTEM_PROMPT = `
あなたはプロフェッショナルなテロップ校正AIです。
以下の「厳格な制作ガイドライン」に基づき、ユーザーが入力したテロップテキストを校正してください。

【重要：ハルシネーション対策】
1. **原文の保持**: 指摘をする際は、必ず「原文の特定の箇所」を引用してください。原文に存在しない言葉を指摘してはいけません。
2. **ノイズの無視**: 意味不明な記号や、明らかに動画の内容と無関係なテキスト（プラグインのエラーなど）が含まれている場合は、修正せず「無視」してください。

【役割】
あなたはテロップの「表現・ニュアンス」を校正するAIです。
**「明らかに間違っている誤字脱字」**や**「読みにくい表記」**のみを指摘してください。
**個人の文体や、口語表現（〜させてもらう、等）は尊重し、勝手に書き換えないでください。**

【制作ガイドライン】
    - 「〜という」「〜こと」「〜とき」などの**形式名詞**はひらがなにする。
    - **補助動詞**（〜していく、〜してくる、〜していただく、〜してほしい）はひらがなにする。
    - 特に**「上手くいく（成功する）」の「いく」はひらがな**にする。「上手く行く」や「上手く言う（誤変換）」は修正対象。
    - **漢字で一般的なもの（頃、位、等）は無理にひらがなにしない。**
    - 動詞としての「言う」「事（事実）」「時（特定の時点）」は漢字のままにする。

2. **禁止事項（重要）**:
    - **言葉の言い換え禁止**: 「させてもらった」→「させていただいた」のように、丁寧語や言い回しを変える修正は**絶対に行わない**こと。
    - **意味の変容禁止**: 原文のニュアンスが変わる修正はしない。

3. **誤字脱字・誤変換の指摘（強化）**:
    - **同音異義語の誤変換**を重点的にチェックせよ。
    - 例：「上手く言っていた（発言）」⇔「上手くいっていた（進行）」
    - **【重要】断定できない場合は、「要確認：〜の可能性はありませんか？」という形式で提案すること。**
    - 「上手く言いくるめる」のような正しい表現まで誤検知しないよう注意すること。
    - 明らかな誤入力（変身→返信）は修正せよ。

【出力フォーマット】
修正が必要な行のみを、以下のJSON形式でリストアップしてください。
**「level」フィールドには、以下の基準で "Critical" / "Warning" / "Info" を設定してください。**
    - **Critical**: 誤字脱字、明白な誤変換（意味が変わるもの）、数字・単位の間違い。
    - **Warning**: 表記ゆれ（漢字/ひらがな）、推奨される表記への修正。
    - **Info**: 念のための確認（同音異義語の提案など）。

\`\`\`json
[
  {
    "id": "line-ID",
    "original": "元のテキスト",
    "corrected": "修正後のテキスト",
    "reason": "修正理由（簡潔に）",
    "level": "Critical"
  }
]
\`\`\`
`;

// Helper to list available models for debugging
export async function listAvailableModels(apiKey: string) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Connection Failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        return data.models || [];
    } catch (error) {
        console.error("List Models Error:", error);
        throw error;
    }
}

export async function checkTeopWithGemini(apiKey: string, lines: LineData[]) {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Dynamic Model Discovery Strategy
    // Instead of a hardcoded list that might 404, we fetch available models first.
    let modelsToTry: string[] = [];

    try {
        // 1. Try to fetch models dynamically
        const availableModels = await listAvailableModels(apiKey);
        const validModels = availableModels
            .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
            .map((m: any) => m.name.replace('models/', ''));

        // 2. Sort them by preference (Newer > Older)
        // We prioritize 'flash' models for speed, then 'pro'.
        const prioritize = (name: string) => {
            if (name.includes('gemini-2.0-flash')) return 10;
            if (name.includes('gemini-1.5-flash')) return 9;
            if (name.includes('gemini-1.5-pro')) return 8;
            if (name.includes('gemini-1.0-pro')) return 7;
            return 0;
        };

        modelsToTry = validModels.sort((a: string, b: string) => prioritize(b) - prioritize(a));

        console.log("Dynamically discovered models:", modelsToTry);

    } catch (e) {
        console.warn("Failed to list models dynamically, falling back to static list.", e);
        // Fallback list if listing fails
        modelsToTry = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.0-pro"
        ];
    }

    if (modelsToTry.length === 0) {
        throw new Error("No compatible Gemini models found for this API Key.");
    }

    // Filter only meaningful lines
    const validLines = lines.filter(l => !l.isNoise);
    if (validLines.length === 0) return [];

    const inputJson = validLines.map(l => ({
        id: l.id,
        text: l.originalText
    }));

    const userPrompt = `
以下のテロップリストを校正してください。

${JSON.stringify(inputJson, null, 2)}
`;

    let lastError;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent([SYSTEM_PROMPT, userPrompt]);
            const response = result.response;
            const text = response.text();

            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const json = JSON.parse(cleanText);

            // Strict Filter: Remove corrections that are identical to original
            // This prevents "False Positives" where AI flags text that is already correct
            const realCorrections = json.filter((item: any) => {
                const original = item.original || "";
                const corrected = item.corrected || "";
                // Ignore if identical (ignoring minor whitespace differences?)
                // Let's stick to simple trim() equality for now. 
                // If user wants strict punctuation removal, whitespace matters, but for "Hiragana", it shouldn't.
                // However, our Deterministic rules handle punctuation.
                return original.trim() !== corrected.trim();
            });

            return realCorrections;

        } catch (error: any) {
            console.warn(`Failed with ${modelName}:`, error.message);
            lastError = error;
            // Continue to next model
        }
    }

    // If all failed
    console.error("All models failed.");
    throw lastError;
}
