import {useState, useEffect} from 'react'
import {getData} from '../utils/fetchData'
import Nfts from './../components/nft/NFTs';
import { useRouter } from 'next/router'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import SiteName from '../components/SiteName'

const explore = (props) => {
  const [sites, setSites] = useState(props.sites)
  const [page, setPage] = useState(1)

  const router = useRouter()

  useEffect(() => {
    if(Object.keys(router.query).length === 0) setPage(1)
  },[router.query])
  return (
    <div>
       <head>
          <title>
		  {
			sites.map(site => (
			<SiteName key={site._id}  site={site} />
			))
		} | Explore</title>
        </head>
		{
			sites.map(site => (
			<NavBar key={site._id}  site={site} />
			))
		}
      <Nfts/>
    {
			sites.map(site => (
			<Footer key={site._id}  site={site} />
			))
		}
    </div>
  )
}

export async function getServerSideProps({query}) {
	const page = query.page || 1
	const search = query.search || 'all'
  
	
	const res = await getData(
	  `site?limit=${page * 1}&title=${search}`
	)
	// server side rendering
	return {
	  props: {
		sites: res.sites,
		result: res.result,
	  }, // will be passed to the page component as props
	}
  }

export default explore