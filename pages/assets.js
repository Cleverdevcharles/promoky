import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Web3Modal from 'web3modal'
import Link from 'next/link'
import { useRouter } from 'next/router'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import SiteName from '../components/SiteName'
import { getData } from '../utils/fetchData'
import { marketplaceAddress } from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import Loading from '../components/Loading'

export default function MyAssets(props) {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [sites, setSites] = useState(props.sites)
  const [page, setPage] = useState(1)
  const router = useRouter()
  const [wallet, setWallet] = useState('')

  useEffect(() => {
    if (window.ethereum) {
      loadNFTs()
      return
    }
    setWallet('undefined')
    toast('Wallet not installed')
  }, [])

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
    return
  }, [router.query])

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

  function listNFT(nft) {
    console.log('nft:', nft)
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenUri}`)
  }

  function viewNFT(nft) {
    console.log('nft:', nft)
    router.push(`/nft-details?id=${nft.tokenId}&tokenURI=${nft.tokenUri}`)
  }

  if (loadingState === 'loaded' && !nfts.length)
    return (
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
        <center style={{ marginTop: '200px' }}>
          <h4 className="text-coolGray-900 container leading-tight text-4xl lg:text-6xl font-bold mb-4">
            No assets/NFT owned
          </h4>
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
      </>
    )

  function listNFT(nft) {
    console.log('nft:', nft)
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`)
  }

  return (
    <>
      <>
        {wallet === 'undefined' ? (
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
            {/* All NTFs */}
            {loadingState !== 'loaded' ? (
              <Loading />
            ) : (
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
                              <a>Assets</a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <section className="product-area shop-sidebar shop section">
                  <div className="container">
                    <div className="row">
                      <div className=" col-12 ">
                        <div className="row">
                          <>
                            {nfts.map((nft, i) => (
                              <div key={i} className="col-lg-4 col-md-6 col-12">
                                <div className="single-product border p-3">
                                  <div className="product-img">
                                    <img
                                      className="default-img"
                                      src={nft.image}
                                      alt="#"
                                    />
                                    <div
                                      className="button-head"
                                      style={{ background: 'orange' }}
                                      onClick={() => listNFT(nft)}
                                    >
                                      <div
                                        className="product-action-2"
                                        style={{
                                          position: 'relative',
                                          left: '40%',
                                          top: '30%',
                                        }}
                                      >
                                        <h6
                                          title="Buy NFT"
                                          href="#"
                                          className="text-white"
                                        >
                                          LIST NFT
                                        </h6>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="product-content pl-3">
                                    <h3 className="text-capitalize">
                                      <a>{nft.name}</a>
                                    </h3>
                                    <div className="product-price">
                                      <span>{nft.price}MATIC</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
            <>
              {sites.map((site) => (
                <Footer key={site._id} site={site} />
              ))}
            </>
          </>
        )}
      </>
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
