import { type ConfigType } from '@lib/stores/genuin-options'
import { checkAndAppendHttps } from '@lib/utils'
import { headers } from 'next/headers'
import { permanentRedirect } from 'next/navigation'

export function RedirectHandler({
  children,
  config,
  shouldRedirect = false,
}: {
  children: React.ReactNode
  config?: ConfigType
  shouldRedirect: boolean
}) {
  if (
    config &&
    config?.integrations.white_label.enable &&
    config?.integrations.white_label.allowed_domains[0] &&
    shouldRedirect
  ) {
    const searchParamStr = headers().get('x-search-params')
    const pathParamStr = headers().get('x-path-params')
    permanentRedirect(
      checkAndAppendHttps(config.integrations.white_label.allowed_domains[0]) + pathParamStr + searchParamStr
    )
  } else {
    console.log('Permanent Redirect Handler')
    const searchParamStr = headers().get('x-search-params')
    const pathParamStr = headers().get('x-path-params')
    const host = headers().get('host')
    permanentRedirect(checkAndAppendHttps(host ?? '') + pathParamStr + searchParamStr)
  }

  return children
}
