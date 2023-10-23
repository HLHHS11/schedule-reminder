# スケジュールリマインダー
Googleスプレッドシート上に登録されたスケジュールを，GASの定期実行によりLINEグループに通知します。

## 開発環境構築
参考: https://dev.classmethod.jp/articles/vscode-clasp-setting/

ターミナルで以下を実行

``` sh
# Google Claspをグローバルインストール
npm install -g @google/clasp
# Googleアカウントの認証
clasp login --no-localhost
```

続いて，[`.clasp.json.sample`](.clasp.json.sample)を`.clasp.json`という名前でコピーし，`YOUR_SCRIPT_ID`にApps ScriptプロジェクトのIDを入力してください。

## LINE Notifyトークンのセット
該当プロジェクトのスクリプトプロパティに`LINE_NOTIFY_TOKEN`という名前でトークンをセットしてください。

## スクリプトのpush
``` sh
clasp push
```

## モジュール分割について
`import`, `export`がサポートされていないので，namespaceを利用してモジュール分割を行う  
参考サイト: https://zenn.dev/someone7140/articles/f7d2eac8fb69fe
