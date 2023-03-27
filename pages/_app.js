import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import favicon from "../assets/images/favicon.ico";
import NextHead from "next/head"

const theme = extendTheme({
  fonts: {
    body:"Avenir Next, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji,Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji"
  }
})


function MyApp({ Component, pageProps }) {
  return (
    <>
      <NextHead>
        <link rel='shortcut icon' href={favicon.src} type='image/x-icon' />
      </NextHead>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
        <ToastContainer
          position='bottom-left'
          draggable={false}
          limit={1}
          theme={"dark"}
        />
      </ChakraProvider>
    </>
    
  );
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp;
