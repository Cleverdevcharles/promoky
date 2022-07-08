import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {useRouter} from 'next/router'
import { getData } from '../utils/fetchData'


function Footer({site}) {
  const [page, setPage] = useState(1)
  const router = useRouter()

  useEffect(() => {
    if(Object.keys(router.query).length === 0) setPage(1)
  },[router.query])
    return (
        <>
    <div>
        <footer className="footer">
      {/* Footer Top */}
            <div className="footer-top section">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 col-md-6 col-12">
            {/* Single Widget */}
            <div className="single-footer about">
              <div className="logo">
                <Link href="/"><img src={site.images[0].url} alt="#" style={{ width: "100px", height: "100px"}} /></Link>
              </div>
              <p className="text">{site.about.substr(0, 500)}</p>
              <p className="call">Got Question? Call us 24/7<span><a href={`tel:+${site.phone}`}>+{site.phone}</a></span></p>
            </div>
            {/* End Single Widget */}
          </div>
          <div className="col-lg-3 col-md-6 col-12">
            {/* Single Widget */}
            <div className="single-footer links">
              <h4>Information</h4>
              <ul>
                <li><Link href="/shop">Shop</Link></li>
                <li><Link href="/explore">Explore</Link></li>
                <li><Link href="/assets">Assets</Link></li>
                <li><Link href="/contact-us">Contact Us</Link></li>
                <li><a href="/terms-conditiions">Terms & Conditions</a></li>
                <li><a href="/privacy-policy">Privacy Policy</a></li>
    
              </ul>
            </div>
            {/* End Single Widget */}
          </div>
          
          <div className="col-lg-3 col-md-6 col-12">
            {/* Single Widget */}
            <div className="single-footer social">
              <h4>Get In Touch</h4>
              {/* Single Widget */}
              <div className="contact">
                <ul>
                  <li>{site.email}</li>
                  <li>+{site.phone}</li>
                </ul>
              </div>
              {/* End Single Widget */}
              <ul>
                <li><a href={site.facebook}><i className="ti-facebook"></i></a></li>
                <li><a href={site.twitter}><i className="ti-twitter"></i></a></li>
                <li><a href={site.instagram}><i className="ti-instagram"></i></a></li>
              </ul>
            </div>
             {/* End Single Widget */}
          </div>
        </div>
      </div>
    </div>
    {/* End Footer Top */}
    </footer>
    </div>
        </>
    )
}

export async function getServerSideProps({query, p}) {
  const page = query.page || 1
  const search = query.search || 'all'


  const res = await getData(
      `site?limit=${page * 1}&title=${search}`
  )

  // server side rendering
  return {
    props: {
      sites: res.sites,
      result: res.result
    }, // will be passed to the page component as props
  }
}


export default Footer
