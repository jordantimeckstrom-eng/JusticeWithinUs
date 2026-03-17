#!/usr/bin/env node
'use strict';

/**
 * Anchor a triple-entry hash to Solana using the Memo program.
 *
 * Required env/flags:
 *  - --hash <tripleEntryHash>
 *  - --keypair <path to Solana keypair json>
 *
 * Optional flags:
 *  - --rpc <rpc url> (default: https://api.devnet.solana.com)
 *  - --commitment <processed|confirmed|finalized> (default: confirmed)
 *  - --message-id <id> app-level idempotency hint (included in memo payload)
 */

const fs = require('fs');
const path = require('path');
let web3;

function getWeb3() {
  if (web3) {
    return web3;
  }

  try {
    web3 = require('@solana/web3.js');
    return web3;
  } catch (err) {
    throw new Error(
      "Missing dependency '@solana/web3.js'. Install it with: npm install @solana/web3.js"
    );
  }
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function usage() {
  console.log(
    [
      'Usage:',
      '  node scripts/anchor_triple_entry_hash.js --hash <tripleEntryHash> --keypair <path>',
      '',
      'Optional:',
      '  --rpc <rpcUrl>                (default: devnet)',
      '  --commitment <level>          (default: confirmed)',
      '  --message-id <messageId>      (included in memo payload)',
      '',
      'Example:',
      '  node scripts/anchor_triple_entry_hash.js --hash abcd1234 --keypair ~/.config/solana/id.json --message-id bid-42',
    ].join('\n')
  );
}

function loadKeypair(keypairPath) {
  const expanded = keypairPath.startsWith('~/')
    ? path.join(process.env.HOME || '', keypairPath.slice(2))
    : keypairPath;

  const raw = fs.readFileSync(expanded, 'utf8');
  const arr = JSON.parse(raw);

  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('Invalid keypair format: expected JSON array of numbers');
  }

  const { Keypair } = getWeb3();
  return Keypair.fromSecretKey(Uint8Array.from(arr));
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help || args.h) {
    usage();
    process.exit(0);
  }

  const tripleEntryHash = args.hash || process.env.TRIPLE_ENTRY_HASH;
  const keypairPath = args.keypair || process.env.SOLANA_KEYPAIR;

  if (!tripleEntryHash || !keypairPath) {
    usage();
    throw new Error('Missing required --hash and/or --keypair');
  }

  const {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction,
    clusterApiUrl,
  } = getWeb3();

  const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

  const rpcUrl = args.rpc || process.env.SOLANA_RPC_URL || clusterApiUrl('devnet');
  const commitment = args.commitment || process.env.SOLANA_COMMITMENT || 'confirmed';
  const messageId = args['message-id'] || process.env.MESSAGE_ID;

  const payer = loadKeypair(keypairPath);
  const connection = new Connection(rpcUrl, { commitment });

  const memoPayload = {
    tripleEntryHash,
    messageId: messageId || null,
    timestamp: new Date().toISOString(),
  };

  const instruction = new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(JSON.stringify(memoPayload), 'utf8'),
  });

  const transaction = new Transaction().add(instruction);

  const signature = await sendAndConfirmTransaction(connection, transaction, [payer], {
    commitment,
    skipPreflight: false,
    maxRetries: 5,
  });

  const explorer = `https://explorer.solana.com/tx/${signature}?cluster=${rpcUrl.includes('mainnet') ? 'mainnet' : 'devnet'}`;

  console.log('✅ Ceremony anchored to Solana Memo Program');
  console.log(`Signer: ${payer.publicKey.toBase58()}`);
  console.log(`RPC: ${rpcUrl}`);
  console.log(`Commitment: ${commitment}`);
  console.log(`Signature: ${signature}`);
  console.log(`Explorer: ${explorer}`);
  console.log(`Memo payload: ${JSON.stringify(memoPayload)}`);
}

main().catch((err) => {
  console.error(`❌ Failed to anchor ceremony: ${err.message}`);
  process.exit(1);
});
