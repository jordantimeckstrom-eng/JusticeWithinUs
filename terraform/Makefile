SHELL := /usr/bin/env bash
APP_URL := $(shell terraform output -raw push_endpoint 2>/dev/null | sed 's#/gmail/webhook##')

.PHONY: init plan apply outputs watch-status fmt validate

init:
	terraform init

plan:
	terraform plan

apply:
	terraform apply

outputs:
	terraform output

watch-status:
	@if [ -z "$(APP_URL)" ]; then echo "Run terraform apply first or set APP_URL."; exit 1; fi
	curl -fsS "$(APP_URL)/gmail/status" | jq

fmt:
	terraform fmt -recursive

validate:
	terraform validate
