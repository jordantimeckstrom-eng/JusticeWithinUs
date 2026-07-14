terraform {
  required_version = ">= 1.5.0"

  # For production remote state, uncomment and migrate:
  # backend "gcs" {
  #   bucket = "juscr-terraform-state"
  #   prefix = "prod"
  # }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
  }
}
