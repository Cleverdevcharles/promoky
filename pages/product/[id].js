import Head from 'next/head'
import { useState, useContext, useEffect } from 'react'
import { getData } from '../../utils/fetchData'
import { DataContext } from '../../store/GlobalState'
import { addToCart } from '../../store/Actions'
import { useRouter } from 'next/router'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import SiteName from '../../components/SiteName'

const DetailProduct = (props) => {
    const [product] = useState(props.product)
    const [tab, setTab] = useState(0)
	const [sites, setSites] = useState(props.sites)
	const [page, setPage] = useState(1)
	
	const router = useRouter();
    const { state, dispatch } = useContext(DataContext)
    const { cart, auth } = state

    const isActive = (index) => {
        if(tab === index) return " active";
        return ""
    }

	useEffect(() => {
		if(Object.keys(router.query).length === 0) setPage(1)
	},[router.query])

    useEffect(() => {
        if(!auth.user) {
            router.push('/');
            return
        }
    }, [auth.user])
    if(!auth.user) return null

    return(
        <>
			<head>
          <title>
		  {
			sites.map(site => (
			<SiteName key={site._id}  site={site} />
			))
		} | Detail Product</title>
        </head>
		{
			sites.map(site => (
			<NavBar key={site._id}  site={site} />
			))
		}
            <>
            </>
            <section className="shop single section">
					<div className="container">
						<div className="row"> 
							<div className="col-12">
								<div className="row">
									<div className="col-lg-6 col-12">
										{/* Product Slider */}
										<div className="product-gallery">
											{/* Images slider */}
											<div className="flexslider-thumbnails">
												<ul className="slides">
													<li data-thumb="images/bx-slider1.jpg" rel="adjustX:10, adjustY:">
														<img src={ product.images[tab].url } alt={ product.images[tab].url }
                                                        style={{height: '400px'}} 
                                                         />
													</li>
                                                    <div className="row mx-0" style={{cursor: 'pointer'}} >
                                                    {product.images.map((img, index) => (
                                                        <img key={index} src={img.url} alt={img.url}
                                                        className={`img-thumbnail rounded ${isActive(index)}`}
                                                        style={{height: '80px', width: '20%'}}
                                                        onClick={() => setTab(index)} />
                                                    ))}
                                                    </div>
												</ul>
											</div>
											{/* End Images slider */}
										</div>
										{/* End Product slider */}
									</div>
									<div className="col-lg-6 col-12">
										<div className="product-des">
											{/* Description */}
											<div className="short">
												<h4 className='text-uppercase'>{product.title}</h4>
												
												<p className="price"><span className="discount">${product.price}</span><s>${product.price + product.discount}</s></p>
												<p className="description">{product.description}</p>
											</div>
											{/* End Description */}
											
											{/* Product Buy */}
											<div className="product-buy">
												<div className="add-to-cart" 
                                                onClick={() => dispatch(addToCart(product, cart))}
                                                >
													<a href="#" className="btn">Add to cart</a>
												</div>
												<p className="cat">Sold :<a href="#">{product.sold} {product.sold.length > 1 ? 'Products' : 'Product'} Sold Out</a></p>
                                                {
                                                    product.inStock > 0
                                                    ? <p className="availability">Availability : {product.inStock} {product.inStock.length > 1 ? 'Products' : 'Product'} In Stock</p>

                                                    : <p className="availability">Availability : Out of Stock</p>
                                                }
											</div>
											{/* End Product Buy */}
										</div>
									</div>
								</div>
                                <div className="row">
									<div className="col-12">
										<div className="product-info">
											<div className="nav-main">
												{/* Tab Nav */}
												<ul className="nav nav-tabs" id="myTab" role="tablist">
													<li className="nav-item"><a className="nav-link active" data-toggle="tab" href="#description" role="tab">Description</a></li>
												</ul>
												{/* End Tab Nav */}
											</div>
											<div className="tab-content" id="myTabContent">
												{/* Description Tab */}
												<div className="tab-pane fade show active" id="description" role="tabpanel">
													<div className="tab-single">
														<div className="row">
															<div className="col-12">
																<div className="single-des">
																	<p>{product.description}</p>
																</div>
																<div className="single-des">
																	<h4>Product Features:</h4>

																	<p>{product.content}</p>
																</div>
															</div>
														</div>
													</div>
												</div>
												{/* End Description Tab */}
												
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
		</section>
		{
			sites.map(site => (
			<Footer key={site._id}  site={site} />
			))
		}
        </>
    )
}

export async function getServerSideProps({params: {id}, query }) {
	const page = query.page || 1
	const search = query.search || 'all'
    const res = await getData(`product/${id}`)
	const site_res = await getData(
		`site?limit=${page * 1}&title=${search}`
	)

	  // server side rendering
	  return {
		props: {
		  product: res.product,
		  sites: site_res.sites,
		  result: site_res.result,
		}, // will be passed to the page component as props
	  }
}


export default DetailProduct