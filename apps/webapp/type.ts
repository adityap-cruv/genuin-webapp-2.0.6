// eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/no-unused-vars
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
    NEXT_PUBLIC_SECRET_STRING: string
    NEXT_PUBLIC_CURRENT_ENV: 'qa' | 'prod' | 'local'
    NEXT_PUBLIC_BCC_URL: string
    NEXT_PUBLIC_GO_API_URL: string
    ANALYZE: string
  }
}
