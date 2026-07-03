import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

import { env, hasEncryptionKey } from "@/lib/env";

function getKey() {
  if (!hasEncryptionKey()) {
    throw new Error("ENCRYPTION_KEY nao configurada.");
  }

  return createHash("sha256").update(env.encryptionKey).digest();
}

export function encryptValue(value: string) {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptValue(payload: string) {
  const [ivHex, encryptedHex] = payload.split(":");

  if (!ivHex || !encryptedHex) {
    return payload;
  }

  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv("aes-256-cbc", getKey(), iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}
