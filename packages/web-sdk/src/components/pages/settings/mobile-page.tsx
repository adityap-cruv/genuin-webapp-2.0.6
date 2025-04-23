import { Header } from './header'
import { SettingsMenu } from './menu'

/**
 * This component is used to display the '/settings' page on mobile.
 * @returns
 */
export function SettingsPageMobile() {
  return (
    <>
      <Header
        title='Settings'
        showSubmitButton={false}
      />
      <div className='p-4'>
        <SettingsMenu forMobile />
      </div>
    </>
  )
}
