# Claude Code 向けの案内

このプロジェクトのエージェント指示は **AGENTS.md** に統一しています。まず [AGENTS.md](./AGENTS.md) を読んでください。

## issue 作業パイプライン

- コマンド: `/issue <N>`（`.claude/commands/issue.md`）
- サブエージェント: `.claude/agents/`（issue-planner / plan-reviewer / implementer / impl-reviewer / pr-author）
- ワークフローの正: `.agents/workflow.md`
