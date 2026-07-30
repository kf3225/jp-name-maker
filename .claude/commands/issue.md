---
description: GitHub issue番号を指定し、計画→レビュー→実装→レビュー→PR のパイプラインをサブエージェントで実行。例 /issue 4
argument-hint: <issue-number>
---

ユーザーは issue 番号 $ARGUMENTS を指定した。`.agents/workflow.md` のパイプラインに従い、サブエージェントを Task で順に起動して実行する。

手順: 0. `gh issue view $ARGUMENTS` を取得。

1. Task(issue-planner) で計画立案。
2. Task(plan-reviewer) で審査。`OK` まで最大3往復（`CHANGES_REQUESTED` なら指摘を添えて issue-planner に再計画）。
3. Task(implementer) に承認された計画を渡して実装（worktree・コミットまで）。
4. Task(impl-reviewer) で審査。`OK` まで最大3往復。
5. Task(pr-author) で push ＆ PR 作成。
6. PR URL と各ラウンド結果をユーザーに要約。

各ロールの制約・ループ上限・worktree 規約は `.agents/workflow.md` に従う。ループ判定と引き継ぎはあなたが行う。
