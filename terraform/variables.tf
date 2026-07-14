variable "project_id" {
  description = "Google Cloud project ID that owns the Gmail Pub/Sub resources."
  type        = string
}

variable "app_url" {
  description = "Base HTTPS URL of the deployed application, without a trailing slash."
  type        = string

  validation {
    condition     = can(regex("^https://[^/]+$", var.app_url))
    error_message = "app_url must be an HTTPS origin without a trailing slash, e.g. https://example.vercel.app."
  }
}

variable "region" {
  description = "Default Google Cloud region for provider configuration."
  type        = string
  default     = "us-central1"
}

variable "topic_name" {
  description = "Name of the Gmail Pub/Sub topic."
  type        = string
  default     = "gmail-ouroboros"
}

variable "subscription_name" {
  description = "Name of the Pub/Sub push subscription."
  type        = string
  default     = "gmail-ouroboros-push"
}

variable "vercel_project_id" {
  description = "Optional Vercel project ID. When set, Terraform writes GOOGLE_PUBSUB_TOPIC and CRON_SECRET environment variables."
  type        = string
  default     = ""
}

variable "vercel_team_id" {
  description = "Optional Vercel team ID for projects owned by a team."
  type        = string
  default     = ""
}

variable "vercel_environments" {
  description = "Vercel environments that receive managed variables when vercel_project_id is set."
  type        = list(string)
  default     = ["production", "preview", "development"]
}
