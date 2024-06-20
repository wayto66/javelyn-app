import * as crypto from "crypto";

export async function generateHmacSignature(body: Record<any, any>) {
  const secret = process.env.HMAC_SECRET;
  if (!secret) return "no-secret-found";
  return crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");
}
