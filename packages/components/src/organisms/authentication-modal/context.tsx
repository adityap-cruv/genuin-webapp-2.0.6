import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { DeepLinkPayloadUnion } from "@genuin/components/react-query/api/deeplink/types";

export type AuthActionType =
  | "JOIN_COMMUNITY"
  | "SUBSCRIBE"
  | "KS_CB_REQUEST"
  | "DELETE_ACCOUNT";

export type StepsType =
  | "SIGNIN"
  | "LOGIN_OTP_INPUT"
  | "EDIT_BIRTHDATE"
  | "EDIT_PHONE_NUMBER"
  | "EDIT_EMAIL_SUCCESS"
  | "EDIT_PHONE_NUMBER_SUCCESS"
  | "EDIT_USERNAME"
  | "EDIT_EMAIL"
  | "VERIFY_MAIL_OTP"
  | "VERIFY_PHONE_OTP"
  | "CATEGORY_SELECTION"
  | "CLAIM_BRAND_PROFILE"
  | "IMAGE_CROPPER"
  | "COMPLETE_PROFILE"
  | "USERNAME_INPUT"
  | "GUIDELINES"
  | "KS_CB_WEB"
  | "KS_CB_SUBDOMAIN"
  | "LOGOUT"
  | "DELETE_CONFIRMATION"
  | "DELETE_CONFIRMED"
  | "WALLET_HOW_IT_WORKS"
  | "BRAND_GUIDELINES"
  | "WITHDRAW_CASH"
  | "REDEEM_CREDITS"
  | "GET_APP"
  | "BECOME_CREATOR"
  | "EDIT_FULLNAME"
  | "EDIT_BIO"
  | "EDIT_SOCIAL_PROFILES"
  | "SIGN_OUT"
  | "REMOVE_PICTURE"
  | "EDIT_PROFILE_PICTURE"
  | "VERIFY_DELETE_ACCOUNT"
  | "DELETE_CONFIRMATION";

export type FormDataType = {
  email: string;
  phone: string;
  flowType: "EMAIL" | "PHONE";
  /**
   * Pre-authentication session ID used for verification
   */
  preAuthSessionId: string;
  /**
   * Device ID for the response, used to track the device in the authentication flow
   */
  responseDeviceId: string;
};

export type getAppDataType = {
  title?: string | ReactNode;
  description?: string | ReactNode;
  data?: DeepLinkPayloadUnion;
};

type State = {
  step: StepsType;
  formData: Partial<FormDataType>;
  getAppData?: getAppDataType;
};

type Action =
  | { type: "SET_STEP"; step: StepsType }
  | { type: "SET_FORM_DATA"; data: Partial<FormDataType> }
  | {
      type: "SET_GET_APP_DATA";
      data: Partial<getAppDataType>;
    }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_FORM_DATA":
      return { ...state, formData: { ...state.formData, ...action.data } };
    case "SET_GET_APP_DATA":
      return { ...state, getAppData: action.data };
    case "RESET":
      return { step: "SIGNIN", formData: {} };
    default:
      return state;
  }
}

type ContextType = {
  step: StepsType;
  setStep: (step: StepsType) => void;
  formData: Partial<FormDataType>;
  setFormData: (data: Partial<FormDataType>) => void;
  getAppData?: getAppDataType;
  closeModal: () => void;
  openModal: (step?: StepsType, appData?: getAppDataType) => void;
  action?: AuthActionType;
};

const AuthenticationModalContext = createContext<ContextType>({
  step: "SIGNIN",
  setStep: () => {},
  formData: {
    flowType: "EMAIL",
  },
  setFormData: () => {},
  closeModal: () => {},
  openModal: () => {},
});

type AuthenticationModalProviderProps = {
  action?: AuthActionType;
  children: React.ReactNode;
  customStep?: StepsType;
  onClose?: () => void;
  onOpen?: () => void;
  getAppData?: getAppDataType;
};

export function AuthenticationModalProvider({
  children,
  customStep = "SIGNIN",
  action,
  onClose,
  onOpen,
  getAppData,
}: AuthenticationModalProviderProps) {
  const [state, dispatch] = useReducer(reducer, {
    step: customStep,
    formData: { flowType: "EMAIL" },
    getAppData: getAppData ?? {},
  });

  const setStep = useCallback((step: StepsType) => {
    dispatch({ type: "SET_STEP", step });
  }, []);

  const setFormData = useCallback((data: Partial<FormDataType>) => {
    dispatch({ type: "SET_FORM_DATA", data });
  }, []);

  const closeModal = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const openModal = useCallback(() => {
    onOpen?.();
  }, [onOpen]);

  return (
    <AuthenticationModalContext.Provider
      value={{
        step: state.step,
        setStep,
        formData: state.formData,
        setFormData,
        getAppData: state.getAppData,
        closeModal,
        openModal,
        action,
      }}
    >
      {children}
    </AuthenticationModalContext.Provider>
  );
}

export function useAuthenticationModalContext() {
  const context = useContext(AuthenticationModalContext);
  if (!context) {
    throw new Error(
      "useAuthenticationModalContext must be used within an AuthenticationModalProvider"
    );
  }
  return context;
}
