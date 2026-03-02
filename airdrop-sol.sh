#!/usr/bin/env bash
set -euo pipefail

# A simple helper for requesting SOL airdrops on Solana devnet/testnet/localnet.
# Usage: ./airdrop-sol.sh <AMOUNT_SOL> [NETWORK] [RECIPIENT_PUBKEY]
# Example: ./airdrop-sol.sh 2 devnet
# Example: ./airdrop-sol.sh 1 testnet 9xQeWvG816bUx9EPf3vT2f8GfJk4rM1qfX2rRk5n2K2U

if [[ $# -lt 1 || $# -gt 3 ]]; then
  echo "Usage: $0 <AMOUNT_SOL> [NETWORK: devnet|testnet|localnet] [RECIPIENT_PUBKEY]" >&2
  exit 1
fi

amount="$1"
network="${2:-devnet}"
recipient="${3:-}"

case "$network" in
  devnet)
    rpc_url="https://api.devnet.solana.com"
    ;;
  testnet)
    rpc_url="https://api.testnet.solana.com"
    ;;
  localnet)
    rpc_url="http://127.0.0.1:8899"
    ;;
  *)
    echo "Invalid network: $network. Use devnet, testnet, or localnet." >&2
    exit 1
    ;;
esac

if ! command -v solana >/dev/null 2>&1; then
  echo "Error: solana CLI is not installed or not in PATH." >&2
  exit 1
fi

if [[ -n "$recipient" ]]; then
  echo "Requesting ${amount} SOL on ${network} for recipient ${recipient}..."
  solana airdrop "$amount" "$recipient" --url "$rpc_url"
  echo "Current balance:"
  solana balance "$recipient" --url "$rpc_url"
else
  echo "Requesting ${amount} SOL on ${network} for your configured wallet..."
  solana airdrop "$amount" --url "$rpc_url"
  echo "Current balance:"
  solana balance --url "$rpc_url"
fi
