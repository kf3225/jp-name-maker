# Issue → PR ワークフロー

`/issue <N>` で動く、issue から PR までのパイプライン。サブエージェント定義は `.opencode/agents/<role>.md`、オーケストレーションは `.opencode/command/issue.md`。この文書はパイプラインと共通規約の参照。

## パイプライン

issue 番号 `N` を指定して起動。

0. **事前確認**: `gh issue view N`。`ready-for-agent` ラベルを推奨。
1. **計画立案**（issue-planner）: 縦剖断の実装計画。
2. **計画レビュー**（plan-reviewer）: `OK`/`CHANGES_REQUESTED`。**最大3往復**。
3. **実装**（implementer）: worktree で実装。**TDD（red-green）で進める**（`tdd` スキル: `.claude/skills/tdd/`）— 縦スライスで「失敗テスト → 最小実装」を繰り返す。`vp check/test/build` Green → コミット（push しない）。
4. **実装レビュー**（impl-reviewer）: **性能/セキュリティ最重視**。**最大3往復**。
5. **PR作成**（pr-author）: push して `.github/pull_request_template.md` で PR。
6. **報告**: PR URL と各ラウンド結果を要約。
7. **マージ後クリーンアップ**（オーケストレータ・ユーザー通知後に実行）: マージは人間の操作（要承認）。ユーザーがマージ完了を通知した後に実行 — `git worktree list` で該当 worktree を特定し `git worktree remove <path>`、ローカルブランチ削除（`git branch -d <branch>`）、`git fetch --prune` でリモート追跡ブランチ整理。issue が `Closes #N` で自動クローズされたか確認し、未クローズなら `gh issue close N`。

いずれのレビューも3往復で OK にならなければ、未解決指摘をユーザーに提示して判断を仰ぐ。

## ロール（定義は `.opencode/agents/<role>.md`）

| ロール | モード | 役割 |
|---|---|---|
| issue-planner | 読み取り専用 | 縦剖断の計画立案 |
| plan-reviewer | 読み取り専用・最大3往復 | 計画審査 → OK/CHANGES_REQUESTED |
| implementer | 編集可 | worktree(`../jp-name-maker.worktree/<branch>`)・関数型/OCP 実装 |
| impl-reviewer | 読み取り専用・最大3往復 | 性能/セキュリティ最重視の審査 |
| pr-author | PR作成 | push ＋ テンプレートで PR |

## 共通規約（全ロール）

- ガードレール遵守: `AGENTS.md` / `.github/` / `.opencode/` / `.agents/workflow.md` / `.vite-hooks/` / `CODEOWNERS` / Terraform(`*.tf`,`*.tfvars`) / `docs/adr/` の変更は人間の承認が必須。
- コミット前に `vp check`。秘密は絶対 commit しない（gitleaks / Push Protection）。
- `dist/` `node_modules/` `.wrangler/` `.vite-hooks/_/` は commit しない。
- ドメイン用語は `CONTEXT.md`、アーキテクチャは ADR を遵守。
- **マージは人間の操作（要承認）**: main へのマージ・デプロイは人間が行う。マージ後のクリーンアップはオーケストレータがユーザー通知後に実行。
