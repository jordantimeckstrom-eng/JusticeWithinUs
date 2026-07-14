# Gmail Pub/Sub Terraform

This directory provisions the Gmail Pub/Sub bridge used by the JUSCR Ouroboros Gmail ingestion flow.

## Resources

- `google_pubsub_topic.gmail`: `gmail-ouroboros` topic with seven-day message retention.
- `google_pubsub_topic_iam_member.gmail_publisher`: grants `gmail-api-push@system.gserviceaccount.com` `roles/pubsub.publisher`, which Gmail requires before it can publish watch notifications.
- `google_service_account.pubsub_invoker`: service account used for authenticated Pub/Sub push delivery.
- `google_project_iam_member.token_creator`: allows the Google-managed Pub/Sub service agent to mint OIDC tokens for push requests.
- `google_pubsub_subscription.gmail_push`: push subscription that calls `/gmail/webhook` with OIDC auth, 60-second ack deadline, and exponential retry backoff.
- Optional `vercel_project_environment_variable` resources: writes `GOOGLE_PUBSUB_TOPIC` and `CRON_SECRET` when `vercel_project_id` is configured.

## Quick start

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit project_id and app_url.
terraform init
terraform plan
terraform apply
```

Useful outputs:

```bash
terraform output topic_id
terraform output push_endpoint
terraform output next_steps
terraform output -raw cron_secret
```

## Makefile helpers

```bash
make init
make plan
make apply
make outputs
make watch-status
```

`make watch-status` reads `push_endpoint`, strips `/gmail/webhook`, and calls `/gmail/status`.

## After apply

1. If Terraform is not managing Vercel variables, set `GOOGLE_PUBSUB_TOPIC` to the `topic_id` output.
2. Visit `/auth/gmail`, approve OAuth, and save the refresh token as `GOOGLE_REFRESH_TOKEN` in Vercel.
3. Start the Gmail watch:

   ```bash
   curl -X POST https://your-app.vercel.app/gmail/watch
   ```

4. Verify status:

   ```bash
   curl https://your-app.vercel.app/gmail/status | jq
   ```

5. Send a test email and follow Vercel logs.

## Import existing resources

If the shell script already created the topic and subscription, import them before planning:

```bash
terraform import google_pubsub_topic.gmail projects/PROJECT_ID/topics/gmail-ouroboros
terraform import google_pubsub_subscription.gmail_push projects/PROJECT_ID/subscriptions/gmail-ouroboros-push
```

## Remote state for production

Uncomment the `backend "gcs"` block in `versions.tf`, create the state bucket, then migrate local state:

```bash
gsutil mb gs://juscr-terraform-state
terraform init -migrate-state
```
