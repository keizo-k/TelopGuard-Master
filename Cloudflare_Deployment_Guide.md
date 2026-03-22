# TelopGuard - Cloudflare Pages デプロイ手順書
（特定チャンネル専用のWeb画面を立ち上げる方法）

TelopGuard (v3.0.0〜) は「Cloudflare Pages」を利用することで、同じ1つのソースコード（GitHubリポジトリ）から、**「中野式専用版」「スキル獲得専用版」「すべてのチャンネルが見れるマスター版」など、別々のURLを持つ独立したアプリ**として無料でいくつでも公開することができます。

## 1. ベース（マスター版）のデプロイ手順

一番基本となる、すべてのチャンネルが切り替えられるマスター版の公開手順です。

1. [Cloudflareのダッシュボード](https://dash.cloudflare.com/) を開きます。
2. 左メニュー、または画面上部のタブから **「Workers & Pages」** の画面へ移動します。
3. 画面中央のタブから **「Pages」** を選択し、**「Connect to Git（Gitに接続）」** をクリックします。
4. GitHubアカウントと連携し、`TelopGuard-Master` リポジトリを選択して「Next」を押します。
5. **Set up builds and deployments（ビルドの設定）** 画面で、以下の3項目を正確に入力・選択します。
   - **Framework preset**: `None`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. そのまま右下の「Save and Deploy」を押すと、約1〜2分でビルドが完了し、ベースとなるURL（例: `https://telopguard-master.pages.dev`）が発行されます。

---

## 2. 【重要】特定チャンネル専用URL（例: 中野式専用）を作る手順

マスター版のURLを編集者に渡してしまうと、他のチャンネルの設定ルールや機密情報が見えてしまいます。
そのため、**編集者に見せたいチャンネルの設定だけを組み込んだ「専用URL」** を追加で作成します。

1. Cloudflareの「Workers & Pages」の **[Pages]** タブに戻り、再度「Connect to Git」をクリックして**全く同じ `TelopGuard-Master` リポジトリ**を選択します。
2. （プロジェクト名の入力欄で「telopguard-nakano」など、わかりやすい名前に変更しておくと便利です。）
3. ビルド設定画面で、先ほどと同様に「Framework preset: `None`」「Build command: `npm run build`」「Output: `dist`」を入力します。
4. **ここで追加作業です！**
   設定画面の下部にある **「Environment variables（環境変数）」**（または Advanced settings の中）を開きます。
5. 以下のキーと値を入力して追加（Add Variable）します。
   - **Variable name**: `VITE_APP_MODE`
   - **Value**: `nakano-shiki`
   - *(※「スキル獲得専用」を作りたい場合は、Valueを `skill-kakutoku` にします)*
6. 右下の「Save and Deploy」を押します。

### 🎉 完成！
これで、先ほどのマスター版とは全く別のURL（例: `https://telopguard-nakano.pages.dev`）がもう1つ立ち上がります。
このURLを開くと、画面のドロップダウンには「中野式」しか表示されず、**他の機能はソースコードごと除去されているため完全に安全です**。

---

## 3. その他の応用：複数チャンネルの許可

ある担当者が「中野式」と「スキル獲得」の両方の仕事をしている場合、2つだけが見れる画面を作ることもできます。

手順「2」の環境変数（Environment variables）の入力で、カンマ区切りで複数のIDを指定します。
- **Variable name**: `VITE_APP_MODE`
- **Value**: `nakano-shiki, skill-kakutoku`

この設定でデプロイしたURLを渡せば、その人の画面だけは2つのチャンネルを切り替えて作業できるようになります！
