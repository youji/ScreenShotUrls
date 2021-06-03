# URLsalvager

## これは何？

URLのリストを用意しscreenshot.jsに食わせると、以下のことをやってくれるツール

- 指定環境ごと(デフォルトではPC・SP)の全画面スクリーンショットを取る
- HTMLコードをテキストファイルに保存
- 各URLで実際にロードされた画像やCSS、js等のアセットファイルを実際の階層のままローカル保存

※また、上記動作はconf.yamlを編集することでoffにすることができる

## 便利なポイント

- 一度にPC・SPのスクリーンショットはもちろん、conf.yamlを編集すればタブレットやその他環境でのスクリーンショットも取得可能
- puppeteerでスクリーンショットを取るため、ブラウザ見たまんまのスクリーンショットが取得可能
- BASIC認証下でもスクリーンショットを取得可能(要conf.yaml編集)
- フォーム認証がある場合はscreenshot.js内のformAuthenticationLoginファンクションをコメントアウトし認証情報を記述することで認証突破可能(js書ける人じゃないと難しい)

## 実行方法

下記で node パッケージインストール

```
npm i
```

conf.yaml を設定したうえで下記の様に実行

```
node screenshoter.js
```

input ディレクトリ内の urllist.xlsx を走査し、screenshot を取得

任意の xlsx ファイルを input としたい場合は下記の様にする

```
node screenshoter.js 20210401160801282.xlsx
```

## inputファイルについて

処理対象のurlはinputディレクトリ内に配置する
excel形式で下記の様にA列にURLが列挙されたファイルを用意する

|URL|
|:-----------|
|https://example.com/|
|https://example.com/page1|
|https://example.com/page3|
|https://example.com/page4|



※サンプルとして用意されているurllist.xlsxではB列以降に記述がされていますが、空でも構いません

※[UrlSalvager](https://github.com/youji/UrlSalvager)のresultファイルをそのまま転用可能です

## resultファイルについて

resultディレクトリ内に*20210301103326238*の様な実行日時ごとにディレクトリが切られ、結果が保存されます

## conf.yaml 設定内容

※書き途中...ファイルを見てくれればたぶんわかる