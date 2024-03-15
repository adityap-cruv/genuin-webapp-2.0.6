import Script from 'next/script'

export function ThirdPartyScriptProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA_MEASUREMENT_ID}`} />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.GA_MEASUREMENT_ID}');
        `}
      </Script>
      <Script id="bufferEvents">
        {`
            window.rudderanalytics = [];
            var methods = [
              'load',
              'page',
              'track',
              'identify',
              'alias',
              'group',
              'ready',
              'reset',
              'getAnonymousId',
              'setAnonymousId',
              'getUserId',
              'getUserTraits',
              'getGroupId',
              'getGroupTraits',
              'startSession',
              'endSession',
              'getSessionId',
            ];
            for (var i = 0; i < methods.length; i++) {
              var method = methods[i];
              window.rudderanalytics[method] = (function (methodName) {
                return function () {
                  window.rudderanalytics.push([methodName].concat(Array.prototype.slice.call(arguments)));
                };
              })(method);
            }
        `}
      </Script>
      <Script src={'https://cdn.cookielaw.org/consent/018e2bbd-1879-7b2c-aada-f9403ae9429d-test/OtAutoBlock.js'} />
      <Script
        src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js"
        data-domain-script="018e2bbd-1879-7b2c-aada-f9403ae9429d-test"></Script>
      <Script>function OptanonWrapper() {}</Script>
    </>
  )
}
