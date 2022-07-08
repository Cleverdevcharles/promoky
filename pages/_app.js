import '../styles/globals.css'
import Layout from '../components/Layout'
import { useState, useContext, useEffect } from 'react'
import { DataProvider } from '../store/GlobalState'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-phone-number-input/style.css'
import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }, props) {
  const [sites, setSites] = useState(props.sites)
  const [page, setPage] = useState(1)
  const router = useRouter()

  useEffect(() => {
    setSites(props.sites)
  }, [props.sites])

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
  }, [router.query])
  return (
    <DataProvider>
      <Layout>
        <ToastContainer />
        <Component {...pageProps} />
      </Layout>
    </DataProvider>
  )
}

export async function getServerSideProps({ query }) {
  const page = query.page || 1
  const search = query.search || 'all'

  const site_res = await getData(`site?limit=${page * 1}&title=${search}`)
  // server side rendering
  return {
    props: {
      sites: site_res.sites,
      result: res.result,
    }, // will be passed to the page component as props
  }
}

export default MyApp
