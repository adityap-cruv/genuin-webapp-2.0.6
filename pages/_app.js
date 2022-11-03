import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import NextHead from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <NextHead>
        <script id="cookieyes" type="text/javascript"
          src="https://cdn-cookieyes.com/client_data/d7aa21ad076b060fab7bc665/script.js">
          </script>
        </NextHead>
      <Component {...pageProps} />
      <ToastContainer
        position='bottom-left'
        draggable={false}
        limit={1}
        theme={'dark'}
      />
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
