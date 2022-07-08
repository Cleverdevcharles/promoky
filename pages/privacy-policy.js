import { useState,  useEffect } from 'react'

import { getData } from '../utils/fetchData'
import {useRouter} from 'next/router'
import Link from 'next/link'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import SiteName, { SitePrivacy_Policy} from '../components/SiteName'

const PrivacyPolicy = (props) => {
  const [sites, setSites] = useState(props.sites)
  const [page, setPage] = useState(1)

  const router = useRouter()
  
  useEffect(() => {
    if(Object.keys(router.query).length === 0) setPage(1)
  },[router.query])

  return(
    <>
        <head>
            <title>
                {
                    sites.map(site => (
                    <SiteName key={site._id}  site={site} />
                    ))
                } | Privacy Policy
            </title>
        </head>
		{
			sites.map(site => (
			<NavBar key={site._id}  site={site} />
			))
		}

        <div className="breadcrumbs">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="bread-inner">
							<ul className="bread-list">
								<li><Link href="/"><a>Home<i className="ti-arrow-right"></i></a></Link></li>
								<li className="active"><Link href="/privacy-policy">Privacy Policy</Link></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>

        <>
        {
            sites.map(site => (
            <div className='container mt-5 pb-5'>
                <center>
                    <h2>
                    <b>
                     Our Privacy Policy
                    </b>
                    </h2>
                    <hr/>
                </center>
                <p>
                <SitePrivacy_Policy key={site._id}  site={site} />
                </p>
            </div>
            ))
        }
        </>
        {
            sites.map(site => (
            <Footer key={site._id}  site={site} />
            ))
        }
    </>
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
export default PrivacyPolicy