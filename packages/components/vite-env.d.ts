type ImportMetaEnv = {
  readonly NEXT_PUBLIC_RUDDERSTACK_KEY?: string;
  readonly NEXT_PUBLIC_RUDDERSTACK_URL?: string;
  readonly NEXT_PUBLIC_MEDIA_BASE_URL?: string;
  readonly NEXT_PUBLIC_HOST_URL?: string;
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};
