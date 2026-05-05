import { NEXT_PUBLIC_SECRET_STRING, NEXT_PUBLIC_AES_KEY, NEXT_PUBLIC_AES_IV } from "./env";

/**
 * Lazy-loads the crypto-es AES and encoding modules
 */
async function getCryptoModules() {
  const response = await import("crypto-es");

  return { AES: response.default.AES, enc: response.default.enc };
}

/**
 *
 * @param text - The string to be encrypted.
 * @param appendString - A boolean flag indicating whether to append a secret string
 * (from `process.env.NEXT_PUBLIC_SECRET_STRING`) to the text before encryption.
 * @returns The base64 encoded encrypted string.
 */
export async function encryptText(text?: string, appendString?: boolean): Promise<string> {
  // console.log("[encryptText] Encrypting text", text);
  if (!text) {
    return "";
  }

  // Lazy-load crypto-es modules
  const { AES, enc } = await getCryptoModules();

  const textToEncrypt = appendString ? text + "Cwv5$uV%" : text;

  const encrypted = AES.encrypt(textToEncrypt, enc.Utf8.parse(NEXT_PUBLIC_AES_KEY), {
    iv: enc.Utf8.parse(NEXT_PUBLIC_AES_IV),
  });

  return encrypted.toString();
}
