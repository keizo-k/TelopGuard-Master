/**
 * ============================================================================
 * TelopGuard 辞書設定ファイル (Dictionaries Configuration)
 * ============================================================================
 * 
 * このファイルは、非エンジニアの担当者でも安全に辞書（用語の自動修正やAIへの事前知識）
 * を追加・編集できるように用意された設定ファイルです。
 * 
 * 【編集方法】
 * 1. 既存の行をコピーして貼り付け、中身を書き換えてください。
 * 2. 編集後は保存（コミット＆デプロイ）するだけで、全員の TelopGuard に即座に反映されます。
 */


// ==========================================
// 1. 機械的チェック用 固有名詞辞書 (絶対表記ルール)
// ==========================================
// ここに登録された単語は、前後の文脈にかかわらず「強制的に絶対正しい表記に書き換え」られます。
// ※ 主に英語の大文字小文字や、固有名詞の表記ゆれ防止に使います。
export const DETERMINISTIC_DICTIONARY = [
  { pattern: /ストックサン|ｓｔｏｃｋｓｕｎ|stocksun/ig, correct: 'StockSun', reason: '固有名詞の正しい表記' },
  { pattern: /アオササ/g, correct: '青笹', reason: '固有名詞の正しい表記（表記ゆれ防止）' },
  { pattern: /レベラ/g, correct: 'Levela', reason: '法人の公式表記' },
  { pattern: /Yutori|YUTORI/g, correct: 'yutori', reason: '法人の公式表記 (小文字)' },
  { pattern: /ハーリップツー/g, correct: 'Her lip to', reason: 'ブランドの公式表記' },
  { pattern: /株式会社あおのくらし/g, correct: '株式会社あおの暮らし', reason: '法人の公式表記' },
  { pattern: /NewsPicks|ＮｅｗｓＰｉｃｋｓ|ニュースピックス/ig, correct: 'NewsPicks', reason: 'サービス名の公式表記' },
  { pattern: /Instagram|インスタグラム/ig, correct: 'Instagram', reason: 'サービス名の公式表記' }, // ※「インスタ」は「インスタント」等に誤爆するため除外

  // --- 著名人・インフルエンサー表記 ---
  { pattern: /近藤春樹/g, correct: 'コウドウハルキ', reason: '固有名詞の誤変換修正' },
  { pattern: /サコユウキ/g, correct: '迫佑樹', reason: '固有名詞の正しい表記' },
  { pattern: /サコさん/g, correct: '迫さん', reason: '固有名詞の正しい表記' },
  { pattern: /リョウ学長/g, correct: '両学長', reason: '固有名詞の正しい表記' },
  { pattern: /マコなり/g, correct: 'マコなり社長', reason: '固有名詞の正しい表記' },
  { pattern: /けんすう/g, correct: 'けんすう', reason: '固有名詞の正しい表記' },
  { pattern: /ロジン/g, correct: 'ろじん', reason: '固有名詞の誤変換修正' },
  { pattern: /キタハラ/g, correct: '北原', reason: '固有名詞の正しい表記' },
  { pattern: /レペゼン地球/g, correct: 'Repezen Foxx', reason: 'グループ名は現在の公式英語表記推奨' },
  { pattern: /ディージェー社長/g, correct: 'DJ社長', reason: '固有名詞の正しい表記' },
  { pattern: /ヒカキン/g, correct: 'HIKAKIN', reason: 'アルファベット表記推奨' },
  { pattern: /セイキン/g, correct: 'SEIKIN', reason: 'アルファベット表記推奨' },
  { pattern: /はじめ(?:社長|シャチョー)/g, correct: 'はじめしゃちょー', reason: '固有名詞の誤変換修正' }, // ※ /はじめしゃちょー/g そのままだと変換意味がないため、よくある誤記を列挙
  { pattern: /ラファエル/g, correct: 'ラファエル', reason: '固有名詞の正しい表記' },
  { pattern: /コムドット/g, correct: 'コムドット', reason: '固有名詞の正しい表記' },
  { pattern: /東海オンエア/g, correct: '東海オンエア', reason: '固有名詞の正しい表記' },
  { pattern: /カジサック/g, correct: 'カジサック', reason: '固有名詞の正しい表記' },

  { pattern: /ユーチューバー/g, correct: 'YouTuber', reason: '大文字混じり（CamelCase）推奨' },
  { pattern: /YouTube/ig, correct: 'YouTube', reason: 'サービス名の公式表記' },
  { pattern: /プレミアプロ/g, correct: 'Adobe Premiere Pro', reason: '製品の公式表記' }, // ※単なる「プレミア」は「プレミア価格」などに大誤爆するため「プレミアプロ」で指定
  { pattern: /チャットジーピーティー/g, correct: 'ChatGPT', reason: 'サービス名の公式表記' },

  // CAMPシリーズ
  { pattern: /動画編集(?:camp|ｃａｍｐ|キャンプ)/ig, correct: '動画編集CAMP', reason: 'サービス名の公式表記' },
  { pattern: /サムネイル(?:camp|ｃａｍｐ|キャンプ)/ig, correct: 'サムネイルCAMP', reason: 'サービス名の公式表記' },
  { pattern: /(?:YouTube|ユーチューブ|ゆーちゅーぶ)台本(?:camp|ｃａｍｐ|キャンプ)/ig, correct: 'YouTube台本CAMP', reason: 'サービス名の公式表記' },
  { pattern: /ディレクター(?:camp|ｃａｍｐ|キャンプ)/ig, correct: 'ディレクターCAMP', reason: 'サービス名の公式表記' },
  { pattern: /ショート動画(?:camp|ｃａｍｐ|キャンプ)/ig, correct: 'ショート動画CAMP', reason: 'サービス名の公式表記' },
  { pattern: /(?:YouTube|ユーチューブ|ゆーちゅーぶ)マーケ(?:camp|ｃａｍｐ|キャンプ)/ig, correct: 'YouTubeマーケCAMP', reason: 'サービス名の公式表記' },
  { pattern: /(?:camp|ｃａｍｐ|キャンプ)マッチング/ig, correct: 'CAMPマッチング', reason: 'サービス名の公式表記' },

  // Hacksシリーズ
  { pattern: /株式会社(?:ブレイン|ｂｒａｉｎ|Brain)/ig, correct: '株式会社ブレイン', reason: '法人の公式表記' },
  { pattern: /(?<!株式会社)ブレイン/g, correct: 'Brain', reason: 'サービス名の公式表記' }, // "Brain"の英字単体は一般名詞と被るためカタカナのみ設定
  { pattern: /ティップス/g, correct: 'Tips', reason: 'サービス名の公式表記' },
  { pattern: /Programming(?:\s*)?Hacks|プログラミングハックス/ig, correct: 'ProgrammingHacks', reason: 'サービス名の公式表記' },
  { pattern: /Movie(?:\s*)?Hacks|ムービーハックス/ig, correct: 'MovieHacks', reason: 'サービス名の公式表記' },
  { pattern: /Design(?:\s*)?Hacks|デザインハックス/ig, correct: 'DesignHacks', reason: 'サービス名の公式表記' },
  { pattern: /Writing(?:\s*)?Hacks|ライティングハックス/ig, correct: 'WritingHacks', reason: 'サービス名の公式表記' },

  // StockSun道場シリーズ
  { pattern: /(?:LINE|ライン|ＬＩＮＥ)道場/ig, correct: 'LINE道場', reason: 'サービス名の公式表記' },
  { pattern: /動画編集道場(?:PRO|ｐｒｏ|プロ|プロ)/ig, correct: '動画編集道場PRO', reason: 'サービス名の公式表記' },
  { pattern: /道場プロ/g, correct: '動画編集道場PRO', reason: 'サービス名の公式略称' },
  { pattern: /(?:YouTube|ユーチューブ|ゆーちゅーぶ)ディレクター道場/ig, correct: 'YouTubeディレクター道場', reason: 'サービス名の公式表記' },
  { pattern: /(?:YouTube|ユーチューブ|ゆーちゅーぶ)撮影道場/ig, correct: 'YouTube撮影道場', reason: 'サービス名の公式表記' },
  { pattern: /Tech(?:\s*)?Elite|テックエリート/ig, correct: 'TechElite', reason: 'サービス名の公式表記' },
  { pattern: /(?:LP|ＬＰ|エルピー)デザイン道場/ig, correct: 'LPデザイン道場', reason: 'サービス名の公式表記' },
  { pattern: /(?:AI|ＡＩ|エーアイ)道場/ig, correct: 'AI道場', reason: 'サービス名の公式表記' },

  { pattern: /高橋帝国/g, correct: '高橋帝国', reason: 'コミュニティ名の公式表記' },

  // 動画デザイン道場、広告運用道場、案件獲得道場は表記ゆれしにくいためそのままAI辞書ベースで運用

  // ⬇⬇ ここに新しい単語を追加できます ⬇⬇
  // 例: { pattern: /元の間違ったテキスト/g, correct: '正しいテキスト', reason: '追加した理由' },
  { pattern: /シュミレーション/g, correct: 'シミュレーション', reason: '誤変換防止（標準表記）' },
  { pattern: /コミニュケーション/g, correct: 'コミュニケーション', reason: '誤変換防止（標準表記）' },
  { pattern: /ウィルス/g, correct: 'ウイルス', reason: '誤変換防止（標準表記）' },
  { pattern: /ファイヤーウォール/g, correct: 'ファイアウォール', reason: '誤変換防止（標準表記）' },
  { pattern: /サーバ(?!ー)/g, correct: 'サーバー', reason: '長音推奨' },
  { pattern: /ユーザ(?!ー)/g, correct: 'ユーザー', reason: '長音推奨' },

  { pattern: /的を得る/g, correct: '的を射る', reason: '慣用句の誤用是正' },
  { pattern: /一同に会する/g, correct: '一堂に会する', reason: '慣用句の誤用是正' },
  { pattern: /一役を担う/g, correct: '一翼を担う', reason: '慣用句の誤用是正（「一役買う」との混同）' },
  { pattern: /明るみになる/g, correct: '明るみに出る', reason: '慣用句の誤用是正' },

  { pattern: /ずらい/g, correct: 'づらい', reason: '「〜しづらい（辛い）」の誤記（見ずらい等）' },
  { pattern: /ずらかっ/g, correct: 'づらかっ', reason: '「〜しづらい（辛い）」の誤記（見ずらかった等）' },
  { pattern: /ずらく/g, correct: 'づらく', reason: '「〜しづらい（辛い）」の誤記（見ずらくて等）' },
  { pattern: /ずらけれ/g, correct: 'づらけれ', reason: '「〜しづらい（辛い）」の誤記（見ずらければ等）' },
];


// ==========================================
// 1.5 表現・表記ゆれの統一ルール（Warning レベル）
// ==========================================
// ここに登録したものは、絶対的なエラー（赤色）ではなく推奨（黄色）として警告されます。
// 正規表現 /〜/g を使って「〜して頂く」等の柔軟な検知も可能です。
export const STYLE_DICTIONARY = [
  // --- ひらがなで書く ---
  { pattern: /(?<=[0-9０-９一二三四五六七八九十百千万億兆何数])(ヵ|か|カ|ヶ|ケ|箇|個)(月|所|国|年)/g, correct: 'か$2', reason: '助数詞の「か」はひらがな表記推奨（〜か月、〜か所など）' },
  { pattern: /予め/g, correct: 'あらかじめ', reason: '「あらかじめ」はひらがな表記推奨' },
  { pattern: /何れ/g, correct: 'いずれ', reason: '「いずれ」はひらがな表記推奨' },
  { pattern: /何時/g, correct: 'いつ', reason: '「いつ」の意味ならひらがな推奨（「なんじ」の場合は要確認）' },
  { pattern: /凡そ/g, correct: 'およそ', reason: '「およそ」はひらがな表記推奨' },
  { pattern: /徐に/g, correct: 'おもむろに', reason: '「おもむろに」はひらがな表記推奨' },
  { pattern: /却って/g, correct: 'かえって', reason: '「かえって」はひらがな表記推奨' },
  { pattern: /且つ/g, correct: 'かつ', reason: '接続詞「かつ」はひらがな表記推奨' },
  { pattern: /かも知れない/g, correct: 'かもしれない', reason: '「かもしれない」はひらがな表記推奨' },
  { pattern: /(て|で)下さい/g, correct: '$1ください', reason: '補助動詞の「ください」はひらがな表記推奨' },
  { pattern: /これ程/g, correct: 'これほど', reason: '「これほど」はひらがな表記推奨' },
  { pattern: /御(覧|意見|質問|案内|相談|連絡|返事|挨拶|礼)/g, correct: 'ご$1', reason: '接頭語の「御」はひらがな表記推奨' },
  { pattern: /(という)事/g, correct: '$1こと', reason: '形式名詞の「事」はひらがな表記推奨' },
  { pattern: /子供|こども/g, correct: '子ども', reason: '「子ども」は交ぜ書き推奨' },
  { pattern: /更に/g, correct: 'さらに', reason: '「さらに」はひらがな表記推奨' },
  { pattern: /然し/g, correct: 'しかし', reason: '「しかし」はひらがな表記推奨' },
  { pattern: /暫く/g, correct: 'しばらく', reason: '「しばらく」はひらがな表記推奨' },
  { pattern: /即ち/g, correct: 'すなわち', reason: '「すなわち」はひらがな表記推奨' },
  { pattern: /可き/g, correct: 'べき', reason: '「べき」はひらがな表記推奨' },
  { pattern: /折角/g, correct: 'せっかく', reason: '「せっかく」はひらがな表記推奨' },
  { pattern: /度々/g, correct: 'たびたび', reason: '「たびたび」はひらがな表記推奨' },
  { pattern: /但し/g, correct: 'ただし', reason: '「ただし」はひらがな表記推奨' },
  { pattern: /(先生|人|子ども|女性|男性|俺|僕|私)達/g, correct: '$1たち', reason: '接尾語の「達」はひらがな表記推奨' },
  { pattern: /(する|た|な)為/g, correct: '$1ため', reason: '形式名詞の「為」はひらがな表記推奨' },
  { pattern: /出来る/g, correct: 'できる', reason: '「できる」はひらがな表記推奨' },
  { pattern: /何処/g, correct: 'どこ', reason: '「どこ」はひらがな表記推奨' },
  { pattern: /乃至/g, correct: 'ないし', reason: '「ないし」はひらがな表記推奨' },
  { pattern: /尚(?![古])/g, correct: 'なお', reason: '「なお」はひらがな表記推奨（尚古等の熟語を除く）' },
  { pattern: /中々/g, correct: 'なかなか', reason: '「なかなか」はひらがな表記推奨' },
  { pattern: /(先|これ|それ|あれ|どれ)程/g, correct: '$1ほど', reason: '助詞の「ほど」はひらがな表記推奨' },
  { pattern: /又は/g, correct: 'または', reason: '「または」はひらがな表記推奨' },
  { pattern: /寧ろ/g, correct: 'むしろ', reason: '「むしろ」はひらがな表記推奨' },
  { pattern: /滅多に/g, correct: 'めったに', reason: '「めったに」はひらがな表記推奨' },
  { pattern: /最早/g, correct: 'もはや', reason: '「もはや」はひらがな表記推奨' },
  { pattern: /若しくは/g, correct: 'もしくは', reason: '「もしくは」はひらがな表記推奨' },
  { pattern: /以(て|って)/g, correct: 'もって', reason: '「もって」はひらがな表記推奨' },
  { pattern: /(る|た|ない|の)様に/g, correct: '$1ように', reason: '「ように」はひらがな表記推奨' },
  { pattern: /余程/g, correct: 'よほど', reason: '「よほど」はひらがな表記推奨' },
  { pattern: /(じゃ|では)無い/g, correct: '$1ない', reason: '形式名詞の「無い」はひらがな表記推奨' },
  { pattern: /(て|やらせて|させて)頂く/g, correct: '$1いただく', reason: '補助動詞「頂く」はひらがな表記推奨' },
  { pattern: /(て|して)欲しい/g, correct: '$1ほしい', reason: '補助動詞「欲しい」はひらがな表記推奨' },
  { pattern: /(て)良い/g, correct: '$1よい', reason: '補助動詞「良い」はひらがな表記推奨（※「〜としても良い」など主語的な用法は対象外）' },
  { pattern: /(て|上手く)行く/g, correct: '$1いく', reason: '補助動詞「行く」はひらがな表記推奨' },
  { pattern: /([^し]て|^て)来る/g, correct: '$1くる', reason: '補助動詞「来る」はひらがな表記推奨（※「として来る」「上位互換として来る」等は対象外）' },
  { pattern: /(と)言うのは/g, correct: '$1いうのは', reason: '形式名詞「いうのは」はひらがな表記推奨' },

  // --- 漢字で書く ---
  { pattern: /いっさい/g, correct: '一切', reason: '「一切」は漢字表記推奨' },
  { pattern: /かならず/g, correct: '必ず', reason: '「必ず」は漢字表記推奨' },
  { pattern: /おおいに/g, correct: '大いに', reason: '「大いに」は漢字表記推奨' },
  { pattern: /しいて/g, correct: '強いて', reason: '「強いて」は漢字表記推奨' },
  { pattern: /(世界|一日|一年|一晩)じゅう/g, correct: '$1中', reason: '「〜中」等の接尾語は漢字表記推奨' },
  { pattern: /なにしろ/g, correct: '何しろ', reason: '「何しろ」は漢字表記推奨' },
  { pattern: /なにも/g, correct: '何も', reason: '「何も」は漢字表記推奨' },
  { pattern: /なんらかの/g, correct: '何らかの', reason: '「何らかの」は漢字表記推奨' },
  { pattern: /なんとも/g, correct: '何とも', reason: '「何とも」は漢字表記推奨' },

  // --- 漢字を使い分ける ---
  { pattern: /個所/g, correct: 'か所', reason: '「か所」の表記推奨（個は表外音）' },
  { pattern: /個条書き/g, correct: '箇条書き', reason: '「箇条書き」の表記推奨（個は表外音）' },
  { pattern: /附属/g, correct: '付属', reason: '一般動詞としては「付属」表記推奨' },
  { pattern: /磨耗/g, correct: '摩耗', reason: 'こする意味は「摩」を使用' },
  { pattern: /磨滅/g, correct: '摩滅', reason: 'こする意味は「摩」を使用' },

  // --- 品詞・意味で使い分ける ---
  { pattern: /及び/g, correct: 'および', reason: '接続詞「および」はひらがな表記推奨' },
  { pattern: /致します/g, correct: 'いたします', reason: '補助動詞「いたします」はひらがな表記推奨' },
  { pattern: /従って/g, correct: 'したがって', reason: '接続詞「したがって」はひらがな表記推奨（動詞「従う」は漢字）' },
  { pattern: /(動き|笑い|歩き|走り|泣き|怒り|考え)出す/g, correct: '$1だす', reason: '「〜し始める」の意味の「〜だす」はひらがな表記推奨' },
  { pattern: /(探し|見つけ|絞り|引っ張り)だす/g, correct: '$1出す', reason: '「出す」の実質的意味を含む場合は漢字表記推奨' },
  { pattern: /(活気|色|元気づ|気づ)付く/g, correct: '$1づく', reason: '接尾語「〜づく」はひらがな表記推奨' },
  { pattern: /凍り付く/g, correct: '凍りつく', reason: '接尾語「〜つく」はひらがな表記推奨' },
  { pattern: /(目|手|顔|体|身体)付き/g, correct: '$1つき', reason: '接尾語「〜つき」はひらがな表記推奨' },
  { pattern: /(思った|以下の|予定|指示|希望|言う)通り/g, correct: '$1とおり', reason: '形式名詞的な「とおり」はひらがな表記推奨' },

  { pattern: /(て|(?<=[んい])で)る/g, correct: '$1いる', reason: 'い抜き言葉の可能性' },
  { pattern: /(て|(?<=[んい])で)て/g, correct: '$1いて', reason: 'い抜き言葉の可能性' },
  { pattern: /(て|(?<=[んい])で)ない/g, correct: '$1いない', reason: 'い抜き言葉の可能性' },
  { pattern: /(っ)て(る|て|ない)/g, correct: '$1てい$2', reason: 'い抜き言葉の可能性' },
  { pattern: /(?<![らわやん疲忘入溢こぼも崩打折切割売取漏廃たた])(れ)れば/g, correct: 'られれば', reason: 'ら抜き言葉・口語表現の可能性' },
  { pattern: /([^ら])(せ|させ)れる/g, correct: '$1$2られる', reason: 'ら抜き言葉・口語表現の可能性' },
  { pattern: /(させ)れた/g, correct: '$1られた', reason: 'ら抜き言葉・口語表現の可能性' },
  { pattern: /(させ)れて/g, correct: '$1られて', reason: 'ら抜き言葉・口語表現の可能性' },
  { pattern: /(き)てた/g, correct: '$1ていた', reason: 'い抜き言葉（きてた→きていた）の可能性' },
  { pattern: /(き)てる/g, correct: '$1ている', reason: 'い抜き言葉（きてる→きている）の可能性' },
  { pattern: /(は|に|が|を|の)\1/g, correct: '$1', reason: '誤記の可能性（連続ひらがな）。※「母」などの例外あり' }
];

// ==========================================
// 2. AIの文脈チェック用 人物・用語辞典（インプット情報）
// ==========================================
// ここに登録された情報は、AIが「前後の文脈を読んで意味を判断する」ための事前知識として使われます。
// ※ 上記1の機械的チェックでは危険な（別の意味で使われる可能性がある）同音異義語や、同名の別人物などを箇条書きで追加してください。
export const AI_CONTEXT_DICTIONARY = `
==========================================================
【A】 人物情報 ― スキル獲得チャンネル・動画業界界隈
==========================================================

■ 青笹家 / あおの暮らし関連
- あおさん（男性）／あおさささん：本名は青笹寛史（あおささ ひろふみ、1996-2025年没）。アズール株式会社・KIBUN株式会社代表取締役。島根大学医学部卒の医師免許保持者だが動画マーケティング市場にコミット。「動画編集CAMP」を主宰し全国展開。「令和の虎」にも虎として出演。スキル獲得チャンネルの共同運営者だった。
- あにさささん（兄笹さん）：本名は青笹雅史（あおささ まさふみ）。亡くなった青笹寛史の兄。現アズール株式会社社長。
- あおさん／あおちゃん（女性）：本名は大池笑美。株式会社あおの暮らし代表、YouTuber。大学生時代のInstagram運用で一躍有名に。後に自身の会社を株式会社Levelaに事業売却（M&A）し、Levelaに参画した。
- 駒居さん（駒居康樹）：株式会社Levela代表取締役。SNS教育事業を展開し、「あおの暮らし」を買収し完全子会社化した。
- 高橋さん（高橋健太）：元ZOZO・東京モード学園講師。クリエイター育成スクール【高橋帝国】主宰。令和の虎 完全ALL達成。（あお社長の右腕的存在）

■ 迫佑樹（Brain/Hacks）関連
- 迫さん（迫佑樹）：コンテンツ販売サイト「Brain」代表取締役、教育サービス「Hacks」シリーズ運営。24歳で10億円規模の会社を作り、現在も教育事業やプラットフォーム事業を展開。「人生は出会いで変わる」という理念を持つ。

■ StockSun関連
- 株本さん（株本祐己）：StockSun株式会社 創業者。フリーランス名鑑など運営。年収チャンネル。
- StockSun道場 各種講師陣：
  - 鳥屋さん（鳥屋直弘）：YouTubeディレクター道場・YouTube撮影道場 責任者。
  - 金田さん（金田修平）：広告運用道場 講師。東京大学卒、サイバーエージェント出身。
  - 丸山さん：実践型プログラミングスクール TechElite 講師。
  - 財頭さん（財頭秦太郎）：動画デザイン道場 講師。バク転教室の店長も営む。
  - 宮本さん（宮本隆平）：動画編集道場PRO 責任者。動画編集CAMP講師兼任。山中さん、須田さん、宮里さんも同道場講師。
  - 中上さん（中上雄翔）：LINE道場 責任者・StockSun道場シリーズ全体統括。
  - 山口さん・深井さん・柳瀬さん：LPデザイン道場 講師陣（山口雄貴、深井嵐丸、柳瀬大紀）。

■ ビジネス系YouTuber・令和の虎 出演者
- 林さん（林尚弘）：武田塾創業者、FCチャンネル代表。令和の虎主宰。
- 桑田さん（桑田龍征）：歌舞伎町ホストクラブ（NEW GENERATION GROUP）オーナー。令和の虎。
- 三上さん（三上功太）：アドネス株式会社代表。「スキルプラス」やAI行動管理OS「Addness」を展開。
- 中野優作さん：株式会社BUDDICA代表。車屋。令和の虎。
- 本房さん（本房哲治）：OMUKE株式会社代表。映像制作・動画編集・撮影スタジオ(Go-studio)などを手掛ける人物。

■ その他のビジネス系人物
- りくさん（小林理玖）：X（Twitter）アカウントは @date_tokyo_uni。東京デート系インスタメディアを起点に、店舗支援事業などを展開して会社を約3.5億円で上場企業にM&Aした起業家・インフルエンサー。
- しょーてぃさん：Xアカウントは @sho_tea_blog。暗号資産（仮想通貨）関連の発信で知られ、フォロワー（登録者）11万人超えのインフルエンサー。
- motoさん（戸塚俊介）：moto株式会社代表、転職アンテナ創業者。
- 田端さん（田端信太郎）：オンラインサロン「田端大学」元主宰、元ZOZO/LINE執行役員。
- 北原さん（北原孝彦）：実業家・美容室Dears創業者・ビジネスコミュニティ（精神と時の部屋等）主宰。
- 西野さん（西野亮廣）：にしのあきひろ。キングコング西野。絵本作家、実業家。「西野亮廣エンタメ研究所」主宰。
- なおくん（さとうなお）：フリーランスデザイナー。Xアカウントは @naoinst_70。
- ヒナキラさん：GPTs・コンテンツクリエイター、ブロガー。JAPAN MENSA会員。AI活用やSNS集客に関する発信を行っている。
- ろじん：SNSマーケター。（一般名詞の"老人"と混同・誤変換しないこと）

■ エンタメ系人物
- DJ社長：Repezen Foxxのリーダー。本名・木元駿之介。（ディージェー社長等と表記しないこと）
- はじめしゃちょー：人気YouTuber。UUUM所属。本名・江田元。（はじめ社長、はじめシャチョー等にならないこと）


==========================================================
【B】 企業・ブランド・サービス名の正式表記
==========================================================

■ 法人・ブランド名
- yutori：アパレル企業。Her lip to（heart relation社）を買収。すべて小文字が正式表記。
- Her lip to：小嶋陽菜プロデュースブランド。「ハートリップツー」は誤記。
- 株式会社あおの暮らし：法人名およびYouTubeチャンネル名。「あおのくらし」は誤記。
- Repezen Foxx：旧レペゼン地球。アーティスト集団。（一般用語と混同しないこと）
- 高橋帝国：クリエイター育成スクール。コミュニティ名。
- Instagram：「インスタ」と略される場合もあるが、「インスタント食品」の略ではないことに注意。
- Adobe Premiere Pro：動画編集ソフト。（"プレミア価格"等の一般名詞と混同せず、ソフトの話であればPremiere Proと表記すること）

■ 関連サービス・講座名（表記ゆれ・誤字に注意）
- CAMPシリーズ（青笹氏）：動画編集CAMP、サムネイルCAMP、YouTube台本CAMP、ディレクターCAMP、ショート動画CAMP、YouTubeマーケCAMP、CAMPマッチング
- 迫さん関連（Hacksシリーズ等）：Brain、ProgrammingHacks、MovieHacks、DesignHacks、WritingHacks
- StockSun道場シリーズ：LINE道場、動画編集道場PRO、動画デザイン道場、YouTubeディレクター道場、YouTube撮影道場、実践型プログラミングスクール TechElite、広告運用道場、LPデザイン道場、案件獲得道場、AI道場

==========================================================
【C】 同音異義語・漢字の使い分け（文脈から判断して修正すること）
==========================================================

- あう：「会う(Meet)」「合う(Fit/Match/Suit)」「遭う(事故・被害等 Encounter Disaster)」
- あげる：「上げる(上昇/挙手 Raise)」「挙げる(例示/成果をあげる Cite/Achieve)」
- いがい：「以外(〜を除いて Except)」「意外(思いのほか Unexpected)」
- いぎ：「意義(価値/意味 Meaning)」「異議(反対意見 Objection)」
- いし：「意志(心持ち Will/Volition)」vs「意思(考え/意図 Intention/Mind)」
- おさえる：「抑える(感情/費用の抑制 Suppress)」「押さえる(ポイント/証拠の確保 Grasp)」
- かいほう：「開放(制限をなくす Open)」「解放(束縛から放つ Liberate)」
- かわる：「代わる(交代/代理)」「変わる(変化)」「換わる(交換)」
- きく：「聞く(耳にする/尋ねる Hear/Ask)」「聴く(耳を傾ける Listen attentively)」「効く(効果がある Effective)」
- こえる：「超える(数値/限度を超える Exceed)」「越える(場所/境界/時間を越える Pass)」
- こたえる：「答える(質問に返事 Answer)」「応える(要望/期待にこたえる Respond)」
- せいさく：「製作(物品・機械を作る Manufacture)」「制作(芸術作品・映像・番組・デザイン・Webサイト等 Produce)」
- つとめる：「勤める(雇用されて働く Work for)」「務める(役割・役職を果たす Serve as)」「努める(努力する Strive)」
- はかる：「計る(時間/タイミング)」「測る(長さ/深さ)」「量る(重さ/容積)」「図る(意図する)」
- はじめ：「初め(時期/順序/早期 Early)」「始め(行動の開始/着手 Start)」
- ほしょう：「保障(安全保障等 Security)」「保証(品質保証 Guarantee)」「補償(損害補償 Compensation)」
`;

// ==========================================
// 3. 校正設定 (Core Rules)
// ==========================================
// 読みにくさを判定する基準値など、システムのコアな判定ルールを調整できます。
export const CORE_RULES = {
  // ひらがなが何文字続いたら「読みにくい」と警告を出すか
  maxConsecutiveHiragana: 12,
  // 漢字が何文字続いたら「読みにくい」と警告を出すか
  maxConsecutiveKanji: 7,
};
