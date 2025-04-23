import { Header } from '@/components/pages/settings/header'
import { PersonalizationMenu } from '@/components/pages/settings/personalization/menu'

export function PersonalizationPage() {
  return (
    <>
      <Header
        showSubmitButton={false}
        title='Personalization'
      />
      <PersonalizationMenu />
    </>
  )
}
