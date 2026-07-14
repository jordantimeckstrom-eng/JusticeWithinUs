provider "google" {
  project = var.project_id
  region  = var.region
}

provider "vercel" {
  team = var.vercel_team_id != "" ? var.vercel_team_id : null
}

locals {
  app_url       = trimsuffix(var.app_url, "/")
  push_endpoint = "${local.app_url}/gmail/webhook"
  vercel_envs   = toset(var.vercel_project_id == "" ? [] : var.vercel_environments)
}

resource "random_password" "cron_secret" {
  length  = 48
  special = false
}

resource "google_pubsub_topic" "gmail" {
  name                       = var.topic_name
  message_retention_duration = "604800s"

  labels = {
    app     = "juscr"
    purpose = "gmail-ouroboros"
  }
}

resource "google_pubsub_topic_iam_member" "gmail_publisher" {
  topic  = google_pubsub_topic.gmail.name
  role   = "roles/pubsub.publisher"
  member = "serviceAccount:gmail-api-push@system.gserviceaccount.com"
}

resource "google_service_account" "pubsub_invoker" {
  account_id   = "gmail-pubsub-invoker"
  display_name = "Gmail Pub/Sub Push Invoker"
  description  = "Signs OIDC tokens for Gmail Pub/Sub push requests to the JUSCR webhook."
}

resource "google_project_iam_member" "token_creator" {
  project = var.project_id
  role    = "roles/iam.serviceAccountTokenCreator"
  member  = "serviceAccount:service-${data.google_project.current.number}@gcp-sa-pubsub.iam.gserviceaccount.com"
}

data "google_project" "current" {
  project_id = var.project_id
}

resource "google_pubsub_subscription" "gmail_push" {
  name  = var.subscription_name
  topic = google_pubsub_topic.gmail.id

  ack_deadline_seconds       = 60
  message_retention_duration = "604800s"
  retain_acked_messages      = false

  push_config {
    push_endpoint = local.push_endpoint

    oidc_token {
      service_account_email = google_service_account.pubsub_invoker.email
      audience              = local.app_url
    }
  }

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  expiration_policy {
    ttl = ""
  }

  depends_on = [
    google_pubsub_topic_iam_member.gmail_publisher,
    google_project_iam_member.token_creator,
  ]
}

resource "vercel_project_environment_variable" "google_pubsub_topic" {
  for_each   = local.vercel_envs
  project_id = var.vercel_project_id
  key        = "GOOGLE_PUBSUB_TOPIC"
  value      = google_pubsub_topic.gmail.id
  target     = [each.value]
}

resource "vercel_project_environment_variable" "cron_secret" {
  for_each   = local.vercel_envs
  project_id = var.vercel_project_id
  key        = "CRON_SECRET"
  value      = random_password.cron_secret.result
  target     = [each.value]
  sensitive  = true
}
