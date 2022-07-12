import { useState, useContext, useEffect } from 'react'
import { DataContext } from '../store/GlobalState'
import { patchData, getData } from '../utils/fetchData'
import Link from 'next/link'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import SiteName from '../components/SiteName'
import { marketplaceAddress } from '../config'
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import { toast } from 'react-toastify'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

export default function PromotionUserCreateNFT(props) {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({
    price: '',
    name: '',
    description: '',
  })
  const [sites, setSites] = useState(props.sites)
  const [page, setPage] = useState(1)
  const router = useRouter()
  const { state, dispatch } = useContext(DataContext)

  const { auth, promotions } = state

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
  }, [router.query])

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      })
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  //1. create item (image/video) and upload to ipfs
  async function uploadToIPFS() {
    const { name, description, price } = formInput

    //form validation
    if (!name && !description && !price && !fileUrl) {
      toast.error('Please fill out all fields')
      return
    }
    if (!name) {
      toast.error('Asset name is required.')
      return
    }
    if (!description) {
      toast.error('Please describe your asset.')
      return
    }
    if (!price) {
      toast.error('Price is required')
      return
    }
    if (price <= 0) {
      toast.error('Price must be above zero')
      return
    }
    if (!fileUrl) {
      toast.error('Please upload an image')
      return
    }
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
      toast.error(`Error uploading file`)
    }
  }

  //2. List item for sale
  async function listNFTForSale(e) {
    e.preventDefault()
    const url = await uploadToIPFS()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* next, create the item */
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer,
    )
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    let transaction = await contract.createToken(url, price, {
      value: listingPrice,
    })
    await transaction.wait()

    router.push('/explore')
    toast.success('NFT created successfully')
  }

  useEffect(() => {
    if (!auth.user) {
      router.push('/')
      return
    }
    patchData('user', auth.token).then((res) => {
      if (res.err) return null

      dispatch({
        type: 'AUTH',
        payload: {
          token: auth.token,
          user: res.user,
        },
      })
      return dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
    })
  }, [auth.user])
  if (!auth.user) return null

  promotions.map((promotion) => {
    if (auth.user.role === 'admin') {
      console.log('RESTRICTION PROMOTION:', promotion.activated)
      router.push('/')
      return null
    }
  })

  useEffect(() => {
    for (let i = 0; i < promotions.length; i++) {
      if (promotions[i].activated == true && promotions[i].paid == true) {
        return router.push('/promotion-user-create-nft')
      }

      if (promotions[i].activated == false && promotions[i].paid == true) {
        return router.push('/')
      }

      if (promotions[i].activated == false && promotions[i].paid == false) {
        return router.push('/')
      }
    }
  }, [])

  return (
    <>
      <head>
        <title>
          {sites.map((site) => (
            <SiteName key={site._id} site={site} />
          ))}{' '}
          | Create NFT
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
                    <Link href="/promotion-user-create-nft">
                      Create NFT(Promotion)
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="products_manager container">
        <form className="row">
          <div className="col-md-6">
            <label htmlFor="title" className="mt-3">
              Asset Name
            </label>
            <input
              type="text"
              name="title"
              placeholder="Asset Name"
              className="d-block w-100 p-2"
              onChange={(e) =>
                updateFormInput({ ...formInput, name: e.target.value })
              }
            />

            <label htmlFor="price" className="mt-3">
              Price (MATIC)
            </label>
            <input
              type="number"
              name="price"
              placeholder="Asset Price ..."
              className="d-block w-100 p-2"
              min={0}
              onChange={(e) =>
                updateFormInput({ ...formInput, price: e.target.value })
              }
            />
            <label htmlFor="image_upload" className="mt-3">
              Image Upload
            </label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">Upload</span>
              </div>
              <div className="custom-file border rounded">
                <input
                  type="file"
                  className="custom-file-input"
                  placeholder="Upload product image ..."
                  onChange={onChange}
                  multiple
                  accept="image/*"
                />
              </div>
            </div>

            <label htmlFor="description" className="mt-3">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              cols="30"
              rows="5"
              placeholder="Description"
              onChange={(e) =>
                updateFormInput({ ...formInput, description: e.target.value })
              }
              className="d-block  w-100 p-2"
            />

            <button
              type="submit"
              onClick={listNFTForSale}
              className="w-100 btn btn-info my-3 px-4"
            >
              Create
            </button>
          </div>

          <div className="col-md-6 my-3">
            <div className="row img-up mx-0">
              {fileUrl && (
                <div className="file_img">
                  <label htmlFor="preview">Preview</label>
                  <img
                    src={fileUrl}
                    alt="preview"
                    className="img-thumbnail rounded object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
      {sites.map((site) => (
        <Footer key={site._id} site={site} />
      ))}
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
