# Welcome to project MuFo

## 始め方

1. git clone yourname@github.com/splitux/mufo-musichackday.git
1. Firebaseプロジェクトのセットアップ（次項参照）
1. $ npm install
1. $ npm run watch

→ブラウザが立ち上がってMuFo画面が表示されます。PCだとスマホ版に誘導する画面しか表示されないので、開発者ツールでスマホ表示に切り替えてください（UAで判定しています）。
終了する時はCtl-Cです。

## Firebaseプロジェクトのセットアップ

MuFoはバックエンドとしてGoogle Firebaseを使用しています。
下記の手順でFirebaseのプロジェクトを作成し、クローンしたMuFoに設定してください。

1. https://console.firebase.google.com/ にアクセスし、googleアカウントでログイン
1. 「プロジェクトを追加」から任意の名前で新規プロジェクトを作成
1. 「ウェブアプリに Firebase を追加」からAPIキー等の入ったスニペットを取得
1. gulpfile.config.js に取得したAPIキー等を転記（devとprodでプロジェクトを分けられます。必要なければどちらも同じキー等を設定してください）
1. $ npm install -g firebase-tools
1. $ firebase login （ブラウザでgoogleアカウントの認可画面が開くので、承認）
1. $ firebase init （下記例参照）
1. $ firebase deploy 

```
yukiyunecos-MacBook-Pro:mhd-test yuki$ firebase init

🔥FireBase🔥

You're about to initialize a Firebase project in this directory:
  (プロジェクトのパス)

Before we get started, keep in mind:

  * You are initializing in an existing Firebase project directory

? Which Firebase CLI features do you want to setup for this folder? Press Space to select features, then Enter to confirm your choices. (Press <space> to select)
? Which Firebase CLI features do you want to setup for this folder? Press Space to select features, then Enter to confirm your choices.
 ◉ Database: Deploy Firebase Realtime Database Rules
 ◯ Firestore: Deploy rules and create indexes for Firestore
 ◉ Functions: Configure and deploy Cloud Functions
❯◉ Hosting: Configure and deploy Firebase Hosting sites
 ◯ Storage: Deploy Cloud Storage security rules

(上記三つを◉にしてenter)

=== Project Setup

First, let's associate this project directory with a Firebase project.
You can create multiple project aliases by running firebase use --add,
but for now we'll just set up a default project.

? Select a default Firebase project for this directory:
  [don't setup a default project]
❯ firebaseコンソールで作成したプロジェクト名

=== Database Setup

Firebase Realtime Database Rules allow you to define how your data should be
structured and when your data can be read from and written to.

? What file should be used for Database Rules? (database.rules.json) (そのままenter)
? File database.rules.json already exists. Do you want to overwrite it with the Database Rules
 for mufomhdtest from the Firebase Console? (y/N) (そのままenter)

=== Functions Setup

A functions directory will be created in your project with a Node.js
package pre-configured. Functions can be deployed with firebase deploy.

? What language would you like to use to write Cloud Functions? (Use arrow keys)
❯ JavaScript 
  TypeScript
(enter)

? Do you want to use ESLint to catch probable bugs and enforce style? (Y/n) (そのままenter)
? File functions/package.json already exists. Overwrite? (y/N) y (yを指定してenter)
? File functions/index.js already exists. Overwrite? (y/N) (そのままenter)
? Do you want to install dependencies with npm now? (Y/n) (そのままenter)

(ここでしばらくインストール待ち)
added 98 packages in 4.293s

=== Hosting Setup

Your public directory is the folder (relative to your project directory) that
will contain Hosting assets to be uploaded with firebase deploy. If you
have a build process for your assets, use your build's output directory.

? What do you want to use as your public directory? (public) dist (※distを指定)
? Configure as a single-page app (rewrite all urls to /index.html)? (y/N) (そのままenter)

✔  Firebase initialization complete!
```

## その他の設定（オプション）

きちんと動かすには下記の設定も必要です。必要に応じて実施してください。

* Firebase Authentication の設定

  提供しているMuFoではSNS等でログインしないとMuFoの作成・曲の追加ができません。
  firebase consoleのAuthenticationメニューからGoogle/Facebook/Twitterのログインを有効にしてください。Facebook/Twitterはアプリの申請等の作業が必要なため、まずはGoogleで試してみるとよいです。

* Google Map API の設定
  MufoではGoogle Map APIを使用しています。APIキーが無い状態ではマップが正しく表示されない場合があるので、各自でAPIキーを取得し、index.htmlのGoogle Map API読み込み記述箇所に正しく挿入してください。

## 開発の進め方

### 開発時

* ローカルでデバッグする場合にも「Firebaseプロジェクトのセットアップ」に記載の通り、最初に一度firebase deployを行うか、手動でRealtimeDatabaseのセキュリティ設定を反映してください。一度デプロイすればフロント側は`npm run watch`でローカルデバッグできます
* `npm run watch`している状態で`src`ディレクトリ内を編集します
* 変更は自動でビルドされ、ブラウザに反映されます
* ビルドされたものはdistディレクトリに出力されます

### リリース時

* `npm run production`で`prod`ディレクトリにリリース向け資産を作ります
* リリース用と開発用でソース内のドメイン名やAPIキー等を切り替えることができます
    * 詳細は`gulpfile.config.js`を参照


## 参考：開発モデル

* 大体の部分で下の記事に倣っています。多謝。
    * [モダンJavaScript開発 はじめの一歩, Riot.jsの場合]( http://blog.lebe.jp/post/150338847590/modern-javascript-riotjs )
* グローバルの汚染を防ぐため、タグ以外のアプリのロジックは全てwindow.Appに入れます
    * index.jsを参照してください。この中はES2015が書けるので、importが使えます
* データの管理にはRiotControllを利用したゆるいFlux的なモデルを組み込んでいます
    * データの管理はデータストアクラスに隔離されています。タグからはアクセスできません
    * タグからデータを参照/更新するには、App.controllerに対してイベントを発行します
    * 詳細はサンプルのusers.tagを参照してください
* SPAの画面遷移（ルーティング）には公式のriotルーターを利用しています
    * App.routerでアクセスできます
    * ルーティングの定義はrouter.jsを参照/編集してください

## 参考：ビルド構成

* riot.js
    * src/tag/の下の.tagをコンパイル・結合し、dist/js/tags.jsに出力します
    * ES2015で書けます
    * riotコパイラのsourcemap対応がダメっぽい（2017/2時点で対応中？）ので、妥協でコンパイル後・結合前のjsに対してソースマップを作ってます。ごめんなさい
* その他のjs
    * src/js下の.jsをコンパイル・結合し、dist/js/main.jsに出力します
    * ES2015で書けます
    * ソースマップ作ります
* sass
    * src/css/の下の.scssをコンパイル・結合し、dist/css/style.cssに出力します
    * 今のところ圧縮はしてません
    * ソースマップ作ります
    * ベンダプレフィックスつけたりもやってません。必要なら追加してください
* html
    * 何もしません。単に/srcから/distにコピーします

## FAQ

* jQuery使いたいんだけど→入れました。他のJSプラグインも同様にしてください
    * npm install --sava jquery とかで入れてください
    * タグから使いたい場合は、index.jsでriot.jsと同じ要領でwindow直下にエクスポートしてください
    * ↑の手順がめんどくさければ、index.htmlでCDNから引っ張ってくるのでもOKです
* 画像を変えたのに反映されないんだけど
    * js,tag,html,sass以外は監視対象にしていません
    * Ctrl-Cで止めて、もう一度npm run watchすれば反映されます
* 画像以外のリソースファイルはどこに置けばいいの？
    * srcの下に自由にディレクトリ作ってください
    * そのままだとビルドに反映されないので、gulpfile.babel.jsを開いて、cpResourceタスクに定義を追加してください

