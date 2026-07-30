# jp-name-maker — エージェント運用ルール

このプロジェクトでコーディングエージェントが作業する際の運用ルール。
グローバルルール（出力は日本語）に加え、本项目固有の制約を定める。

## 必須ワークフロー

- **コミット前に必ず `vp check` を通す**（フォーマット/リント/型エラーを残さない）。
- **コミットメッセージは Conventional Commits 形式**（`type: subject`）。`subject-case` は無効化済みだが `type` は必須。commit-msg フックと CI の両方で強制される。
- 新規ロジックには **`vp test` で走るテストを添える**（特にドメイン不変量＝実在姓制約など）。
- **秘密は絶対に commit しない**（APIキー・`.dev.vars`・`.env`・シークレット値）。pre-commit/CI の gitleaks と GitHub Push Protection が検知する。
- `dist/` `node_modules/` `.wrangler/` `.vite-hooks/_/` は commit しない（`.gitignore` 済み）。

## 技術スタック規約

- **Worker(API)は Hono + Effect** で書く。Effect のイディオム（generators／`yield*`／Layer によるDI／`Effect.retry` による検証→再生成）に従う（ADR-0001/0006）。
- **スキーマは Effect.Schema のみ**。zod/valibot は混ぜない（ADR-0004 改訂）。
- **クライアント(Preact)に Effect ランタイムを入れない**。スキーマから `import type` で型だけ共有する。
- パッケージ操作・実行は **pnpm / `vp` 経由**（npm/yarn は使わない）。
- `.vite-hooks/_/` は `vp config` が生成する（編集しない）。ユーザフックは `.vite-hooks/<hook>` に置く。
- 姓の生成は常に**実在姓**に限定し、捏ねた珍姓を出さない（ADR-0001、CONTEXT.md「実在姓」）。

## 自律範囲と要承認事項

以下は**人間の確認が必須**。勝手に実行・変更しないこと（該当 PR を作り、レビューを仰ぐ）。

- 本番デプロイ・`main` への push・マージ
- `AGENTS.md` / CI(`.github/`) / `.vite-hooks/` / `CODEOWNERS` の変更
- Terraform(`*.tf`, `*.tfvars`) / インフラ構成の変更
- `docs/adr/` 配下の ADR の追加・変更（アーキテクチャ決定）
- `wrangler.jsonc` / `pnpm-workspace.yaml`（Vite+ override）の変更
- 新規シークレットの導入・外部 API キーの扱い

## 禁止事項

- **自分のガードレールを弱めない／回避しない**（このファイル・CI・hooks・CODEOWNERS・リント/型ルールの無効化や回避）。
- テスト/リント/型チェックを通すためだけに、理由なくルールを無効化しない。
- `CONTEXT.md` の用語と矛盾する命名をしない（ドメイン用語集を参照）。
- 実装前に `docs/adr/` を確認し、決定と矛盾する実装をしない。

## 参照

- ドメイン用語: `CONTEXT.md`
- 要件定義: `docs/requirements.md`
- アーキテクチャ決定: `docs/adr/0001`〜`0006`
