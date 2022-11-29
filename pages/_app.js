import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { ChakraProvider } from "@chakra-ui/react";
import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en.json";

function MyApp({ Component, pageProps }) {
  TimeAgo.addDefaultLocale(en);
  return (
    <ChakraProvider>
      <Component {...pageProps} />
      <ToastContainer
        position='bottom-left'
        draggable={false}
        limit={1}
        theme={"dark"}
      />
    </ChakraProvider>
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
