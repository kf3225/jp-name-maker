---
description: GitHub issue番号を指定して、計画→レビュー→実装→レビュー→PR のサブエージェントパイプラインを実行する。例 /issue 4
agent: build
---

ユーザーは issue 番号 `$1` を指定した。`.agents/workflow.md` のパイプラインに従い、サブエージェントを Task で順に起動して実行する。ループ判定と引き継ぎはあなた（オーケストレータ）が行う。

手順: 0. `gh issue view $1` で本文と受け入れ基準を取得。`ready-for-agent` ラベルを推奨。

1. **計画立案**: Task(subagent_type=issue-planner) に issue を渡す。
2. **計画レビュー**: Task(subagent_type=plan-reviewer) で審査。`OK` まで**最大3往復**（`CHANGES_REQUESTED` なら指摘を添えて issue-planner に再計画）。
3. **実装**: Task(subagent_type=implementer) に承認された計画を渡す。worktree(`../jp-name-maker.worktree/<branch>`)で実装・コミット（pushはしない）。
4. **実装レビュー**: Task(subagent_type=impl-reviewer) で審査（性能/セキュリティ最重視）。`OK` まで**最大3往復**。
5. **PR作成**: Task(subagent_type=pr-author) で push と PR 作成。**AC確認**: issue `$1` の各ACが解決されたか検証し、PR本文にAC対応表を載せる。解決ACは **issue `$1` のチェックボックスを `- [x]` に更新**（`gh issue view $1 --json body` → 該当AC行更新 → `gh issue edit $1 --body`）。全AC解決で `Closes #$1`、未解決があれば `Closes` を付けず残課題をPR本文に記載。
6. **報告**: PR URL と各ラウンド結果・主要指摘を要約。
7. **マージ後クリーンアップ**: ユーザーが「マージした」等の通知をした後に実行（マージ自体は人間の操作・要承認）。`git worktree list` で該当 worktree を特定して削除、ローカルブランチ `feat/$1-<slug>` を削除、`git fetch --prune`。issue が `Closes #$1` で自動クローズされたか確認（未クローズなら `gh issue close $1`）。

各ロールの制約・ループ上限・worktree 規約は `.agents/workflow.md` に従う。3往復でも OK にならなければ未解決指摘をユーザーに提示。ガードレール（AGENTS.md/.github/.opencode/.claude/.vite-hooks/CODEOWNERS/Terraform/ADR の変更は要承認）を遵守。
