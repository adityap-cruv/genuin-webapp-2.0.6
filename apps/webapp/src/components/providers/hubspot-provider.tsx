import Script from 'next/script'

export function HubSpotProvider() {
  if (process.env.NEXT_PUBLIC_CURRENT_ENV === 'qa')
    return (
      <>
        <Script id="hs-script-loader" async defer src="//js-eu1.hs-scripts.com/25154092.js" />
      </>
    )
}
