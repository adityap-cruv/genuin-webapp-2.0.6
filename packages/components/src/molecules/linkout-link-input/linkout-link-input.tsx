"use client";

import { cn, Input, LinkIcon } from "@genuin/ui";
import { FormControl, FormField, FormItem, FormLabel, useFormField } from "@genuin/ui/form";
import { useCallback, useRef } from "react";
import type { ControllerRenderProps, FieldValues } from "react-hook-form";

import { useBaseContext } from "@genuin/components/context";
import { AllowedBrandModal } from "@genuin/components/organisms/allowed-brands-modal/allowed-brands-modal";
import { useValidateLinkoutUrlMutation } from "@genuin/components/react-query/api/posts/linkout-url-validate";

import type { ErrorMessage, LinkoutLinkInput } from "./linkout-link-input.types";

// Error message constants
const URL_ERROR_MESSAGES = {
  api_error: () => "We're having trouble loading this link. Please check the URL or try again later.",
  invalid_url: () => "Invalid URL",
  global_domain_blocked: () => "This link has been blocked. Please add a different link",
  brand_linkout_link_blocked: () => "This link has been blocked. Please add a different link",
  brand_linkout_domain_blocked: () => "This link has been blocked. Please add a different link",
  brand_domain_allowed_only: (brandName?: string) =>
    `Only links from the ${brandName} domain are allowed. Please add a relevant link.`,
  brands_network_domain_allowed_only: (brandName?: string) =>
    `Only links from the brands within ${brandName}'s network are allowed.`,
  genuin_network_domain_allowed_only: () =>
    "Only links from the brands existing within Genuin's ecosystem are allowed.",
} as const;

/* Helpers */
function normalizeUrl(url: string) {
  try {
    return new URL(url).href;
  } catch {
    return new URL("https://" + url).href;
  }
}

// Error Message Component for URL field
const ErrorMessage = ({ type, error, formMessageId }: ErrorMessage) => {
  if (!error) return;
  return (
    <div className="gencl:text-start">
      <p
        data-slot="form-message"
        id={formMessageId}
        className={cn(
          "gencl:inline gencl:text-body-1-medium! gencl:text-secondary-600 gencl:text-start",
          error && "gencl:text-red"
        )}>
        {error}
      </p>
      {(type === "brands_network_domain_allowed_only" || type === "genuin_network_domain_allowed_only") && (
        <span className="gencl:inline-flex gencl:ml-1 gencl:align-baseline">
          <AllowedBrandModal dialogTriggerClassName="gencl:text-body-1-medium! gencl:text-start gencl:text-red gencl:underline gencl:cursor-pointer">
            View allowed brands
          </AllowedBrandModal>
        </span>
      )}
    </div>
  );
};

type FieldContentProps = {
  field: ControllerRenderProps<FieldValues, string>;
  label: string;
  placeholder?: string;
  showFieldIcon: boolean;
  isUrlValidating: boolean;
  disabled: boolean;
  isLoading: boolean;
  onChangeInput: (
    event: React.ChangeEvent<HTMLInputElement>,
    onChangeFunc: (value: React.ChangeEvent<HTMLInputElement>) => void
  ) => void;
};

function LinkoutFieldContent({
  field,
  label,
  placeholder,
  showFieldIcon,
  isUrlValidating,
  disabled,
  isLoading,
  onChangeInput,
}: FieldContentProps) {
  const { error, formMessageId } = useFormField();

  return (
    <FormItem className="gencl:sm:w-full gencl:mb-4 gencl:mt-2">
      <FormLabel className="is-required">{label}</FormLabel>
      <FormControl>
        <Input
          {...field}
          {...(showFieldIcon && { icon: <LinkIcon /> })}
          placeholder={placeholder}
          className={cn(
            "gencl:border gencl:border-tertiary-200 gencl:bg-tertiary-100 gencl:text-title-3-med",
            error && "!gencl:border-red"
          )}
          onChange={(event) => onChangeInput(event, field.onChange)}
          readOnly={isUrlValidating}
          disabled={disabled}
          isLoading={isLoading || isUrlValidating}
        />
      </FormControl>
      <ErrorMessage type={error?.type} error={error?.message} formMessageId={formMessageId} />
    </FormItem>
  );
}

export function LinkoutLinkInput({
  form,
  fieldName,
  label,
  placeholder,
  disabled = false,
  isLoading = false,
  showFieldIcon = false,
  callbackFunc,
}: LinkoutLinkInput) {
  const { brandDetails } = useBaseContext();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const setUrlFieldError = useCallback(
    (type: keyof typeof URL_ERROR_MESSAGES, message: string) => {
      form.setError(fieldName, { type, message });
    },
    [form, fieldName]
  );

  // Validate Linkout URL Mutation
  const { mutate: validateUrl, isPending: isUrlValidating } = useValidateLinkoutUrlMutation({
    onSuccess: async ({ code, data, url }) => {
      // Early return for non-success status codes
      if (code !== 200) {
        setUrlFieldError("api_error", URL_ERROR_MESSAGES.invalid_url());
        return;
      }

      // Check if URL is valid and fetch metadata
      if (data?.valid_url) {
        // Clear field error if is valid
        form.clearErrors(fieldName);

        // If need to fetch metadata for linkout
        if (callbackFunc) {
          callbackFunc(normalizeUrl(url));
        }
        return;
      }

      // Set validation error for invalid brand
      const reason = data?.reason as keyof typeof URL_ERROR_MESSAGES;
      setUrlFieldError(reason, URL_ERROR_MESSAGES[reason](brandDetails.name));
      form.setFocus(fieldName);
    },
    onError: () => {
      setUrlFieldError("api_error", URL_ERROR_MESSAGES.api_error());
      form.setFocus(fieldName);
    },
  });

  const validateLinkoutUrl = useCallback(
    (url: string) => {
      const status = form.formState.errors.url;

      if (!url || status) return;

      validateUrl({
        url,
        is_linkout: true,
        platform: "web",
        brand_id: brandDetails?.brand_id,
      });
    },
    [form, validateUrl, brandDetails?.brand_id]
  );

  const onChangeInput = (
    event: React.ChangeEvent<HTMLInputElement>,
    onChangeFunc: (value: React.ChangeEvent<HTMLInputElement>) => void
  ) => {
    const { value } = event.target;
    onChangeFunc(event);

    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set a new debounce timer
    debounceTimer.current = setTimeout(() => {
      validateLinkoutUrl(value);
    }, 500);
  };

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <LinkoutFieldContent
          field={field}
          label={label}
          placeholder={placeholder}
          showFieldIcon={showFieldIcon}
          isUrlValidating={isUrlValidating}
          disabled={disabled}
          isLoading={isLoading}
          onChangeInput={onChangeInput}
        />
      )}
    />
  );
}

export function isValidUrlFormat(value: string): boolean {
  if (!value || typeof value !== "string") return false;

  try {
    const normalizedValue = value.match(/^https?:\/\//) ? value : `https://${value}`;

    const url = new URL(normalizedValue);

    // Validate hostname (must have at least one dot)
    if (!url.hostname || !url.hostname.includes(".")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
