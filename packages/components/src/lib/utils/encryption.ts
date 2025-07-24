import CryptoJS from "crypto-es";
import {
  NEXT_PUBLIC_SECRET_STRING,
  NEXT_PUBLIC_AES_KEY,
  NEXT_PUBLIC_AES_IV,
} from "./env";

/**
 *
 * @param text - The string to be encrypted.
 * @param appendString - A boolean flag indicating whether to append a secret string
 * (from `process.env.NEXT_PUBLIC_SECRET_STRING`) to the text before encryption.
 * @returns The base64 encoded encrypted string.
 */
export function encryptText(text?: string, appendString?: boolean): string {
  console.log("[encryptText] Encrypting text", text);
  if (!text) {
    return "";
  }
  // TODO: Load these from env variables
  console.log(
    "[encryptText] Encrypting text with AES",
    NEXT_PUBLIC_SECRET_STRING
  );
  const textToEncrypt = appendString ? text + "Cwv5\$uV%" : text;

  const encrypted = CryptoJS.AES.encrypt(
    textToEncrypt,
    CryptoJS.enc.Utf8.parse(NEXT_PUBLIC_AES_KEY),
    {
      iv: CryptoJS.enc.Utf8.parse(NEXT_PUBLIC_AES_IV),
    }
  );
  return encrypted.toString();
}
