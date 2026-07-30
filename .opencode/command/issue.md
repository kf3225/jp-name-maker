---
description: GitHub issue番号を指定して、計画→レビュー→実装→レビュー→PR のサブエージェントパイプラインを実行する。例 /issue 4
agent: build
---

ユーザーは issue 番号 `$1` を指定した。以下のパイプラインを**サブエージェントを利用して**実行せよ。各段階で該当サブエージェントを Task で起動し、その結果を受けて次へ進める。ループ判定と引き継ぎはあなた（オーケストレータ）が行う。

## 0. 事前確認

- `gh issue view $1` で issue 本文と受け入れ基準を取得。
- `ready-for-agent` ラベルの有無を確認（推奨・無ければ警告しつつ続行可）。

## 1. 計画立案 — issue-planner

- Task(subagent_type=issue-planner) に issue 本文を渡し、実装計画を作成させる。

## 2. 計画レビュー — plan-reviewer（最大3往復）

- Task(subagent_type=plan-reviewer) に計画を渡して審査。
- `OK` → 次へ。`CHANGES_REQUESTED` → 指摘を添えて issue-planner に再計画させ、再度 plan-reviewer。
- **最大3回**（計画3回・レビュー3回まで）。3回でも OK にならなければ、現状の最善案と未解決指摘をユーザーに提示して判断を仰ぐ。

## 3. 実装 — implementer

- Task(subagent_type=implementer) に**承認された計画**を渡す。
- implementer は `../jp-name-maker.worktree/<ブランチ>` に git worktree を切り、関数型/OCPで実装し、`vp check/test/build` を Green にしてコミットする（pushはしない）。
- ブランチ名・worktreeパス・コミット一覧・テスト結果を受け取る。

## 4. 実装レビュー — impl-reviewer（最大3往復）

- Task(subagent_type=impl-reviewer) にブランチ/worktreeを渡して審査（パフォーマンス・セキュリティ最重視）。
- `OK` → 次へ。`CHANGES_REQUESTED` → 指摘を添えて implementer に再修正させ、再度 impl-reviewer。
- **最大3回**。3回でも OK でなければ、未解決指摘をユーザーに提示して判断を仰ぐ。

## 5. PR作成 — pr-author

- Task(subagent_type=pr-author) にブランチ/worktreeを渡し、push と PR 作成を行わせる。

## 6. 報告

- PR URL、計画レビュー/実装レビューの各ラウンド結果（OK になったか）、主要な指摘事項をユーザーに要約する。

## 拘束

- 各サブエージェントは状態を持たない葉ワーカー。ループと引き継ぎはあなたが行う。
- 方針転換などユーザーの確認が必要な判断はユーザーに戻す。
- ガードレール遵守: `AGENTS.md`/`.github/`/`.opencode/`/`.vite-hooks/`/`CODEOWNERS`/Terraform/`docs/adr/` の変更は要承認。
