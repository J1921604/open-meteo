# クイックスタート: 気温予測アプリケーション

**所要時間**: 5分
**前提条件**: Node.js 18.x以上、npm 9.x以上、Git
**バージョン**: 1.0.0
**最終更新**: 2025-12-15

## 概要

このガイドでは、開発環境のセットアップからローカル確認まで、最短手順で気温予測アプリケーションを起動します。

## ステップ1: リポジトリクローン

```bash
git clone https://github.com/J1921604/open-meteo.git
cd open-meteo
```

**確認**:

```bash
ls
# 出力例:
# .github/  .specify/  docs/  src/  package.json  README.md  specs/  start-app.ps1  tests/
```

## ステップ2: 依存関係インストール

```bash
npm install
```

**インストールされるパッケージ**:

| パッケージ  | バージョン | 用途                         |
| ----------- | ---------- | ---------------------------- |
| jest        | 30.x       | ユニットテストフレームワーク |
| puppeteer   | 24.x       | E2Eテストフレームワーク      |
| http-server | 14.x       | ローカル開発サーバー         |

**確認**:

```bash
npm list --depth=0
# 出力例:
# open-meteo-weather-forecast@1.0.0
# ├── jest@30.2.0
# ├── puppeteer@24.27.0
# └── http-server@14.1.1
```

## ステップ3: 開発サーバー起動

### 方法1: ワンコマンド起動（推奨）

#### PowerShell

```powershell
.\start-app.ps1
```

**自動実行内容**:

1. `http-server`がポート8080で起動
2. ブラウザで `http://localhost:8080`が自動的に開く

**出力例**:

```
================================
  気温予測アプリ起動中...
================================
サーバーを起動しています...
ブラウザが自動的に開きます: http://localhost:8080
サーバーを停止するには Ctrl+C を押してください
```

### 方法2: npmスクリプト（手動）

```bash
npm run serve
```

**手動でブラウザを開く**:

```
http://localhost:8080
```

**出力例**:

```
Starting up http-server, serving open-meteo
Available on:
  http://127.0.0.1:8080
  http://192.168.1.100:8080
Hit CTRL-C to stop the server
```

## ステップ4: 動作確認

### 基本機能確認

1. **都市選択**

   - ドロップダウンから「Tokyo」を選択
   - グラフが表示されることを確認（過去7日 + 未来7日）
   - 過去データ: 緑ネオン実線
   - 未来データ: マゼンタ破線
2. **期間調整**

   - 「-14日」ボタンをクリック → 過去14日間に拡大
   - 「+14日」ボタンをクリック → 未来14日間に拡大
   - グラフが再描画されることを確認
3. **単位切り替え**

   - トグルスイッチをクリック（℃ → ℉）
   - Y軸ラベルが「気温 (℉)」に変更
   - 温度値が華氏に変換されることを確認

### パフォーマンス確認

ブラウザ開発者ツール（F12）で以下を確認:

```javascript
// Console タブ
// API通信時間が200ms以下であることを確認
=== API Response ===
Response Time: 128.45ms ✅

// Performance タブ
// グラフ描画時間が100ms以下であることを確認
chart-render: 45.23ms ✅

// Memory タブ
// メモリ使用量が100MB以下であることを確認
JS Heap Size: 52.1 MB / 100 MB ✅
```

## ステップ5: テスト実行

### 全テスト実行

```bash
npm test
```

**出力例**（テスト実装後）:

```
PASS  tests/unit/api.test.js
  ✓ fetchWeatherData() が正しくAPIを呼び出す (25ms)
  ✓ buildApiUrl() が正しいURLを生成する (5ms)

PASS  tests/unit/chart.test.js
  ✓ updateChart() が正しくデータセットを構築する (15ms)
  ✓ updateChartUnit() が温度を変換する (8ms)

PASS  tests/unit/utils.test.js
  ✓ celsiusToFahrenheit() が正しく変換する (3ms)
  ✓ fahrenheitToCelsius() が正しく変換する (3ms)

PASS  tests/integration/app.test.js
  ✓ 都市選択後にグラフが表示される (1234ms)
  ✓ 期間調整ボタンでグラフが更新される (987ms)
  ✓ 単位切り替えでグラフが再描画される (543ms)

Test Suites: 4 passed, 4 total
Tests:       9 passed, 9 total
Time:        3.245s
```

### テスト監視モード

```bash
npm run test:watch
```

ファイル変更を検知して自動的にテストを再実行します。

### カバレッジレポート

```bash
npm run test:coverage
```

**出力例**:

```
----------------|---------|----------|---------|---------|
File            | % Stmts | % Branch | % Funcs | % Lines |
----------------|---------|----------|---------|---------|
All files       |   82.5  |   75.3   |   88.2  |   83.1  |
 script.js      |   82.5  |   75.3   |   88.2  |   83.1  |
----------------|---------|----------|---------|---------|
```

## トラブルシューティング

### 問題1: ポート8080が使用中

**エラーメッセージ**:

```
Error: listen EADDRINUSE: address already in use :::8080
```

**解決策**:

#### 方法A: 別のポートを使用

```bash
npx http-server open-meteo -p 8081
```

ブラウザで `http://localhost:8081`を開く。

#### 方法B: 既存プロセスを終了

**PowerShell**:

```powershell
Get-Process -Name "node" | Where-Object {$_.Path -like "*http-server*"} | Stop-Process
```

**コマンドプロンプト**:

```cmd
netstat -ano | findstr :8080
taskkill /PID [PID番号] /F
```

### 問題2: Chart.jsが読み込めない

**エラーメッセージ**（Console）:

```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js
```

**原因**: インターネット接続がない、またはCDNがダウンしている。

**解決策**:

- インターネット接続を確認
- Chart.js公式ステータス確認: https://status.jsdelivr.com/

**代替案（オフライン開発）**:

```bash
npm install chart.js
```

`index.html`を編集:

```html
<!-- CDN版を削除 -->
<!-- <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0"></script> -->

<!-- ローカル版を使用 -->
<script src="../node_modules/chart.js/dist/chart.umd.js"></script>
```

### 問題3: APIエラーが表示される

**エラーメッセージ**（画面上）:

```
データ取得に失敗しました: Network Error
```

**原因**:

- Open-Meteo APIがダウンしている
- ネットワークエラー
- CORS問題（ローカルファイルで開いた場合）

**解決策**:

#### 1. APIステータス確認

Open-Meteo公式サイトでステータス確認:
https://open-meteo.com/

#### 2. ネットワーク確認

```bash
curl https://api.open-meteo.com/v1/forecast?latitude=35.6785&longitude=139.6823&hourly=temperature_2m
```

#### 3. http-server使用確認

**NG**: ファイルを直接ダブルクリック（`file:///...`）
**OK**: http-server経由（`http://localhost:8080`）

CORS制限により、`file://`プロトコルからのAPI通信は失敗します。必ず `npm run serve`または `start-app.ps1`を使用してください。

### 問題4: グラフが表示されない

**確認項目**:

1. **Console確認**

```javascript
// F12 → Console タブ
// エラーメッセージを確認
```

2. **Chart.js初期化確認**

```javascript
console.log(temperatureChart); // Chart インスタンスが表示されるか
```

3. **Canvas要素確認**

```javascript
console.log(document.getElementById('temperatureChart')); // canvas要素が存在するか
```

**よくある原因**:

- 都市が未選択（「-- 主要都市を選択 --」のまま）
- APIレスポンス遅延中（ローディングスピナー表示中）
- JavaScript エラー（Console で赤字エラー確認）

## 次のステップ

### 1. 仕様書を確認

完全な機能仕様を理解する:

- [spec.md](https://github.com/J1921604/open-meteo/blob/main/specs/001-weather-forecast-app/spec.md)
- [requirements.md](https://github.com/J1921604/open-meteo/blob/main/specs/001-weather-forecast-app/checklists/requirements.md)

### 2. デプロイガイドを確認

GitHub Pagesへのデプロイ手順:

- [DEPLOY_GUIDE.md](https://github.com/J1921604/open-meteo/blob/main/docs/DEPLOY_GUIDE.md)

### 3. 憲法ドキュメントを確認

開発原則とガバナンス:

- [constitution.md](https://github.com/J1921604/open-meteo/blob/main/.specify/memory/constitution.md)

### 4. テスト実装

TDDサイクルでテストを実装:

```bash
# テスト監視モード起動
npm run test:watch

# テストファイル作成
# tests/unit/api.test.js
# tests/unit/chart.test.js
# tests/unit/utils.test.js
# tests/integration/app.test.js
```

### 5. 開発環境カスタマイズ

#### ESLint設定

```bash
npm install --save-dev eslint
npx eslint --init
```

#### VS Code拡張機能

推奨拡張:

- ESLint
- Prettier
- Live Server
- GitHub Copilot

---

## コマンドリファレンス

| コマンド                  | 説明                           |
| ------------------------- | ------------------------------ |
| `npm install`           | 依存関係インストール           |
| `npm run serve`         | 開発サーバー起動（ポート8080） |
| `npm test`              | 全テスト実行                   |
| `npm run test:watch`    | テスト監視モード               |
| `npm run test:coverage` | カバレッジレポート生成         |
| `start-app.ps1`         | ワンコマンド起動（PowerShell） |

---

**Version**: 1.0.0
**Created**: 2025-12-15
**Support**: https://github.com/J1921604/open-meteo/issues
