export type LinkoutLinkInput = {
  form: any;
  fieldName: string;
  label: string;
  placeholder: string;
  isLoading?: boolean;
  disabled?: boolean;
  showFieldIcon?: boolean;
  callbackFunc?: (url: string) => void;
};

export type ErrorMessage = {
  type?: string;
  error?: string;
  formMessageId: string;
};
