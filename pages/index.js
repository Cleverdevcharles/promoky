import Head from 'next/head'
import { useState, useContext, useEffect } from 'react'
import {DataContext} from '../store/GlobalState'

import { getData } from '../utils/fetchData'
import ProductItem from '../components/product/ProductItem'
import filterSearch from '../utils/filterSearch'
import {useRouter} from 'next/router'
import Link from 'next/link'
import Cookie from 'js-cookie'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import SiteName from '../components/SiteName'
import Hero from '../components/Hero'

const Home = (props) => {
  const [products, setProducts] = useState(props.products)
  const [sites, setSites] = useState(props.sites)

  const [isCheck, setIsCheck] = useState(false)
  const [page, setPage] = useState(1)
  const router = useRouter()

  const {state, dispatch} = useContext(DataContext)
  const {auth, cart} = state

  useEffect(() => {
    setProducts(props.products)
  },[props.products])

  useEffect(() => {
    setSites(props.sites)
  },[props.sites])

  useEffect(() => {
    if(Object.keys(router.query).length === 0) setPage(1)
  },[router.query])

  const handleCheck = (id) => {
    products.forEach(product => {
      if(product._id === id) product.checked = !product.checked
    })
    setProducts([...products])
  }

  const handleCheckALL = () => {
    products.forEach(product => product.checked = !isCheck)
    setProducts([...products])
    setIsCheck(!isCheck)
  }

  const handleDeleteAll = () => {
    let deleteArr = [];
    products.forEach(product => {
      if(product.checked){
          deleteArr.push({
            data: '', 
            id: product._id, 
            title: 'Delete all selected products?', 
            type: 'DELETE_PRODUCT'
          })
      }
    })

    dispatch({type: 'ADD_MODAL', payload: deleteArr})
  }



  return(
    <>
      <head>
          <title>
		  {
			sites.map(site => (
			<SiteName key={site._id}  site={site} />
			))
		}</title>
    </head>
		{
			sites.map(site => (
			<NavBar key={site._id}  site={site} />
			))
		}
      <>
        <Hero/>
        <div className="product-area section">
            <div className="container">
				<div className="row">
					<div className="col-12">
						<div className="section-title">
							<h2>Trending Item</h2>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-12">
						<div className="product-info">
							<div className="nav-main">
								{/*  Tab Nav */}
                {
                  auth.user && auth.user.role === 'admin' &&
                  <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item">
                      <div className="delete_all btn btn-danger mt-5" style={{marginBottom: '-10px'}}>
                        <input type="checkbox" checked={isCheck} onChange={handleCheckALL}
                        style={{width: '25px', height: '25px', transform: 'translateY(8px)'}} />

                        <button className="btn btn-danger ml-2"
                        data-toggle="modal" data-target="#exampleModal"
                        onClick={handleDeleteAll}>
                          DELETE ALL
                        </button>
                      </div>
                    </li>
                    <li className="nav-item">
                      <div className='delete_all btn btn-danger mt-5' style={{marginBottom: '-10px'}}>
                        {sites.map(site => (
                          <button key={site._id} className="btn btn-danger ml-2"
                          onClick={() => router.push(`site_settings/${site._id}`)}>
                            View/Edit Site
                          </button>
                          ))}
                      </div>
                    </li>
                  </ul>
                }
								{/*  End Tab Nav */}
							</div>
							<div className="tab-content" id="myTabContent">
								{/* Start Single Tab */}
								<div className="tab-pane fade show active" id="man" role="tabpanel">
									<div className="tab-single">
										<div className="row">
                    {
                      products.map(product => (
                        <ProductItem key={product._id}  product={product} handleCheck={handleCheck} />
                      ))
                    }
										</div>
									</div>
								</div>
								{/* End Single Tab  */}
							</div>
						</div>
					</div>
				</div>
        </div>
    </div>
    <section className="shop-services section home">
		<div className="container">
			<div className="row">
				<div className="col-lg-3 col-md-6 col-12">
					{/* Start Single Service */}
					<div className="single-service">
						<i className="ti-rocket"></i>
						<h4>Safe shipping</h4>
						<p>For all orders</p>
					</div>
					{/* End Single Service */}
				</div>
				<div className="col-lg-3 col-md-6 col-12">
					{/* Start Single Service */}
					<div className="single-service">
						<i className="ti-reload"></i>
						<h4>NFT Discount</h4>
						<p>20% off for NFT holders</p>
					</div>
					{/* End Single Service */}
				</div>
				<div className="col-lg-3 col-md-6 col-12">
					{/* Start Single Service */}
					<div className="single-service">
						<i className="ti-lock"></i>
						<h4>Sucure Payment</h4>
						<p>100% secure payment</p>
					</div>
					{/* End Single Service */}
				</div>
				<div className="col-lg-3 col-md-6 col-12">
					{/* Start Single Service */}
					<div className="single-service">
						<i className="ti-tag"></i>
						<h4>Best Price</h4>
						<p>Guaranteed price</p>
					</div>
					{/* End Single Service */}
				</div>
			</div>
		</div>
	</section>
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
  const category = query.category || 'all'
  const sort = query.sort || ''
  const search = query.search || 'all'

  const res = await getData(
    `product?limit=${page * 6}&category=${category}&sort=${sort}&title=${search}`
  )
  const site_res = await getData(
    `site?limit=${page * 1}&title=${search}`
  )
  // server side rendering
  return {
    props: {
      products: res.products,
      sites: site_res.sites,
      result: res.result,
    }, // will be passed to the page component as props
  }
}

export default Home