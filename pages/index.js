import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Schema Delivery System</title>
        <script src="/schema-loader.js" />
      </Head>
      <main>
        <h1>Schema Delivery System</h1>
        <p>Welcome to the Schema Delivery System.. Visit one of our test pages:</p>
        <ul>
          <li><a href="/qlik-cloud-analytics">Qlik Cloud Analytics</a></li>
          <li><a href="/qlik-automl">Qlik AutoML</a></li>
        </ul>
      </main>
    </div>
  );
}
