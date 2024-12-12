import Head from 'next/head'
import getConfig from 'next/config'

export async function getStaticProps() {
  const { publicRuntimeConfig } = getConfig()
  
  return {
    props: {
      schemaApiUrl: publicRuntimeConfig.schemaApiUrl
    }
  }
}

export default function Home(props) {
  return (
    <div>
      <Head>
        <title>Schema Delivery System</title>
      </Head>
      <main>
        <h1>Schema Delivery System</h1>
        <p>Welcome to the Schema Delivery System.. Visit one of our test pages:</p>
        <ul>
          <li><a href="/qlik-cloud-analytics">Qlik Cloud Analytics</a></li>
          <li><a href="/qlik-automl">Qlik AutoML 21</a></li>
        </ul>
      </main>
    </div>
  )
}
