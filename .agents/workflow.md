# Issue → PR ワークフロー（クロスツール）

GitHub issue から PR までの**共通ワークフロー**。opencode / Claude Code / Codex 等、どのエージェントツールでも同じ手順を辿れるようにする。各ツールのコマンド・サブエージェントはこの文書を前提とし、ここが**唯一の正（カノニカル）**。

## パイプライン

issue 番号 `N` を指定して起動する。

0. **事前確認**: `gh issue view N` で本文と受け入れ基準を取得。`ready-for-agent` ラベルを推奨。
1. **計画立案**（issue-planner）: issue を読み、縦剖断の実装計画を立てる。
2. **計画レビュー**（plan-reviewer）: 計画を審査し `OK` / `CHANGES_REQUESTED` を返す。**最大3往復**。
3. **実装**（implementer）: 承認された計画に従い worktree で実装。`vp check/test/build` を Green にしてコミット（push はしない）。
4. **実装レビュー**（impl-reviewer）: 差分を**性能/セキュリティ最重視**で審査。**最大3往復**。
5. **PR作成**（pr-author）: push して `.github/pull_request_template.md` で PR 作成。
6. **報告**: PR URL と各ラウンドの結果（OK になったか）・主要指摘を要約。

いずれのレビューも3往復で OK にならなければ、未解決指摘をユーザーに提示して判断を仰ぐ。

## ロールと制約

### issue-planner（計画立案・読み取り専用）
- **縦剖断**（スキーマ→API→コア→UI→テストを貫く窄い完結経路）。単一レイヤの横断にしない。
- `CONTEXT.md` / `docs/adr/0001`〜`0006` / `docs/requirements.md` に準拠。
- **関数型プログラミング**（純粋関数・イミュータブル・副作用の分離）＋**オープンクローズの原則**（拡張に開き・修正に閉じる）。
- Effect のイディオム（`Effect.gen`/`yield*`、Layer によるDI、`Effect.retry`）。スキーマは Effect.Schema のみ（ADR-0006）。
- ドメイン不変量（実在姓制約など）のテストを計画に含める。
- **コードを書かない・ファイルを編集しない。**

### plan-reviewer（計画レビュー・読み取り専用・最大3往復）
- 審査: 受け入れ基準の網羅・ADR/用語との整合・縦剖断・テスト計画・FP/OCP・リスク明示。
- 出力の1行目は `OK` または `CHANGES_REQUESTED`。修正なら番号付きの具体的指示。
- **コードを書かない・ファイルを編集しない。**

### implementer（実装）
- ブランチ名は issue 番号+スラッグ（例: `feat/4-surname-validation`）。
- **git worktree をルートディレクトリの1個上の階層に切る**: `git worktree add ../jp-name-maker.worktree/<branch> -b <branch>`（同名があれば再利用）。以降の作業はすべてその worktree 配下で行う。
- worktree 内で `pnpm install`（または `vp install`）。
- **関数型/OCP** で実装。Effect イディオム。ドメイン用語は `CONTEXT.md` 準拠。
- `vp check` → `vp test` → `vp build` を**すべて Green**。
- **Conventional Commits** でコミット（`type: subject`・type 必須・subject-case 無効化済）。**push しない**（pr-author が行う）。

### impl-reviewer（実装レビュー・読み取り専用・最大3往復）
- **パフォーマンス**（不要な再計算・過剰なLLM呼出・バンドル肥大化・クライアントへの重い依存漏洩・N+1）と **セキュリティ**（秘密のハードコード/ログ・入力検証(Effect.Schema)・プロンプトインジェクション・レート制限/認可の抜け・シークレットコミット）を**最重視**。
- 併せて: ドメイン不変量の維持・ADR/用語準拠・テスト妥当性・FP/OCP。
- 出力の1行目は `OK` または `CHANGES_REQUESTED`。
- **コードを書かない・ファイルを編集しない。**

### pr-author（PR作成）
- worktree で `git push -u origin <branch>`。
- `gh pr create --base main --head <branch> --title "type: subject" --body <.github/pull_request_template.md の埋め>`。
- 本文に `Closes #N`。実装が複数コミットでも PR タイトルは1つの要約（Conventional Commits）。

## ツール別の実行方法

### opencode
- `/issue N`（`.opencode/command/issue.md`）がサブエージェント5種（`.opencode/agents/`）を Task で起動してパイプラインを実行。

### Claude Code
- `/issue N`（`.claude/commands/issue.md`）がサブエージェント5種（`.claude/agents/`）を Task で起動して実行。

### Codex / その他（サブエージェント非対応）
**シングルエージェントモード**: 上記パイプラインを1人のエージェントが順に実行する。各レビュー段階（計画レビュー・実装レビュー）は自己審査したうえで**ユーザーに提示して承認（`OK`/修正指示）を得る**。最大3往復・worktree・コミット規約は同じ。この文書（`.agents/workflow.md`）と `AGENTS.md` だけを読めば実行できる。

## 共通規約（全ロール・全ツール）
- ガードレール遵守: `AGENTS.md` / `.github/` / `.opencode/` / `.claude/` / `.vite-hooks/` / `CODEOWNERS` / Terraform(`*.tf`,`*.tfvars`) / `docs/adr/` の変更は人間の承認が必須。
- コミット前に `vp check`。秘密は絶対 commit しない（gitleaks / Push Protection）。
- `dist/` `node_modules/` `.wrangler/` `.vite-hooks/_/` は commit しない。
- ドメイン用語は `CONTEXT.md`、アーキテクチャは ADR を遵守。
