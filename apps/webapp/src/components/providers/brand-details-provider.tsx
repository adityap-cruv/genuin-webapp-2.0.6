// app/(new-site)/BrandDetailsProviderClient.tsx
'use client'
import { BaseContextProvider } from '@genuin/components/context/base/provider'

export default function BrandDetailsProviderClient({ brandDetails, children }: any) {
  return <BaseContextProvider brandDetails={brandDetails}>{children}</BaseContextProvider>
}
