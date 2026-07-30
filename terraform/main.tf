terraform {
  required_version = ">= 1.9"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }

  # リモート state の backend は本番アカウント接続時に構成する
  # （Terraform Cloud / Cloudflare R2(S3互換) 等）。ローカル *.tfstate は .gitignore 対象。
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# リソース定義は本番アカウント接続時に追加する。想定される構成（ADR-0002/0003/0005）:
#   - cloudflare_workers_kv_namespace: レート制限カウンタ用（rl:{id}:{date}、ADR-0005 §1/§7）
#   - cloudflare_turnstile_widget:     ボット対策（ADR-0005 §3）
#   - cloudflare_record / zone:        公開ドメイン
# Worker スクリプト本体は Wrangler がデプロイし、バインディング/KV/Turnstile 等は
# Terraform が所有して生成 ID を wrangler.jsonc に渡す（ADR-0003）。
