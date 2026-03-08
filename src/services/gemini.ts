import { GoogleGenerativeAI } from "@google/generative-ai";
import { LineData } from "../utils/textProcessor";
import { AI_CONTEXT_DICTIONARY } from "../config/dictionaries";

// System Prompt that defines the strict rules
const getSystemPrompt = () => `
あなたはプロフェッショナルなテロップ校正AIです。
以下の「厳格な制作ガイドライン」に基づき、ユーザーが入力したテロップテキストを校正してください。

【重要：ハルシネーション対策】
1. **原文の保持**: 指摘をする際は、必ず「原文の特定の箇所」を引用してください。原文に存在しない言葉を指摘してはいけません。
2. **ノイズの無視**: 意味不明な記号や、明らかに動画の内容と無関係なテキスト（プラグインのエラーなど）が含まれている場合は、修正せず「無視」してください。

【役割】
あなたはテロップの「表現・ニュアンス」を校正するAIです。
**「明らかに間違っている誤字脱字」**や**「読みにくい表記」**のみを指摘してください。
**個人の文体や、口語表現（〜させてもらう、等）は尊重し、勝手に書き換えないでください。**

【プロジェクト固有の用語・人物辞典（判別用）】
以下の人物名や用語が文脈に登場した場合、前後の文脈から同一人物の可能性がないかを判断し、必要に応じて提案してください：
${AI_CONTEXT_DICTIONARY}

【制作ガイドライン】
1. **指示事項**:
    - 原文の「言い間違い（例：上手く言う）」や「同音異義語の誤変換」を見つけることにのみ集中してください。
    - **表記ゆれ（「こと／事」「とき／時」「いく／行く」など）は、全体で統一されていれば漢字・ひらがなどのどちらでも構いません。ただし、今回渡されたテキスト内で明らかに表記が混在している場合は、どちらかに統一するよう提案・指摘してください。**
    - 「何年」「何回」などの助数詞・量を表す言葉や記号・数字についても、別のプログラムで自動修正されるため無視してください。
    - **①②③等の丸付き数字・(1)(2)等の括弧付き数字は、それ自体を指摘しないでください。**
    - **日本の漫画、アニメ、ネットスラングなどのサブカル用語（例：「キセキの世代」など）、意図的なカタカナ表記、一般的な固有名詞は、無理に一般的な日本語（例：奇跡）に直さないでください。**

2. **禁止事項（重要）**:
    - **言葉の言い換えや語尾の変更は絶対禁止**: 「させてもらった」→「させていただいた」、「〜あります」→「〜ある」などのように、意味は同じでも表現や語尾を変える修正は**絶対に行わない**こと。
    - **表記の変更禁止**: ひらがなを漢字にする、漢字をひらがなにするなどの「表記の修正」はあなたの役割ではありません。絶対に行わないでください。
    - **意味の変容禁止**: 原文のニュアンスが変わる修正はしない。

3. **誤字脱字・誤変換の指摘（強化）**:
    - **同音異義語の誤変換**を重点的にチェックせよ。
    - 例：「上手く言っていた（発言）」⇔「上手くいっていた（進行）」
    - **【重要】見慣れない用語やサブカル用語が「誤字」なのか「実在する用語」なのか迷った場合は、あなたに与えられているGoogle検索ツールを使用して事実確認を行ってください。（例：「キセキの世代」を調べてアニメ用語だと分かれば修正しない）**
    - **Google検索を行って未知の用語を補完・確認した場合は、理由（reason）の欄に必ず『Web検索で確認済み (URL: https://...)』のように参照元のURLを併記してください。**
    - 検索等を行っても判断に迷う場合は、「【要確認】〜の可能性はありませんか？」という形式で提案として出力すること。
    - 「上手く言いくるめる」のような正しい表現まで誤検知しないよう注意すること。
    - 明らかな誤入力（変身→返信）は修正せよ。
    - **【数字表記のルール（アラビア数字と漢数字の使い分け）】**
      **「1番」「2番」など、数えられる場合（順位や番号など）の数字は「半角のアラビア数字」が正しい表記です。**
      （◯使用する例：1番、2番目、3つのボタン、第3回、4か月、1億2805万）
      **ただし、慣用句、熟語、固有名詞などの場合は「漢数字」が正しい表記です。**
      （◯使用する例：世界一、一番（副詞としての「もっとも」の意味の場合）、一時的、一部分、第三者、数百倍、四角い、五大陸）
      ※ 原文が半角アラビア数字で「1番」等と正しく書かれているものを、熟語だと誤認して「一番」に修正しないよう特に注意してください。

【出力フォーマット】
修正が必要な行のみを、以下のJSON形式でリストアップしてください。
**「level」フィールドには、以下の基準で "Critical" / "Warning" / "Info" を設定してください。**
    - **Critical**: 誤字脱字、明白な誤変換（意味が変わるもの）、数字・単位の間違い。
    - **Warning**: 表記ゆれ（漢字/ひらがな）、推奨される表記への修正。
    - **Info**: 念のための確認（同音異義語の提案など。※【要確認】として出力した場合など）。

\`\`\`json
[
  {
    "id": "line-ID",
    "original": "元のテキスト",
    "corrected": "修正後のテキスト（または【要確認】の提案文）",
    "reason": "修正理由（簡潔に。前置き不要）",
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

export async function checkTeopWithGemini(
    apiKey: string,
    lines: LineData[],
    onProgress?: (current: number, total: number) => void
) {
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

        // 2. Sort them by preference (Newer/Pro > Older/Flash)
        // User explicitly requested to prioritize 'Pro' models over 'Flash' for maximum accuracy.
        const prioritize = (name: string) => {
            // 1st: The absolute best latest aliases
            if (name === 'gemini-pro-latest') return 120;

            // 2nd: The explicit new flagship Pro model
            if (name === 'gemini-3.1-pro-preview') return 110;

            // 3rd: The latest flash model
            if (name === 'gemini-flash-latest') return 100;

            // Filter out unwanted sub-variants (lite, audio, tts, vision, etc.)
            if (name.includes('lite') || name.includes('audio') || name.includes('tts') || name.includes('vision') || name.includes('think')) {
                return 0;
            }

            // 3rd: Current stable models
            if (name === 'gemini-2.5-pro') return 90;

            // Fallbacks (Flash models)
            if (name === 'gemini-3.0-flash') return 80;
            if (name === 'gemini-2.5-flash') return 70;
            if (name === 'gemini-1.5-pro') return 60;
            if (name === 'gemini-1.5-flash') return 50;
            if (name === 'gemini-1.0-pro') return 40;

            return 0; // Filter out everything else
        };

        modelsToTry = validModels.sort((a: string, b: string) => prioritize(b) - prioritize(a));

        console.log("Dynamically discovered models:", modelsToTry);

    } catch (e) {
        console.warn("Failed to list models dynamically, falling back to static list.", e);
        // Fallback list if listing fails
        modelsToTry = [
            "gemini-3.1-pro-preview",
            "gemini-2.5-pro",
            "gemini-3.0-flash",
            "gemini-2.5-flash",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
            "gemini-1.0-pro"
        ];
    }

    if (modelsToTry.length === 0) {
        throw new Error("No compatible Gemini models found for this API Key.");
    }

    // Filter only meaningful lines
    const validLines = lines.filter(l => !l.isNoise);
    if (validLines.length === 0) return [];

    let allCorrections: any[] = [];
    let lastError;
    const CHUNK_SIZE = 80; // 80 lines per API request to minimize total requests (Free tier limit is 15 RPM)

    let workingModel: any = null;
    let workingModelName = "";

    if (onProgress) {
        onProgress(0, validLines.length);
    }

    for (let i = 0; i < validLines.length; i += CHUNK_SIZE) {
        const chunk = validLines.slice(i, i + CHUNK_SIZE);
        const inputJson = chunk.map(l => ({
            id: l.id,
            text: l.originalText
        }));

        const userPrompt = `
以下のテロップリストを校正してください。

${JSON.stringify(inputJson, null, 2)}
`;

        let chunkSuccess = false;
        const modelsLoop = workingModel ? [workingModelName] : modelsToTry;

        for (const modelName of modelsLoop) {
            try {
                if (!workingModel) {
                    console.log(`Attempting with model: ${modelName} and Google Search Tool`);
                }
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    tools: [{ googleSearch: {} } as any] // Enable Google Search Grounding
                });

                // Add a small delay between chunks to avoid rate limit spikes (RPM limit mitigation)
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒待機してゆっくりリクエスト
                }

                const result = await model.generateContent([getSystemPrompt(), userPrompt]);
                const response = result.response;
                const text = response.text();

                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                let json = [];
                try {
                    json = JSON.parse(cleanText);
                } catch (parseError) {
                    console.error("JSON Parse Error for chunk:", cleanText);
                    // Skip invalid JSON chunks gracefully
                    json = [];
                }

                const realCorrections = Array.isArray(json) ? json.filter((item: any) => {
                    const original = item.original || "";
                    const corrected = item.corrected || "";
                    return original.trim() !== corrected.trim();
                }) : [];

                allCorrections.push(...realCorrections);

                if (!workingModel) {
                    workingModel = model;
                    workingModelName = modelName;
                }

                chunkSuccess = true;
                break; // Model success, move to next chunk

            } catch (error: any) {
                console.warn(`Failed chunk with ${modelName}:`, error.message);
                lastError = error;
                // If working model fails (e.g., 429 Error), unset it to try fallback models
                if (workingModel) {
                    workingModel = null;
                }
            }
        } // End models loop

        if (!chunkSuccess) {
            console.error("All models failed for a chunk.");
            throw lastError || new Error("Chunk processing failed on all models.");
        }

        if (onProgress) {
            const currentProcessed = Math.min(i + CHUNK_SIZE, validLines.length);
            onProgress(currentProcessed, validLines.length);
        }
    } // End chunks loop

    return allCorrections;
}
