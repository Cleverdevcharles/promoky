import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import axios from 'axios'
import Web3Modal from 'web3modal'
import {marketplaceAddress} from '../config'
import { toast } from 'react-toastify';
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import SiteName from '../components/SiteName'
import { getData } from '../utils/fetchData'
import Link  from 'next/link'

export default function ResellNFT(props) {
  const [formInput, updateFormInput] = useState({ price: '', image: '' })
  const [sites, setSites] = useState(props.sites)
  const [page, setPage] = useState(1)
  
  const router = useRouter()
  const { id, tokenURI } = router.query
  const { image, price } = formInput

  useEffect(() => {
    fetchNFT()
  }, [id])

  async function fetchNFT() {
    if (!tokenURI) return
    const meta = await axios.get(tokenURI)
    updateFormInput(state => ({ ...state, image: meta.data.image }))
  }

  function viewNFT(nft) {
    console.log('nft:', nft)
    router.push(`/nft-details?id=${nft.tokenId}&tokenURI=${nft.tokenUri}`)
  }

  async function listNFTForSale(e) {
    e.preventDefault()
    if (!price) {
        toast.error("Input your new price.")
        return
    }
    
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()

    listingPrice = listingPrice.toString()
    let transaction = await contract.resellToken(id, priceFormatted, { value: listingPrice })
    await transaction.wait()
   
    router.push('/creator-dashboard')
    toast.success(`NFT listed successfully`)

  }

  useEffect(() => {
    if(Object.keys(router.query).length === 0) setPage(1)
    },[router.query])

  return (
    <>
    <head>
      <title>
      {
        sites.map(site => (
        <SiteName key={site._id}  site={site} />
        ))
    } | Resell NFT</title>
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
                            <li className="active"><Link href="/resell-nft">Resell NFT</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div className="products_manager container">
        <form className="row">
            <div className="col-md-6">
                <label htmlFor="price" className='mt-3'>Price (MATIC)</label>
                <input type="number" name="price" 
                    placeholder="Asset Price ..." className="d-block w-100 p-2"
                    min={0}
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                />
           
                <button type="submit" onClick={listNFTForSale} className="w-100 btn btn-info my-3 px-4">
                    List NFT For Sale                    
                </button>

            </div>

            <div className="col-md-6 my-3 mb-5">
                <div className="row img-up mx-0">
                    {
                        image &&  (
                            <div className="file_img">
                                <label htmlFor="preview">Preview</label>
                                <img src={image}
                                 alt="preview" className="img-thumbnail rounded object-cover" />
                            </div>
                        )
                    }  
                </div>
            </div>

           
        </form> 
    </div>
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