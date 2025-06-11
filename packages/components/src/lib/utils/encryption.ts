import CryptoJS from "crypto-es";

/**
 *
 * @param text - The string to be encrypted.
 * @param appendString - A boolean flag indicating whether to append a secret string
 * (from `process.env.NEXT_PUBLIC_SECRET_STRING`) to the text before encryption.
 * @returns The base64 encoded encrypted string.
 */
export function encryptText(text?: string, appendString?: boolean): string {
  if (!text) {
    return "";
  }
  // TODO: Load these from env variables
  const textToEncrypt = appendString ? text + "fg&t8W+d" : text;
  const encrypted = CryptoJS.AES.encrypt(
    textToEncrypt,
    CryptoJS.enc.Utf8.parse("Z42F5Sv8Fh4laR06QoU5F78S2c5BXV6Y"),
    {
      iv: CryptoJS.enc.Utf8.parse("NdAaKumC4ZCInAFy"),
    }
  );
  return encrypted.toString();
}
