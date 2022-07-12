import React, { useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { DataContext } from '../store/GlobalState'
import { getData } from '../utils/fetchData'
import { toast } from 'react-toastify'
import Cookie from 'js-cookie'
import { ethers } from 'ethers'
import Filter from './Filter'

function NavBar({ site }) {
  const [page, setPage] = useState(1)
  const [defaultAccount, setDefaultAccount] = useState('Connect Wallet')

  const router = useRouter()
  const { state, dispatch } = useContext(DataContext)
  const { auth, cart, promotions } = state

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
  }, [router.query])

  const isActive = (r) => {
    if (r === router.pathname) {
      return 'active'
    } else {
      return ''
    }
  }

  const handleLogout = () => {
    Cookie.remove('refreshtoken', { path: 'api/auth/accessToken' })
    localStorage.removeItem('firstLogin')
    dispatch({ type: 'AUTH', payload: {} })
    dispatch({ type: 'NOTIFY', payload: { success: 'Logged out!' } })
    return router.push('/')
  }

  const siteSettings = (e) => {
    e.preventDefault()

    if (site) {
      router.push(`/site_settings/${site._id}`)
    } else {
      router.push(`/site_settings/`)
    }
  }

  let result = promotions.filter((obj) => {
    return obj._id
  })

  const userPromotion = () => {
    if (result && result.length > 0 && auth.user.role !== 'admin') {
      return (
        <div className="bottom">
          <Link href="/manage-promotions">
            <a className="btn animate">My Promotions</a>
          </Link>
        </div>
      )
    }
  }

  const promotionUserCreateNFT = (e) => {
    e.preventDefault()
    for (let i = 0; i < promotions.length; i++) {
      if (promotions[i].activated == true && promotions[i].paid == true) {
        return router.push('/promotion-user-create-nft')
      }

      if (promotions[i].activated == false && promotions[i].paid == true) {
        toast.error('Promotion verification still under review.')
        return router.push('/')
      }

      if (promotions[i].activated == false && promotions[i].paid == false) {
        toast.error('Please complete your promotion payments.')
        return router.push('/')
      }
    }
  }

  const connectWalletHandler = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      const account = accounts[0]

      return account
    }
    if (!window.ethereum) {
      toast('Wallet not installed')
      return
    }
  }

  useEffect(() => {
    if (!window.ethereum) {
      return
    }
    connectWalletHandler().then((result) => {
      setDefaultAccount(
        result[0] +
          result[1] +
          result[2] +
          result[3] +
          result[4] +
          result[5] +
          '....' +
          result[38] +
          result[39] +
          result[40] +
          result[41],
      )
    })
  }, [defaultAccount])

  const adminRouter = () => {
    return (
      <>
        <div className="bottom">
          <a onClick={siteSettings}>
            <a className="btn animate">General Site Settings</a>
          </a>
        </div>
        <div className="bottom">
          <Link href="/manage-promotions">
            <a className="btn animate">Manage Promotions</a>
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
        <div className="bottom">
          <Link href="/users">
            <a className="btn animate">Users</a>
          </Link>
        </div>
        <div className="bottom">
          <Link href="/admin-create-nft">
            <a className="btn animate">Create NFT</a>
          </Link>
        </div>
      </>
    )
  }

  const loggedRouter = () => {
    return (
      <>
        <div className="bottom">
          <Link href="/profile">
            <a className="btn animate">Profile</a>
          </Link>
        </div>
        {auth.user.role === 'admin' && adminRouter()}
        {userPromotion()}
        <div className="bottom">
          <a href="#" className="btn animate" onClick={handleLogout}>
            Logout
          </a>
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
                      <li>
                        <i className="ti-headphone-alt"></i>+{site.phone}
                      </li>
                      <li>
                        <i className="ti-email"></i> {site.email}
                      </li>
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
                <Filter site={site} />

                <div
                  className="col-lg-2 col-md-3 col-12"
                  style={{ marginTop: '-60px' }}
                >
                  <div className="sinlge-bar mobile-nav"></div>
                  <div className="right-bar">
                    {/* Search Form */}
                    <div className="sinlge-bar shopping">
                      <a href="#" className="single-icon">
                        <i
                          className="fa fa-user-circle-o"
                          aria-hidden="true"
                        ></i>
                      </a>
                      <div
                        className="shopping-item"
                        style={{ marginTop: '-20px' }}
                      >
                        {Object.keys(auth).length === 0 ? (
                          <>
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
                        ) : (
                          loggedRouter()
                        )}
                      </div>
                    </div>
                    <div className="sinlge-bar shopping">
                      <Link href="/cart">
                        <a className="single-icon">
                          <i className="ti-bag"></i>
                          {cart.length > 0 ? (
                            <span className="total-count">{cart.length}</span>
                          ) : (
                            <span className="total-count">0</span>
                          )}
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
                              <li className={isActive('/')}>
                                <Link href="/">Home</Link>
                              </li>
                              <li className={isActive('/shop')}>
                                <Link href="/shop">
                                  <a>
                                    Shop<span className="new">New</span>
                                  </a>
                                </Link>
                              </li>
                              <li className={isActive('/contact-us')}>
                                <Link href="/contact-us">Contact Us</Link>
                              </li>
                              <li className={isActive('/explore')}>
                                <Link href="/explore">
                                  <a>Explore NFTs</a>
                                </Link>
                              </li>
                              <li className={isActive('/creator-dashboard')}>
                                <Link href="/creator-dashboard">
                                  <a>Creator Dashboard</a>
                                </Link>
                              </li>
                              <li className={isActive('/assets')}>
                                <Link href="/assets">
                                  <a>My Assets</a>
                                </Link>
                              </li>

                              {auth.user &&
                              auth.user.role !== 'admin' &&
                              result &&
                              result.length > 0 ? (
                                <li
                                  className={isActive(
                                    '/promotion-user-create-nft',
                                  )}
                                  onClick={promotionUserCreateNFT}
                                >
                                  <Link href="/promotion-user-create-nft">
                                    <a>Create NFT(Promotion)</a>
                                  </Link>
                                </li>
                              ) : null}
                              <li>
                                <button
                                  style={{ background: '#F7941D' }}
                                  className="btn mt-2 rounded"
                                  id="connect"
                                  onClick={connectWalletHandler}
                                >
                                  {defaultAccount}
                                </button>
                              </li>
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

export async function getServerSideProps({ query, p }) {
  const page = query.page || 1
  const category = query.category || 'all'
  const sort = query.sort || ''
  const search = query.search || 'all'

  const res = await getData(
    `product?limit=${
      page * 6
    }&category=${category}&sort=${sort}&title=${search}`,
  )

  const site_res = await getData(`site?limit=${page * 1}&title=${search}`)

  // server side rendering
  return {
    props: {
      products: res.products,
      sites: site_res.sites,
      result: res.result,
    }, // will be passed to the page component as props
  }
}

export default NavBar
