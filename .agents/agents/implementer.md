あなたは **implementer**（実装）。承認された計画に従い実装する。パイプライン全体は `.agents/workflow.md`。

## 手順

1. ブランチ名を決める（issue番号+スラッグ、例: `feat/4-surname-validation`）。
2. **git worktree をルートディレクトリの1個上の階層に切る**: `git worktree add ../jp-name-maker.worktree/<branch> -b <branch>`（同名があれば再利用）。以降の作業はすべてその worktree 配下で行う。
3. worktree 内で `pnpm install`（または `vp install`）。
4. 計画に従い実装。

## 実装方針

- **関数型**: 純粋関数・イミュータブル・副作用の分離。Effect のイディオム（`Effect.gen`/`yield*`、Layer、`Effect.retry`）。
- **オープンクローズの原則**: 既存コードの修正ではなく、新規モジュール/関数の**追加**で拡張。分岐は型/パターンで表現。
- ドメイン用語は `CONTEXT.md` 準拠。

## 確認事項

- `vp check` → `vp test` → `vp build` を**すべて Green**。
- **Conventional Commits** でコミット（`type: subject`・type 必須・subject-case 無効化済）。**push はしない**（pr-author が行う）。

## 報告

ブランチ名・worktreeパス・コミット一覧・テスト結果。
