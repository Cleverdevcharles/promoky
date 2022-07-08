import React, { useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {DataContext} from '../store/GlobalState'
import { getData } from '../utils/fetchData'
import Cookie from 'js-cookie'
import Filter from '../components/Filter'

function NavBar(props) {
    const [sites, setSites] = useState(props.sites)
    const [page, setPage] = useState(1)
    
    const router = useRouter()
    const {state, dispatch} = useContext(DataContext)
    const { auth, cart } = state

    useEffect(() => {
        setSites(props.sites)
        console.log("Hello",sites);
    },[props.sites])

    useEffect(() => {
        if(Object.keys(router.query).length === 0) setPage(1)
    },[router.query])

    const isActive = (r) => {
        if(r === router.pathname){
            return "active"
        }else{
            return ""
        }
    }

    const handleLogout = () => {
        Cookie.remove('refreshtoken', {path: 'api/auth/accessToken'})
        localStorage.removeItem('firstLogin')
        dispatch({ type: 'AUTH', payload: {} })
        dispatch({ type: 'NOTIFY', payload: {success: 'Logged out!'} })
        return router.push('/')
    }

    const adminRouter = () => {
        return(
            <>
            <div className="bottom">
                <Link href="/create-nft">
                    <a className="btn animate">Create NFT</a>
                </Link>
            </div>
            <div className="bottom">
                <Link href="/site_settings">
                    <a className="btn animate">General Site Settings</a>
                </Link>
            </div>
            <div className="bottom">
                <Link href="/users">
                    <a className="btn animate">Users</a>
                </Link>
            </div>
            <div className="bottom">
                <Link href="/create">
                    <a className="btn animate">Create Product</a>
                </Link>
            </div>
            <div className="bottom">
                <Link href="/categories">
                    <a className="btn animate">Categories</a>
                </Link>
            </div>
            </>
        )
    }

    const loggedRouter = () => {
        return(
            <>
            <div className="bottom">
                <Link href="/profile">
                    <a className="btn animate">Profile</a>
                </Link>
            </div>
            <div className="bottom">
                <Link href="/explore">
                    <a className="btn animate">Explore NFTs</a>
                </Link>
            </div>
            <div className="bottom">
                <Link href="/assets">
                    <a className="btn animate">My Assets</a>
                </Link>
            </div>
            {auth.user.role === 'admin' && adminRouter()} 
            <div className="bottom">
                <a href="#" className="btn animate" onClick={handleLogout}>Logout</a>
            </div> 
            </>
        )
    }

    return (
        <>
  <div>
        <header className="header shop">
			{/* Topbar */}
			<div className="topbar">
				<div className="container">
					<div className="row">
						<div className="col-lg-6 col-md-12 col-12">
							{/* Top Left */}
							<div className="top-left">
								<ul className="list-main">
									<li><i className="ti-headphone-alt"></i>00900908</li>
									<li><i className="ti-email"></i> site@support.com</li>
								</ul>
							</div>
							{/* End Top Left */}
						</div>
						
					</div>
				</div>
			</div>
			{/* End Topbar */}
			<div className="middle-inner">
				<div className="container">
					<div className="row">
                    <Filter state={state} />
						<div className="col-lg-2 col-md-3 col-12">
							<div className="right-bar">
								{/* Search Form */}
								<div className="sinlge-bar shopping">
									<a href="#" className="single-icon">
                                        <i className="fa fa-user-circle-o" aria-hidden="true"></i>
                                    </a>
									<div className="shopping-item" style={{marginTop: "-20px"}}>
                                        {
                                            Object.keys(auth).length === 0 
                                            ?
                                            <>
                                            <div className="bottom">
                                                <Link href="/explore">
                                                    <a className="btn animate">Explore NFTs</a>
                                                </Link>
                                            </div>
                                            <div className="bottom">
                                                <Link href="/assets">
                                                    <a className="btn animate">My Assets</a>
                                                </Link>
                                            </div>
                                            <div className="bottom">
                                                <Link href="/register">
                                                    <a className="btn animate">Register</a>
                                                </Link>
                                            </div>
                                            <div className="bottom">
                                                <Link href="/signin">
                                                    <a className="btn">Login</a>
                                                </Link>
                                            </div>
                                            </>
                                            :
                                            loggedRouter()                                     }
	
									</div>
								</div>
								<div className="sinlge-bar shopping">
									<Link href="/cart">
										<a className="single-icon">
											<i className="ti-bag"></i> 
											{cart.length > 0 ?
												<span className="total-count">{cart.length}</span>
												:
												<span className="total-count">0</span>

											}
										</a>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Header Inner */}
			<div className="header-inner">
				<div className="container">
					<div className="cat-nav-head">
						<div className="row">
							<div className="col-12">
								<div className="menu-area">
									{/* Main Menu */}
									<nav className="navbar navbar-expand-lg">
										<div className="navbar-collapse">	
											<div className="nav-inner">	
												<ul className="nav main-menu menu navbar-nav">
													<li className={isActive('/')}><Link href="/">Home</Link></li>
													<li className={isActive('/shop')}>
														<Link href="/shop">
															<a>Shop<span className="new">New</span></a>
														</Link>
													</li>
													<li className={isActive('/about-us')}><Link href="/about-us">About Us</Link></li>
													<li className={isActive('/contact-us')}><Link href="/contact-us">Contact Us</Link></li>
												</ul>
											</div>
										</div>
									</nav>
									{/* End Main Menu */}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			 {/* End Header Inner  */}
		</header>
    </div>
        </>
    )
}

export async function getServerSideProps({query, p}) {
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
        result: res.result
      }, // will be passed to the page component as props
    }
}

export default NavBar
