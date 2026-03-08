/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                // デフォルトフォントを可読性の高いゴシック体（等幅ベース）に設定
                sans: [
                    '"BIZ UDGothic"', '"Hiragino Kaku Gothic ProN"', '"Hiragino Sans"', 'Meiryo', 'sans-serif'
                ],
                // プレビューエリアなどで特に全角半角の判別が重要な箇所は強制的に等幅
                mono: [
                    '"BIZ UDMincho"', 'Menlo', 'Monaco', 'Consolas', '"Courier New"', 'monospace'
                ],
            }
        },
    },
    plugins: [],
}
