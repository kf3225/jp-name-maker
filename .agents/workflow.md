# Issue → PR ワークフロー（クロスツール）

GitHub issue から PR までの**共通ワークフロー**。opencode / Claude Code / Codex 等、どのツールでも同じ手順を辿れるようにする。

- **ロールのプロンプト本体（正）**: `.agents/agents/<role>.md`。各ツールのエージェント定義はここを参照する（opencode は `opencode.json` の `{file:}`、Claude Code は `.claude/agents/`）。
- パイプラインのオーケストレーションと共通規約はこの文書。

## パイプライン

issue 番号 `N` を指定して起動。

0. **事前確認**: `gh issue view N`。`ready-for-agent` ラベルを推奨。
1. **計画立案**（issue-planner）: 縦剖断の実装計画。
2. **計画レビュー**（plan-reviewer）: `OK`/`CHANGES_REQUESTED`。**最大3往復**。
3. **実装**（implementer）: worktree で実装。`vp check/test/build` Green → コミット（push しない）。
4. **実装レビュー**（impl-reviewer）: **性能/セキュリティ最重視**。**最大3往復**。
5. **PR作成**（pr-author）: push して `.github/pull_request_template.md` で PR。
6. **報告**: PR URL と各ラウンド結果を要約。

いずれのレビューも3往復で OK にならなければ、未解決指摘をユーザーに提示して判断を仰ぐ。

## ロール（詳細は `.agents/agents/<role>.md`）

| ロール | モード | 役割 |
|---|---|---|
| [issue-planner](agents/issue-planner.md) | 読み取り専用 | 縦剖断の計画立案 |
| [plan-reviewer](agents/plan-reviewer.md) | 読み取り専用・最大3往復 | 計画審査 → OK/CHANGES_REQUESTED |
| [implementer](agents/implementer.md) | 編集可 | worktree(`../jp-name-maker.worktree/<branch>`)・関数型/OCP 実装 |
| [impl-reviewer](agents/impl-reviewer.md) | 読み取り専用・最大3往復 | 性能/セキュリティ最重視の審査 |
| [pr-author](agents/pr-author.md) | PR作成 | push ＋ テンプレートで PR |

## ツール別の実行方法

### opencode

- `/issue N`（`.opencode/command/issue.md`）。サブエージェントは `opencode.json` の `agent` ブロック（プロンプトは `.agents/agents/<role>.md` を `{file:}` 参照）。

### Claude Code

- `/issue N`（`.claude/commands/issue.md`）。サブエージェントは `.claude/agents/<role>.md`（実行時に `.agents/agents/<role>.md` を読む）。

### Codex / その他（サブエージェント非対応）

**シングルエージェントモード**: 1人のエージェントが順に実行。各レビュー段階は自己審査のうえ**ユーザーに承認を得る**（`OK`/修正指示）。最大3往復・worktree・コミット規約は同じ。`AGENTS.md` とこの文書と `.agents/agents/` を読めば実行できる。

## 共通規約（全ロール・全ツール）

- ガードレール遵守: `AGENTS.md` / `CLAUDE.md` / `.github/` / `.opencode/` / `.claude/` / `.agents/agents/` / `.agents/workflow.md` / `.vite-hooks/` / `CODEOWNERS` / Terraform(`*.tf`,`*.tfvars`) / `docs/adr/` の変更は人間の承認が必須。
- コミット前に `vp check`。秘密は絶対 commit しない（gitleaks / Push Protection）。
- `dist/` `node_modules/` `.wrangler/` `.vite-hooks/_/` は commit しない。
- ドメイン用語は `CONTEXT.md`、アーキテクチャは ADR を遵守。
