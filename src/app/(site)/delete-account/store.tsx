import { create } from 'zustand'

export type StepsType = 'NUMBER_INPUT' | 'OTP_INPUT' | 'DELETE_CONFORMATION' | 'DELETE_SUCCESS' | null

type FormDataType = {
  phoneNumber?: string | undefined
  otp: string
  userId?: string
  retryTime?: number
  authToken?: string | null
} | null

type States = {
  step: StepsType
  previousStep?: StepsType
  formData: Partial<FormDataType>
}

type Actions = {
  goToPrevious: () => void
  setStep: (step: StepsType) => void
  setFormData: (formData: Partial<FormDataType>) => void
}

const initialStates: States = {
  step: 'NUMBER_INPUT',
  previousStep: null,
  formData: {},
}

export const useDeleteAccountStore = create<Actions & States>((set) => {
  return {
    ...initialStates,
    setStep(step) {
      set((state) => {
        state.previousStep = state.step
        state.step = step
        return { ...state }
      })
    },
    goToPrevious() {
      set((state) => {
        state.step = state.previousStep ?? 'NUMBER_INPUT'
        return state
      })
    },
    setFormData(formData) {
      set((state) => {
        if (formData !== null) {
          state.formData = { ...state.formData, ...formData }
        }
        return { formData: state.formData }
      })
    },
  }
})
