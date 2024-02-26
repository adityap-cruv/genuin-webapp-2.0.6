import { type ConfigType } from '@lib/stores/genuin-options'
import { checkAndAppendHttps } from '@lib/utils'
import { permanentRedirect } from 'next/navigation'

export function RedirectHandler({ children, config }: { children: React.ReactNode; config?: ConfigType }) {
  if (config && config?.integrations.white_label.enable && config?.integrations.white_label.allowed_domains[0]) {
    permanentRedirect(checkAndAppendHttps(config.integrations.white_label.allowed_domains[0]))
  }

  return children
}
