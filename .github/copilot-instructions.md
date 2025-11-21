# open-meteo Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-02

## 技術スタック

**言語・バージョン**: HTML5, CSS3, JavaScript (ES6+)  
**主要依存パッケージ**: Chart.js（グラフ描画）  
**外部API**: Open-Meteo Weather Forecast API  
**テストフレームワーク**: Jest, Puppeteer  
**開発サーバー**: http-server  
**対象プラットフォーム**: モダンブラウザ（Chrome, Firefox, Safari, Edge）

## プロジェクト構成

```text
open-meteo/
├── index.html       # メインページ
├── style.css        # サイバーパンク風スタイル
└── script.js        # API連携・グラフ描画ロジック

tests/
├── unit/            # ユニットテスト
└── integration/     # 統合テスト
```

## パフォーマンス目標

- APIレスポンスタイム: 200ms以下（95パーセンタイル）
- 初回ページロード: 3秒以内（3G環境）
- グラフ描画: 100データポイントで100ms以下
- メモリ使用量: 100MB以下（ブラウザ）

## 制約事項

- 機密データ（APIキー等）なし（Open-Meteo APIは認証不要）
- オフライン対応は不要（API依存）
- レスポンシブデザイン必須（max-width: 1600px, max-height: 900px）

## コマンド

```bash
# 開発サーバー起動
npm run serve

# テスト実行
npm test

# テストカバレッジ確認
npm run test:coverage

# テスト監視モード
npm run test:watch
```

## コードスタイル

**JavaScript**: 
- ESLint準拠
- 関数は単一責任原則（50行以内推奨）
- 複雑度（Cyclomatic Complexity）15以下
- JSDocコメント必須

**CSS**:
- ダーク基調、サイバーパンク風
- ベースカラー: 緑ネオン (#39ff14)
- アクセントカラー: マゼンタ (#ff6b9d)
- 選択中ボタン: 発光デザイン

**HTML**:
- セマンティックHTML使用
- アクセシビリティ（ARIA）考慮

## 最近の変更

- 2025-11-25: 実装計画（plan.md）生成完了、Phase 0-1ドキュメント整備
- 2025-11-25: グラフ凡例の文字色をマーク同色に修正、実績と予測グラフを連続化
- 2025-11-21: プロジェクト初期セットアップ、憲法v1.0.0策定

## 実装計画ドキュメント

本機能の詳細な実装計画は以下を参照:

- [実装計画（plan.md）](https://github.com/J1921604/open-meteo/blob/main/specs/feature/impl-001-weather-forecast-app/plan.md)
- [調査結果（research.md）](https://github.com/J1921604/open-meteo/blob/main/specs/feature/impl-001-weather-forecast-app/research.md)
- [データモデル（data-model.md）](https://github.com/J1921604/open-meteo/blob/main/specs/feature/impl-001-weather-forecast-app/data-model.md)
- [クイックスタート（quickstart.md）](https://github.com/J1921604/open-meteo/blob/main/specs/feature/impl-001-weather-forecast-app/quickstart.md)
- [API契約（open-meteo-api.yaml）](https://github.com/J1921604/open-meteo/blob/main/specs/feature/impl-001-weather-forecast-app/contracts/open-meteo-api.yaml)

## 憲法遵守

本プロジェクトは `.specify/memory/constitution.md` に定義された原則に従う:

1. **テスト駆動開発**: テスト作成 → 失敗確認 → 実装
2. **セキュリティ最優先**: XSS/CSRF対策、入力検証
3. **パフォーマンス定量化**: 上記パフォーマンス目標を厳守
4. **外部依存固定**: package-lock.jsonでバージョン固定
5. **仕様・実装整合性**: 仕様変更時はドキュメント更新必須

詳細は [憲法ドキュメント](https://github.com/J1921604/open-meteo/blob/main/.specify/memory/constitution.md) を参照。

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
