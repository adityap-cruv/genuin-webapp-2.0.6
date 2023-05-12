import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import favicon from '../assets/images/favicon.ico'
import NextHead from 'next/head'
import { datadogRum } from '@datadog/browser-rum'
import { datadogLogs } from '@datadog/browser-logs'
import { DatadogConfigs } from '../constants/datadog_configs'
import { BasicColors } from '../constants/colors'
const theme = extendTheme({
  fonts: {
    body: 'Avenir Next, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji,Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji'
  }
})

function MyApp ({ Component, pageProps }) {
  datadogRum.init({
    applicationId: DatadogConfigs.applicationId,
    clientToken: DatadogConfigs.clientToken,
    site: DatadogConfigs.site,
    service: DatadogConfigs.service,
    env: DatadogConfigs.env,
    // Specify a version number to identify the deployed version of your application in Datadog
    // version: '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
    enableExperimentalFeatures: ['clickmap']
  })

  datadogRum.startSessionReplayRecording()
  datadogLogs.init({
    clientToken: DatadogConfigs.clientToken,
    site: DatadogConfigs.site,
    service: DatadogConfigs.service,
    env: DatadogConfigs.env || 'qa',
    forwardErrorsToLogs: true,
    sessionSampleRate: 100
  })

  return (
    <>
      <NextHead>
        <link rel='shortcut icon' href={favicon.src} type='image/x-icon' />
        <meta name='theme-color' content={ BasicColors.secondaryColor } />
        {process.env.env === 'qa' && <meta name="robots" content="noindex, nofollow"></meta>}
      </NextHead>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
        <ToastContainer
          position='bottom-left'
          draggable={false}
          limit={1}
          theme={'dark'}
        />
      </ChakraProvider>
    </>

  )
}
export default MyApp
