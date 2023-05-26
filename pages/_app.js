import React, { useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import favicon from '../assets/images/favicon.ico'
import NextHead from 'next/head'
import { BasicColors } from '../constants/colors'
import { initializeApp } from 'firebase/app'
const theme = extendTheme({
  fonts: {
    body: 'Avenir Next, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji,Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji'
  }
})

function MyApp ({ Component, pageProps }) {
  const firebaseConfig = {
    apiKey: 'AIzaSyAzKcl1IylxODAtwM8XkVWvpFwzgMEskBs',
    authDomain: 'genuin-c148b.firebaseapp.com',
    databaseURL: 'https://genuin-c148b.firebaseio.com',
    projectId: 'genuin-c148b',
    storageBucket: 'genuin-c148b.appspot.com',
    messagingSenderId: '948935706940',
    appId: '1:948935706940:web:80b617b9783f2d0d51b639',
    measurementId: 'G-207GT5P81F'
  }
  useEffect(() => {
    const app = initializeApp(firebaseConfig)
  }, [])
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
