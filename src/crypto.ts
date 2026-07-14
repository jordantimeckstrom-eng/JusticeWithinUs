const enc = new TextEncoder();
const dec = new TextDecoder();

export async function deriveNullifier(input: string): Promise<string> {
  const data = enc.encode(`juscr:voprf:mock:${input.trim().toLowerCase()}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function keyFromNullifier(nullifier: string): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(`juscr:aes:${nullifier}`));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptState<T>(state: T, nullifier: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await keyFromNullifier(nullifier);
  const bytes = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(state)));
  return JSON.stringify({ v: 2, iv: Array.from(iv), data: Array.from(new Uint8Array(bytes)) });
}

export async function decryptState<T>(payload: string, nullifier: string): Promise<T> {
  const parsed = JSON.parse(payload) as { iv: number[]; data: number[] };
  const key = await keyFromNullifier(nullifier);
  const bytes = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(parsed.iv) },
    key,
    new Uint8Array(parsed.data),
  );
  return JSON.parse(dec.decode(bytes)) as T;
}

export function simulateDkg(participants = 6, threshold = 4) {
  return Array.from({ length: participants }, (_, i) => ({
    id: `guardian-${i + 1}`,
    share: crypto.randomUUID(),
    threshold,
  }));
}
