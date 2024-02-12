declare namespace NodeJS {
  export interface ProcessEnv {
    HOST_NAME: string
    NEXTAUTH_URL_INTERNAL: string
    NEXTAUTH_SECRET: string
    AES_IV: string
    AES_KEY: string
    NEXT_PUBLIC_API_URL: string
    NEXT_PUBLIC_HOST_URL: string
    NEXT_PUBLIC_INTERNAL_API_URL: string
    NEXT_PUBLIC_BRAND_API_URL: string
  }
}
