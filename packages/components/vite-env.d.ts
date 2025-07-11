type ImportMetaEnv = {
  readonly NEXT_PUBLIC_RUDDERSTACK_KEY?: string;
  readonly NEXT_PUBLIC_RUDDERSTACK_URL?: string;
  readonly NEXT_PUBLIC_MEDIA_BASE_URL?: string;
  readonly NEXT_PUBLIC_HOST_URL?: string;
  readonly NEXT_PUBLIC_API_URL?: string;
  readonly NEXT_PUBLIC_AES_IV?: string;
  readonly NEXT_PUBLIC_AES_KEY?: string;
  readonly NEXT_PUBLIC_SECRET_STRING?: string;
  readonly NEXT_PUBLIC_REDIRECT_URI?: string;
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};
