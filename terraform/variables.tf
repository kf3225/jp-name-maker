variable "cloudflare_api_token" {
  type      = string
  sensitive = true
  description = "Cloudflare API token (scoped to Workers/KV/Turnstile/Zone).渡しは CI Secret または TF_VAR_cloudflare_api_token 環境変数。"
}

variable "cloudflare_account_id" {
  type      = string
  description = "Cloudflare account ID."
}
