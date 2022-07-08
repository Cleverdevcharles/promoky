import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import {
  marketplaceAddress
} from '../config'
import {getData} from '../utils/fetchData'
import { useRouter } from 'next/router'
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import SiteName from '../components/SiteName'
import Loading from '../components/Loading'
import Link from 'next/link'

export default function CreatorDashboard(props) {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [sites, setSites] = useState(props.sites)
  const [page, setPage] = useState(1)
  const router = useRouter()
  useEffect(() => {
    loadNFTs()
  }, [])

  useEffect(() => {
    if(Object.keys(router.query).length === 0) setPage(1)
  },[router.query])
  async function loadNFTs() {
    // const web3Modal = new Web3Modal({
    //   network: 'mainnet',
    //   cacheProvider: true,
    // })
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await contract.fetchItemsListed()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
      }
      return item
    }))

    setNfts(items)
    setLoadingState('loaded') 
  }

  function viewNFT(nft) {
    router.push(`/nft-details?id=${nft.tokenId}&tokenURI=${nft.tokenUri}`)
  }

  const explore = (e) => {
    e.preventDefault()
    router.push("/explore")
  }
  if (loadingState === 'loaded' && !nfts.length) return (
    <>
    <head>
         <title>
           {
           sites.map(site => (
           <SiteName key={site._id}  site={site} />
           ))
         } | Creator Dashboard</title>
             </head>
         {
           sites.map(site => (
           <NavBar key={site._id}  site={site} />
           ))
         }
     <center  style={{marginTop : "200px"}}>
     <h4 className="text-coolGray-900 container leading-tight text-4xl lg:text-6xl font-bold mb-4">No assets/NFT listed</h4>
     <button className='btn btn-waring mb-5' type="submit"
     onClick={explore}>
       List NOW
     </button>
     </center>  
     {
       sites.map(site => (
       <Footer key={site._id}  site={site} />
       ))
     }
   </>
  )
  return (
    <>
    <head>
     <title>
       {
       sites.map(site => (
       <SiteName key={site._id}  site={site} />
       ))
     } | Creator Dashboard</title>
         </head>
     {
       sites.map(site => (
       <NavBar key={site._id}  site={site} />
       ))
     }
       {/* All NTFs */}
   {loadingState !== 'loaded' ? <Loading/>
   :
   <>
   <div className="breadcrumbs">
       <div className="container">
           <div className="row">
               <div className="col-12">
                   <div className="bread-inner">
                       <ul className="bread-list">
                           <li>
             <Link href="/">
                   <a>Home<i className="ti-arrow-right"></i></a>
             </Link>
           </li>
                           <li className="active"><a>Creator Dashboard</a></li>
                       </ul>
                   </div>
               </div>
           </div>
       </div>
   </div>
       <section  className="product-area shop-sidebar shop section">
       <div className="container">
          <div className="row">

             <div  className=" col-12 ">
                <div className="row">
                   
                 <>
                   {nfts.map((nft, i) =>(
                      <div key={i} className="col-lg-4 col-md-6 col-12">
                         <div  className="single-product border p-3">
                            <div className="product-img">
                                     <img className="default-img" src={nft.image} alt="#" />
                                 
                                  <div className="button-head" style={{background: "orange"}} >
                                    <div className="product-action-2" style={{position: "relative", left: '40%', top: '30%'}} >
                                        <h6 title="Buy NFT" href="#" className='text-white'
                                        >LISTED</h6>
                                    </div>
                                  </div>
                            </div>
                            <div className="product-content pl-3">
                                  <h3 className='text-capitalize'><a>{nft.name}</a></h3>
                                  <div className="product-price" >
                                     <span>{nft.price}MATIC</span>
                                  </div>
                            </div>
                         </div>
                      </div>
                      ))
                   }   
                 </> 
             </div>
          </div>
          </div>
       </div>
       </section>
   </>
   }
   <>
   {
     sites.map(site => (
     <Footer key={site._id}  site={site} />
     ))
   }
   </>
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