import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.SCHEMA_API_URL = "${process.env.NEXT_PUBLIC_SCHEMA_API_URL}";`
        }}
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
