import Script from 'next/script'

export function HubSpotProvider() {
  return (
    <>
      <Script id="hs-script-loader" async defer src="//js-eu1.hs-scripts.com/25154092.js" />
    </>
  )
}
