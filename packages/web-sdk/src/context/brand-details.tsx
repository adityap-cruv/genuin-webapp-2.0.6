import type {
  BrandDetailsConfigType,
  CustomizationType,
  ViewType,
} from '@/type'
import { getUrlForReaction } from '@/utils'
import { createContext, useContext } from 'react'

type BrandDetailsContextType = {
  customizations?: Partial<CustomizationType>
  brandDetails: BrandDetailsConfigType
  embedStyle?: ViewType
}

const BrandDetailsContext = createContext<BrandDetailsContextType>({
  customizations: {} as any,
  brandDetails: {
    reactions: {
      type: 'default',
      title: 'react',
      suffix: 'to',
      keys: {
        comment_selected: {
          svg: getUrlForReaction('spark', true, true),
          png: '',
        },
        comment_unselected: {
          svg: getUrlForReaction('spark', false, true),
          png: '',
        },
        feed_selected: {
          svg: getUrlForReaction('spark', true, false),
          png: '',
        },
        feed_unselected: {
          svg: getUrlForReaction('spark', false, false),
          png: '',
        },
      },
    },
    show_become_creator: true,
  } as any,
  embedStyle: 'carousel',
})

type BrandDetailsProviderPropsType = {
  customizations?: Partial<CustomizationType>
  brandDetails: BrandDetailsConfigType
  embedStyle?: ViewType
  children: React.ReactNode
}

export function BrandDetailsProvider({
  brandDetails,
  children,
  customizations,
  embedStyle,
}: BrandDetailsProviderPropsType) {
  return (
    <BrandDetailsContext.Provider
      value={{ brandDetails, customizations, embedStyle }}>
      {children}
    </BrandDetailsContext.Provider>
  )
}

export function useBrandDetails() {
  const context = useContext(BrandDetailsContext)
  if (!context) {
    throw new Error(
      'Please use this component inside brand details context component.',
    )
  }
  return context
}
