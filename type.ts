declare namespace NodeJS {
  export interface ProcessEnv {
    HOST_NAME: string
    NEXTAUTH_URL_INTERNAL: string
    NEXTAUTH_SECRET: string
    NEXT_PUBLIC_API_URL: string
    NEXT_PUBLIC_HOST_URL: string
    NEXT_PUBLIC_INTERNAL_API_URL: string
    NEXT_PUBLIC_BRAND_API_URL: string
    NEXT_PUBLIC_RUDDERSTACK_KEY: string
    NEXT_PUBLIC_RUDDERSTACK_URL: string
    NEXT_PUBLIC_AES_KEY: string
    NEXT_PUBLIC_AES_IV: string
    NEXT_PUBLIC_RECAPTCHA_CLIENT_KEY: string
  }
}
