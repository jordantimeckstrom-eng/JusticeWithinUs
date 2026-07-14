output "topic_id" {
  description = "Full Pub/Sub topic resource ID for GOOGLE_PUBSUB_TOPIC."
  value       = google_pubsub_topic.gmail.id
}

output "push_endpoint" {
  description = "Webhook endpoint Pub/Sub will call."
  value       = local.push_endpoint
}

output "pubsub_invoker_service_account" {
  description = "Service account used to sign OIDC tokens for Pub/Sub push."
  value       = google_service_account.pubsub_invoker.email
}

output "cron_secret" {
  description = "Generated CRON_SECRET. Store this in Vercel if not managing env vars with Terraform."
  value       = random_password.cron_secret.result
  sensitive   = true
}

output "next_steps" {
  description = "Operational steps after Terraform apply."
  value = <<EOT
1. Set GOOGLE_PUBSUB_TOPIC to ${google_pubsub_topic.gmail.id} in Vercel if vercel_project_id was not provided.
2. Visit ${local.app_url}/auth/gmail, approve OAuth, and store the refresh token as GOOGLE_REFRESH_TOKEN in Vercel.
3. Start the Gmail watch: curl -X POST ${local.app_url}/gmail/watch
4. Verify status: curl ${local.app_url}/gmail/status | jq
5. Send a test email and watch Vercel logs.
EOT
}
