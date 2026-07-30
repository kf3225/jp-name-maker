# jp-name-maker — エージェント運用インデックス

このプロジェクトでエージェントが作業するための**索引と運用ルール**。詳細は各リンク先を参照。グローバルルール（出力は日本語）に加え、本项目固有の制約を定める。

## 作業パイプライン（サブエージェント）

- **`/issue <N>`** — issue 番号を指定すると **計画→計画レビュー→実装→実装レビュー→PR** を自動実行（定義: `.opencode/command/issue.md`）。
- サブエージェント定義: `.opencode/agent/`
  - **issue-planner** — 縦剖断の実装計画を立案（読み取り専用）
  - **plan-reviewer** — 計画を審査、`OK`/`CHANGES_REQUESTED` を返す（最大3往復・読み取り専用）
  - **implementer** — `../jp-name-maker.worktree/<ブランチ>` に git worktree を切り、**関数型/OCP** で実装・`vp check/test/build` を Green にしてコミット
  - **impl-reviewer** — 実装差分を**パフォーマンス/セキュリティ最重視**で審査（最大3往復・読み取り専用）
  - **pr-author** — push と PR 作成（`.github/pull_request_template.md` 準拠）

## 必須ワークフロー

- コミット前に **`vp check`**（fmt/lint/型）。コミットは **Conventional Commits**（`type: subject`・type 必須・subject-case 無効化済）。
- 新規ロジックには **`vp test`** で走るテストを（特に実在姓制約などのドメイン不変量）。
- 秘密は絶対に commit しない（gitleaks / Push Protection）。
- `dist/` `node_modules/` `.wrangler/` `.vite-hooks/_/` は commit しない。

## 自律範囲と要承認事項

以下は**人間の確認が必須**（該当 PR を作り、レビューを仰ぐ）:

- 本番デプロイ・`main` への push・マージ
- `AGENTS.md` / `.github/` / **`.opencode/`** / `.vite-hooks/` / `CODEOWNERS` の変更
- `docs/adr/`（アーキテクチャ決定）/ Terraform(`*.tf`,`*.tfvars`) / インフラ構成の変更
- `wrangler.jsonc` / `pnpm-workspace.yaml`（Vite+ override）の変更
- 新規シークレットの導入

## 禁止事項

- **自分のガードレールを弱めない/回避しない**（本ファイル・CI・hooks・`.opencode/`・CODEOWNERS・リント/型ルール）。
- テスト/リント/型チェックを通すためだけに、理由なくルールを無効化しない。
- `CONTEXT.md` の用語と矛盾する命名をしない。実装前に ADR を確認。

## 索引

| 目的                      | 参照先                                                      |
| ------------------------- | ----------------------------------------------------------- |
| ドメイン用語              | `CONTEXT.md`                                                |
| 要件定義                  | `docs/requirements.md`                                      |
| アーキテクチャ決定        | `docs/adr/0001`〜`0006`                                     |
| 開発ガードレール詳細      | `docs/adr/0005`                                             |
| 技術スタック              | `docs/adr/0004`（スタック）・`docs/adr/0006`（Effect コア） |
| サブエージェント/コマンド | `.opencode/agent/`・`.opencode/command/`                    |
| issue トラッカー          | GitHub Issues（`ready-for-agent` ラベル = 着手可能）        |
