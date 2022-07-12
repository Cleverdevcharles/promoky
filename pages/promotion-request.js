import { useContext, useState, useEffect } from 'react'
import { DataContext } from '../store/GlobalState'
import Link from 'next/link'
import { getData, postData } from '../utils/fetchData'
import { useRouter } from 'next/router'
import axios from 'axios'
import { ethers } from 'ethers'
import { RegionDropdown, CountryDropdown } from 'react-country-region-selector'
import { marketplaceAddress } from '../config'
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import Web3Modal from 'web3modal'
import { toast } from 'react-toastify'
import promotionPaymentBtn from './../components/promotionPaymentBtn'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import SiteName from '../components/SiteName'

const PromotionRequest = (props) => {
  const [companyName, setCompanyName] = useState('')
  const [dateOfExpiration, setDateOfExpiration] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [companyCAC, setCompanyCAC] = useState('')
  const [address, setAddress] = useState('')
  const [duration, setDuration] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [nfts, setNfts] = useState([])
  const [terms_conditions, setTerms_conditions] = useState(false)
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [sites, setSites] = useState(props.sites)
  const [request, setRequest] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [myWallet, setMyWallet] = useState('Connect Wallet')

  const router = useRouter()

  const { state, dispatch } = useContext(DataContext)
  const { auth, promotions } = state

  const toggleRegisterVisiblity = () => {
    setTerms_conditions(terms_conditions ? false : true)
  }

  useEffect(() => {
    loadNFTs()
  }, [])

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
  }, [router.query])

  var today = new Date()
  let charge = parseFloat((40 * Number(duration)) / 100).toFixed(2)
  let isExpired = new Date(
    today.getTime() + duration * 24 * 60 * 60 * 1000,
  ).toLocaleDateString()

  useEffect(() => {
    const getTotal = () => {
      const res = charge
      setTotal(res)
    }
    getTotal()
  }, [charge])

  const handlePromotionRequest = async (e) => {
    e.preventDefault()
    if (!companyName) {
      toast.error('Company name is required.')
      return
    }
    if (!companyWebsite) {
      toast.error('Company website url is required.')
      return
    }
    if (!companyCAC) {
      toast.error('Company CAC is required.')
      return
    }
    if (!country) {
      toast.error('Country is required.')
      return
    }
    if (!region) {
      toast.error('State/Region is required.')
      return
    }
    if (!address) {
      toast.error('Address code is required.')
      return
    }
    if (!duration) {
      toast.error('Duration code is required.')
      return
    }

    // return dispatch({ type: 'NOTIFY', payload: {error: 'Please add your address and mobile.'}})

    dispatch({ type: 'NOTIFY', payload: { loading: true } })

    postData(
      'promotion',
      {
        address,
        country,
        region,
        duration,
        companyName,
        companyWebsite,
        companyCAC,
        dateOfExpiration: isExpired,
        total: charge,
      },
      auth.token,
    ).then((res) => {
      if (res.err)
        return dispatch({ type: 'NOTIFY', payload: { error: res.err } })

      const newPromotion = {
        ...res.newPromotion,
        user: auth.user,
      }
      dispatch({
        type: 'ADD_PROMOTIONS',
        payload: [...promotions, newPromotion],
      })
      dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
      setRequest(true)
      return router.push(`/promotion/${res.newPromotion._id}`)
    })
  }

  const explore = (e) => {
    e.preventDefault()
    router.push('/explore')
  }

  async function loadNFTs() {
    // const web3Modal = new Web3Modal({
    //   network: "mainnet",
    //   cacheProvider: true,
    // })
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketplaceContract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer,
    )
    const data = await marketplaceContract.fetchMyNFTs()

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenURI = await marketplaceContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenURI)
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          description: i.description,
          owner: i.owner,
          image: meta.data.image,
          tokenURI,
        }
        return item
      }),
    )
    setNfts(items)
    setLoadingState('loaded')
  }

  useEffect(() => {
    if (auth.role === 'admin') {
      router.push('/')
      return null
    }
  }, [])

  if (loadingState === 'loaded' && nfts.length < 2)
    return (
      <div>
        <head>
          <title>
            {sites.map((site) => (
              <SiteName key={site._id} site={site} />
            ))}{' '}
            | Promotion-Request
          </title>
        </head>
        {sites.map((site) => (
          <NavBar key={site._id} site={site} />
        ))}
        <div className="breadcrumbs pl-4">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="bread-inner">
                  <ul className="bread-list">
                    <li>
                      <Link href="/">
                        <a>
                          Home<i className="ti-arrow-right"></i>
                        </a>
                      </Link>
                    </li>
                    <li className="active">
                      <Link href="/promotion-request">Promotion Request</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <center style={{ marginTop: '200px' }}>
          <h4 className="text-coolGray-900 container leading-tight text-4xl lg:text-6xl font-bold mb-4">
            No assets/NFT owned
          </h4>
          <h5 style={{ color: 'crimson' }}>
            Purchase at least two(2) or more NFTs in order to apply for a
            business promotion.
          </h5>
          <br />
          <button
            className="btn btn-waring mb-5"
            type="submit"
            onClick={explore}
          >
            BUY NOW
          </button>
        </center>
        {sites.map((site) => (
          <Footer key={site._id} site={site} />
        ))}
      </div>
    )

    useEffect(() => {
      if (window.ethereum) {
        loadNFTs()
        return
      }
      setWallet('undefined')
      toast('Wallet not installed')
    }, [])

  return (
    <>
      {myWallet === 'undefined' ? (
        <>
          <head>
            <title>
              {sites.map((site) => (
                <SiteName key={site._id} site={site} />
              ))}{' '}
              | Assets
            </title>
          </head>
          {sites.map((site) => (
            <NavBar key={site._id} site={site} />
          ))}
          <center style={{ height: '50vh', marginTop: '300px' }}>
            <h4 className="text-danger">
              NFT not Found (Please install and connect your wallet)
            </h4>
          </center>
          <>
            {sites.map((site) => (
              <Footer key={site._id} site={site} />
            ))}
          </>
        </>
      ) : (
        <>
          <head>
            <title>
              {sites.map((site) => (
                <SiteName key={site._id} site={site} />
              ))}{' '}
              | Promotion-Request
            </title>
          </head>
          {sites.map((site) => (
            <NavBar key={site._id} site={site} />
          ))}
          <div className="breadcrumbs">
            <div className="container">
              <div className="row">
                <div className="col-12">
                  <div className="bread-inner">
                    <ul className="bread-list">
                      <li>
                        <Link href="/">
                          <a>
                            Home<i className="ti-arrow-right"></i>
                          </a>
                        </Link>
                      </li>
                      <li className="active">
                        <Link href="/promotion-request">Promotion Request</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <section className="shop login section">
            <div className="container">
              <div className="row">
                <div className="col-lg-6 offset-lg-3 col-12">
                  <div className="login-form">
                    <center>
                      <h3>Request for Buiness Promotion</h3>
                    </center>
                    {/* Form */}
                    <form className="form">
                      <div className="row">
                        <div className="col-6">
                          <div className="form-group">
                            <label>
                              Your Company's Name<span>*</span>
                            </label>
                            <input
                              type="text"
                              name="companyName"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="form-group">
                            <label>
                              Your Company's Website URL<span>*</span>
                            </label>
                            <input
                              type="text"
                              name="companyWebsite"
                              value={companyWebsite}
                              onChange={(e) =>
                                setCompanyWebsite(e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="form-group">
                            <label>
                              Your Company's Country<span>*</span>
                            </label>
                            <CountryDropdown
                              value={country}
                              style={{ color: 'grey' }}
                              className="form-control"
                              onChange={setCountry}
                              name="country"
                            />
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="form-group">
                            <label>
                              Your Company's Region or State<span>*</span>
                            </label>
                            <RegionDropdown
                              disableWhenEmpty={true}
                              country={country}
                              style={{ color: 'grey' }}
                              className="form-control"
                              value={region}
                              onChange={setRegion}
                              name="region"
                            />
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="form-group">
                            <label>
                              Your Company's Address<span>*</span>
                            </label>
                            <input
                              type="text"
                              name="address"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="form-group">
                            <label>
                              Your Company's CAC<span>*</span>
                            </label>
                            <input
                              type="text"
                              name="companyCAC"
                              value={companyCAC}
                              onChange={(e) => setCompanyCAC(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="form-group">
                            <label>
                              Select Duration<span>*</span>
                            </label>
                            <br />
                            <select
                              className="form-control"
                              value={duration}
                              onChange={(e) => setDuration(e.target.value)}
                            >
                              <option>Select Duration</option>
                              <option value="1">1 Day</option>
                              <option value="2">2 Days</option>
                              <option value="3">3 Days</option>
                              <option value="4">4 Days</option>
                              <option value="5">5 Days</option>
                              <option value="6">6 Days</option>
                              <option value="7">7 Days</option>
                              <option value="8">8 Days</option>
                              <option value="9">9 Days</option>
                              <option value="10">10 Days</option>
                              <option value="12">12 Days</option>
                              <option value="13">13 Days</option>
                              <option value="14">14 Days</option>
                              <option value="15">15 Days</option>
                              <option value="16">16 Days</option>
                              <option value="17">17 Days</option>
                              <option value="18">18 Days</option>
                              <option value="19">19 Days</option>
                              <option value="20">20 Days</option>
                              <option value="21">21 Days</option>
                              <option value="22">22 Days</option>
                              <option value="23">23 Days</option>
                              <option value="24">24 Days</option>
                              <option value="25">25 Days</option>
                              <option value="26">26 Days</option>
                              <option value="27">27 Days</option>
                              <option value="28">28 Days</option>
                              <option value="29">29 Days</option>
                              <option value="30">30 Days</option>
                              <option value="31">31 Days</option>
                            </select>
                            <small
                              id="emailHelp"
                              className="form-text text-muted"
                            >
                              <p>
                                <b>
                                  1 - 10days = BASIC PLAN
                                  <br />
                                  Above 10days - 20days = PREMIUM PLAN
                                  <br />
                                  Above 20day = GOLD PLAN
                                </b>
                                <p style={{ color: 'crimson' }}>
                                  NOTE : You will be charged a 40% fee for this
                                  promotion. Fee charged depends on promotion
                                  plan.
                                </p>
                              </p>
                            </small>
                          </div>
                          <input
                            type="text"
                            style={{ display: 'none' }}
                            name="dateOfExpiration"
                            value={isExpired}
                            onChange={(e) =>
                              setDateOfExpiration(e.target.value)
                            }
                          />
                        </div>
                        <div className="col-12">
                          <p>
                            <input
                              type="checkbox"
                              onClick={toggleRegisterVisiblity}
                              value="None"
                              id="slideThree"
                              name="check"
                            />{' '}
                            <small>
                              By submitting this request, you agree to our
                              Conditions of Use & Sale. Please see our Privacy
                              Notice, our Cookies Notice and our Interest-Based
                              Ads Notice.{' '}
                              <a href="/terms-conditions" target="_blank">
                                <a style={{ color: 'crimson' }}>
                                  Terms & Conditions
                                </a>
                              </a>
                            </small>
                          </p>
                        </div>
                        <div className="button5">
                          {request ? (
                            <promotionPaymentBtn
                              total={charge}
                              companyName={companyName}
                              dateOfExpiration={isExpired}
                              companyWebsite={companyWebsite}
                              address={address}
                              duration={duration}
                              country={country}
                              region={region}
                              state={state}
                              dispatch={dispatch}
                            />
                          ) : (
                            <div className="col-12">
                              <div
                                className="form-group login-btn"
                                style={{ justifyContent: 'space-between' }}
                              >
                                {terms_conditions ? (
                                  <button
                                    type="submit"
                                    className="btn w-100"
                                    onClick={handlePromotionRequest}
                                  >
                                    <b>Continue For ${charge}</b>
                                  </button>
                                ) : (
                                  <button
                                    type="submit"
                                    disabled
                                    className="btn w-100"
                                  >
                                    <b>
                                      Kindly agree to our Conditions of Use &
                                      Sale.
                                    </b>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </form>
                    {/* End Form */}
                  </div>
                </div>
              </div>
            </div>
          </section>
          {sites.map((site) => (
            <Footer key={site._id} site={site} />
          ))}
        </>
      )}
    </>
  )
}

export async function getServerSideProps({ query }) {
  const page = query.page || 1
  const search = query.search || 'all'

  const res = await getData(`site?limit=${page * 1}&title=${search}`)
  // server side rendering
  return {
    props: {
      sites: res.sites,
      result: res.result,
    }, // will be passed to the page component as props
  }
}
export default PromotionRequest
