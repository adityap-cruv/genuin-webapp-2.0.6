'use client'
import { GroupDetailsPage } from '@genuin/components/page/group-details/group-details'
import { BaseLayout } from '@genuin/components/templates/base-layout/base-layout'
import { AuthProvider } from '@genuin/components/context/auth'
import { ReactQueryClientProvider } from '@genuin/components/react-query/react-query-provider'
import { useBaseContext } from '@genuin/components/context/base/context'
import { parseBrandColors } from '@genuin/components/lib/utils/brand-color-parser'

interface Props {
  slug: string
}

export function GroupClientPage({ slug }: Props) {
  const { brandDetails } = useBaseContext()
  const parsedColors = parseBrandColors(brandDetails?.brand_colors)
  return (
    <AuthProvider user={null} onSignIn={() => {}} onSignOut={() => {}} onUpdateUser={() => {}}>
      <ReactQueryClientProvider>
        <main style={{ ...parsedColors }}>
          <BaseLayout>
            <GroupDetailsPage slug={slug} />
          </BaseLayout>
        </main>
      </ReactQueryClientProvider>
    </AuthProvider>
  )
}
