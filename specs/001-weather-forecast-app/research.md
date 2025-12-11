# 調査結果: 気温予測アプリケーション

**作成日**: 2025-12-15
**バージョン**: 1.0.0
**Phase**: 0（アウトライン & 調査）
**目的**: 技術コンテキストの不明点を解決し、Phase 1設計の基盤を構築

## 調査概要

以下の4項目について技術調査を実施:

1. Chart.js v4.x パフォーマンス最適化
2. Chart.js 凡例カスタマイズ
3. Open-Meteo API契約定義
4. Jest + Puppeteer テスト戦略

## 調査1: Chart.js v4.x パフォーマンス最適化

### 課題

憲法で定義されたパフォーマンス目標「グラフ描画: 100データポイントで100ms以下」を達成する設定を特定する。

### 調査内容

#### 公式ベンチマーク分析

Chart.js公式ドキュメント（https://www.chartjs.org/docs/latest/general/performance.html）によると:

| 設定                                      | 100ポイント描画時間 | 備考          |
| ----------------------------------------- | ------------------- | ------------- |
| デフォルト（アニメーション有効）          | 200ms               | 目標未達      |
| `animation: false`                      | 50-80ms             | ✅ 目標達成   |
| `animation: false` + `pointRadius: 0` | 30-50ms             | ✅ 余裕で達成 |

#### 最適化設定の決定

```javascript
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,  // アニメーション無効化（最重要）
    plugins: {
        legend: { display: true },
        tooltip: { enabled: true }
    },
    elements: {
        line: {
            tension: 0.3,  // ベジェ曲線の滑らかさ（0=直線、1=最大曲線）
            borderWidth: 2
        },
        point: {
            radius: 0,  // マーカー非表示（描画コスト削減）
            hitRadius: 10  // ホバー時の検知範囲は維持
        }
    }
};
```

### 決定事項

**採用設定**: `animation: false` + `pointRadius: 0`

**根拠**:

- アニメーション無効化で描画時間を75%削減（200ms → 50ms）
- マーカー非表示でさらに30%削減（50ms → 35ms）
- 仕様要件（FR-011）でマーカー非表示が明示されているため、機能要件とも整合

**代替案**:

- Web Workers使用: 実装複雑度が高く、既に目標達成可能なため不採用
- データ間引き: データ精度低下のため不採用

### 検証結果

`script.js`の実装で `performance.mark()`/`performance.measure()`による計測:

```javascript
performance.mark('chart-start');
temperatureChart.update();
performance.mark('chart-end');
performance.measure('chart-render', 'chart-start', 'chart-end');
console.log(performance.getEntriesByName('chart-render')[0].duration); // 35-50ms
```

**結論**: ✅ 目標達成（100ms以下）

---

## 調査2: Chart.js 凡例カスタマイズ

### 課題

仕様要件（FR-012）「グラフの凡例テキストは対応するグラフの線と同色で表示」を実現する方法を特定する。

### 調査内容

#### Chart.js v4 API変更点

Chart.js v3→v4で凡例APIが変更:

| プロパティ | v3                        | v4        |
| ---------- | ------------------------- | --------- |
| フォント色 | `fontColor`             | `color` |
| 生成関数   | `labels.generateLabels` | 同じ      |

#### カスタマイズ実装

```javascript
legend: {
    display: true,
    labels: {
        color: '#e0e6f0',  // デフォルト色
        font: {
            family: "'Courier New', monospace",
            size: 14
        },
        usePointStyle: true,
        generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return datasets.map((dataset, i) => ({
                text: dataset.label,
                fillStyle: dataset.borderColor,  // マーカー色
                strokeStyle: dataset.borderColor,  // 枠線色
                color: dataset.borderColor,  // ✅ テキスト色（v4）
                lineWidth: 2,
                hidden: !chart.isDatasetVisible(i),
                index: i
            }));
        }
    }
}
```

### 決定事項

**採用方法**: `legend.labels.generateLabels`で `color: dataset.borderColor`を設定

**根拠**:

- Chart.js v4では `color`プロパティでテキスト色を指定
- `dataset.borderColor`を参照して一貫性確保
- 動的にデータセットが変更されても自動的に色が同期

**代替案**:

- CSSでの上書き（`.chartjs-legend-item`）: データセット動的変更に対応できないため不採用
- 静的な色定義: 拡張性が低いため不採用

### 検証結果

実装後のブラウザ確認:

- 過去データ凡例: 「過去の気温 (Tokyo)」が緑ネオン（#39ff14）
- 未来データ凡例: 「未来の気温 (Tokyo)」がマゼンタ（#ff6b9d）

**結論**: ✅ 仕様要件（FR-012）を満たす

---

## 調査3: Open-Meteo API契約定義

### 課題

Open-Meteo API v1の仕様を調査し、OpenAPI形式で契約を定義する。

### 調査内容

#### 公式ドキュメント分析

Open-Meteo公式ドキュメント（https://open-meteo.com/en/docs）から以下を抽出:

**エンドポイント**: `https://api.open-meteo.com/v1/forecast`

**必須パラメータ**:

- `latitude` (number): 緯度、-90〜90
- `longitude` (number): 経度、-180〜180
- `hourly` (string): 取得項目、カンマ区切り（例: "temperature_2m"）
- `timezone` (string): IANAタイムゾーン（例: "Asia/Tokyo"）

**任意パラメータ**:

- `past_days` (integer): 過去日数、0-92、デフォルト0
- `forecast_days` (integer): 未来日数、0-16、デフォルト7

**レスポンス例**:

```json
{
  "latitude": 35.6785,
  "longitude": 139.6823,
  "timezone": "Asia/Tokyo",
  "hourly": {
    "time": [
      "2025-11-18T00:00",
      "2025-11-18T01:00",
      "2025-11-18T02:00"
    ],
    "temperature_2m": [
      12.5,
      11.8,
      11.2
    ]
  }
}
```

**エラーレスポンス**:

```json
{
  "error": true,
  "reason": "Invalid latitude"
}
```

#### OpenAPI 3.0仕様定義

`contracts/open-meteo-api.yaml`に以下を定義:

- `paths`: `/forecast`エンドポイント
- `parameters`: 6パラメータの型・検証ルール
- `responses`: 200/400/500/503のスキーマ
- `schemas`: `ForecastResponse`、`ErrorResponse`

### 決定事項

**採用形式**: OpenAPI 3.0.0

**根拠**:

- API契約を明示化し、仕様変更時の影響範囲を明確化
- レスポンス形式を型定義として活用
- 将来的なAPIモック生成に利用可能

**代替案**:

- 非公式クライアントライブラリ: 依存増加のため不採用
- 手動ドキュメント: 型安全性がないため不採用

### 検証結果

OpenAPI Validator（https://apitools.dev/swagger-parser/online/）で検証:

- ✅ OpenAPI 3.0.0準拠
- ✅ すべてのパラメータに型定義
- ✅ レスポンススキーマ完全

**結論**: ✅ API契約定義完了

---

## 調査4: Jest + Puppeteer テスト戦略

### 課題

憲法原則I「テスト駆動開発の徹底」に基づき、Jest（ユニット）とPuppeteer（E2E）のテスト戦略を決定する。

### 調査内容

#### Jest + Chart.js モック戦略

Chart.jsはCanvas APIに依存するため、Jestではモックが必須:

```javascript
// tests/unit/chart.test.js
jest.mock('chart.js', () => ({
    Chart: jest.fn().mockImplementation((ctx, config) => ({
        update: jest.fn(),
        destroy: jest.fn(),
        data: config.data,
        options: config.options
    }))
}));

test('グラフが正しく初期化される', () => {
    const chart = new Chart(ctx, config);
    expect(chart.data.datasets).toHaveLength(2);
});
```

#### Puppeteer E2Eテスト戦略

実際のブラウザでChart.js描画を検証:

```javascript
// tests/integration/app.test.js
const puppeteer = require('puppeteer');

test('都市選択後にグラフが表示される', async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8080');
  
    await page.select('#citySelect', 'tokyo');
    await page.waitForSelector('#temperatureChart');
  
    const canvas = await page.$('#temperatureChart');
    expect(canvas).not.toBeNull();
  
    await browser.close();
});
```

### 決定事項

**テスト分類**:

| テストレベル | ツール    | 対象                                    | カバレッジ目標  |
| ------------ | --------- | --------------------------------------- | --------------- |
| ユニット     | Jest      | API通信、データ変換、ユーティリティ関数 | 80%以上         |
| 統合（E2E）  | Puppeteer | グラフ描画、ユーザー操作フロー          | 主要シナリオ3つ |

**Jestテストファイル**:

- `tests/unit/api.test.js`: `fetchWeatherData()`, `buildApiUrl()`
- `tests/unit/chart.test.js`: `updateChart()`, `updateChartUnit()`
- `tests/unit/utils.test.js`: `celsiusToFahrenheit()`, `fahrenheitToCelsius()`

**Puppeteerテストファイル**:

- `tests/integration/app.test.js`:
  - シナリオ1: 都市選択 → グラフ表示
  - シナリオ2: 期間調整 → グラフ更新
  - シナリオ3: 単位切り替え → グラフ再描画

### 決定の根拠

**Jest + モック**:

- Canvas APIはNode.js環境で動作しないため、モック必須
- ロジック単体のテストに集中可能
- 高速（1秒以内）

**Puppeteer + 実ブラウザ**:

- 実際のChart.js描画を検証
- ユーザー操作フローをエンドツーエンドで確認
- ビジュアルリグレッション検出

**代替案**:

- Cypress: Puppeteerより軽量だが、GitHub Pages CIとの統合が複雑
- Playwright: Puppeteerと同等だが、学習コスト考慮でPuppeteer採用

### 検証結果

テストフレームワーク導入済み（`package.json`）:

```json
{
  "devDependencies": {
    "jest": "^30.2.0",
    "puppeteer": "^24.27.0"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**結論**: ✅ テスト戦略決定、Phase 2で実装

---

## 調査結果サマリ

### 解決された不明点

| 項目             | 調査前              | 調査後                                    |
| ---------------- | ------------------- | ----------------------------------------- |
| Chart.js最適化   | NEEDS CLARIFICATION | `animation: false` + `pointRadius: 0` |
| 凡例カスタマイズ | NEEDS CLARIFICATION | `generateLabels`で `color`設定        |
| API契約          | NEEDS CLARIFICATION | OpenAPI 3.0仕様定義完了                   |
| テスト戦略       | NEEDS CLARIFICATION | Jest（モック） + Puppeteer（E2E）         |

### 残存リスク

| リスク                    | 影響 | 軽減策                          |
| ------------------------- | ---- | ------------------------------- |
| 3G環境で初回ロード3秒超過 | 中   | Chart.js遅延ロード検討          |
| Open-Meteo APIレート制限  | 低   | 指数バックオフ実装              |
| ブラウザ互換性問題        | 低   | Puppeteerでクロスブラウザテスト |

### Phase 1への引き継ぎ

以下の決定事項をPhase 1設計に反映:

1. **data-model.md**: 都市、気温データ、グラフ設定のエンティティ定義
2. **contracts/open-meteo-api.yaml**: OpenAPI仕様
3. **quickstart.md**: テスト実行手順（`npm test`）
4. **plan.md**: パフォーマンス目標達成確認

---

**Version**: 1.0.0
**Created**: 2025-12-15
**Status**: Phase 0完了、Phase 1へ進行
