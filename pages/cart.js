import Head from 'next/head'
import { useContext, useState, useEffect } from 'react'
import { DataContext } from '../store/GlobalState'
import CartItem from '../components/CartItem'
import Link from 'next/link'
import { getData, postData } from '../utils/fetchData'
import { useRouter } from 'next/router'
import axios from 'axios'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider';
import { RegionDropdown, CountryDropdown } from "react-country-region-selector";
import Input from "react-phone-number-input/input";
import {marketplaceAddress} from '../config'
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import Web3Modal from "web3modal"
import { toast } from 'react-toastify'
import PaypalBtn from './../components/paypalBtn';
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import SiteName from '../components/SiteName'


const Cart = (props) => {
  const [subTotal, setSubTotal] = useState(0)
  const [total, setTotal] = useState(0)
  const [nftDiscount, setNFTDiscount] = useState(0)
  const [wallet, setWallet] = useState('')
  const [address, setAddress] = useState('')
  const [street, setStreet] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [mobile, setMobile] = useState('')
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [callback, setCallback] = useState(false)
  const [payment, setPayment] = useState(false)
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [sites, setSites] = useState(props.sites)
  const [page, setPage] = useState(1)
  const router = useRouter()
  const { state, dispatch } = useContext(DataContext)
  const { cart, auth, orders } = state

  useEffect(() => {
    loadNFTs()
  }, [])
  
  useEffect(() => {
    if(Object.keys(router.query).length === 0) setPage(1)
  },[router.query])

  useEffect(() => {
    const getTotal = () => {
      const res = cart.reduce((prev, item) => {
        return (prev + (item.price * item.quantity)) 
      },0)

      setTotal(res)
    }
    getTotal()
  },[cart])

  useEffect(() => {
    const getSubTotal = () => {
      const res = cart.reduce((prev, item) => {
        return prev + (item.price * item.quantity)
      },0)

      setSubTotal(res)
    }
    getSubTotal()
  },[cart])

  const getAccount = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })        
  
    const account = accounts[0];
    return account;
  }  
  
  useEffect(() => {
    getAccount().then((res) => {
      setWallet(res)
    })
  },[wallet])
 
    const getNFTDiscount = (e) => {
      e.preventDefault();
      if(typeof window !== 'undefined'){
        getAccount().then((res) => {
          setWallet(res)

          if (!nfts.length)  {
            const res = cart.reduce((prev, item) => {
              if((prev + (item.discount)) <= 0) {
                toast.error(`Sorry this product has no discount`)
                return 
              }
              return 0;
            },0)
            toast.error(`You are not an NFT holder, please purchase at least one NFt.`)
            setNFTDiscount(res)
          }else{
            const res = cart.reduce((prev, item) => {            
              if((prev + (item.discount)) <= 0) {
                toast.error(`Sorry this product has no discount`)
                return 
              }
              return prev+ (item.discount)
          },0)
          toast.success(`Congratulations on discount as an NFT holder`)
          setNFTDiscount(res)
          }
        })
      }else{
        toast.error('No MetaMask? You should consider trying MetaMask!');

      }
    }
    

  useEffect(() => {
    const cartLocal = JSON.parse(localStorage.getItem('__next__cart01__devat'))
    if(cartLocal && cartLocal.length > 0){
      let newArr = []
      const updateCart = async () => {
        for (const item of cartLocal){
          const res = await getData(`product/${item._id}`)
          const { _id, title, images, price, discount, inStock, sold } = res.product
          if(inStock > 0){
            newArr.push({ 
              _id, title, images, price, discount, inStock, sold,
              quantity: item.quantity > inStock ? 1 : item.quantity
            })
          }
        }

        dispatch({ type: 'ADD_CART', payload: newArr })
      }

      updateCart()
    } 
  },[callback])

  const handlePayment = async () => {
    if (!street) {
      toast.error("Street is required.");
      return;
    }
    if (!mobile) {
      toast.error("Phone number is required.");
      return;
    }
    if (!country) {
      toast.error("Country is required.");
      return;
    }
    if (!region) {
      toast.error("State/Region is required.");
      return;
    }
    if (!postalCode) {
      toast.error("Postal code is required.");
      return;
    }
    
    // return dispatch({ type: 'NOTIFY', payload: {error: 'Please add your address and mobile.'}})
    const mainAddress = `
    ${street},
    ${country},
    ${region}. 
    POSTAL CODE: ${postalCode}
    `
    let newCart = [];
    for(const item of cart){
      const res = await getData(`product/${item._id}`)
      if(res.product.inStock - item.quantity >= 0){
        newCart.push(item)
      }
    }
    
    if(newCart.length < cart.length){
      setCallback(!callback)
      return dispatch({ type: 'NOTIFY', payload: {
        error: 'The product is out of stock or the quantity is insufficient.'
      }})
    }

    dispatch({ type: 'NOTIFY', payload: {loading: true} })
    const mainTotal =  total - nftDiscount + ((subTotal)/2)

    postData('order', {address: mainAddress, mobile, cart, total: mainTotal}, auth.token)
    .then(res => {
      if(res.err) return dispatch({ type: 'NOTIFY', payload: {error: res.err} })

      dispatch({ type: 'ADD_CART', payload: [] })
      
      const newOrder = {
        ...res.newOrder,
        user: auth.user
      }
      dispatch({ type: 'ADD_ORDERS', payload: [...orders, newOrder] })
      dispatch({ type: 'NOTIFY', payload: {success: res.msg} })
      setPayment(true)
      return router.push(`/order/${res.newOrder._id}`)
    })

  }

  const solveDicount = ((total * nftDiscount))/100
  const solveShipping = ((subTotal * 15))/100
  const solveDiscount_Shipping = total + solveShipping
  const realPrice = solveDiscount_Shipping - solveDicount
  


  async function loadNFTs() {
    // const web3Modal = new Web3Modal({
    //   network: "mainnet",
    //   cacheProvider: true,
    // })
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketplaceContract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await marketplaceContract.fetchMyNFTs()

    const items = await Promise.all(data.map(async i => {
      const tokenURI = await marketplaceContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenURI)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        tokenURI
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }

  
  
  if( cart.length === 0 ) 
    return (
      <div>
       <head>
          <title>
		  {
			sites.map(site => (
			<SiteName key={site._id}  site={site} />
			))
		} | Cart</title>
        </head>
		{
			sites.map(site => (
			<NavBar key={site._id}  site={site} />
			))
		}
        <div className="breadcrumbs pl-4">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="bread-inner">
							<ul className="bread-list">
								<li><Link href="/"><a>Home<i className="ti-arrow-right"></i></a></Link></li>
								<li className="active"><Link href="/cart">Cart</Link></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
      <img className="img-responsive w-100" src="/empty_cart.jpg" alt="not empty" style={{height: "70vh"}}/>
      {
			sites.map(site => (
			<Footer key={site._id}  site={site} />
			))
		}
      </div>
    )

    return(
      <>
       <head>
          <title>
		  {
			sites.map(site => (
			<SiteName key={site._id}  site={site} />
			))
		} | Cart</title>
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
								<li className="active"><Link href="/cart">Cart</Link></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
      <div className="shopping-cart section">
		<div className="container">
			<div className="row">
				<div className="col-12">
					{/* Shopping Summery */}
					<table className="table shopping-summery">
						<thead>
							<tr className="main-hading">
								<th>PRODUCT</th>
								<th>NAME</th>
								<th className="text-center">UNIT PRICE</th>
								<th className="text-center">QUANTITY</th>
								<th className="text-center">TOTAL</th> 
								<th className="text-center"><i className="ti-trash remove-icon"></i></th>
							</tr>
						</thead>
						<tbody>
              {
                cart.map(item => (
                  <CartItem key={item._id} item={item} dispatch={dispatch} cart={cart} />
                ))
              }
						</tbody>
					</table>
					{/* End Shopping Summery */}
				</div>
			</div>
			<div className="row">
				<div className="col-12">
					{/* Total Amount */}
					<div className="total-amount">
						<div className="row">
							<div className="col-lg-8 col-md-5 col-12">
								<div className="left">
									<div className="coupon">
										<form>
                      {!!wallet ?
											<input name="discount" placeholder={wallet} disabled />
                      :
											<input name="discount" placeholder="Not Connected" disabled />
                      }
											<button className="btn" type="button" onClick={getNFTDiscount}>Get NFT Discount</button>
										</form>
									</div>
							</div>
							</div>
              <form>
                <div className='row container'>
                <div className="col-lg-6 col-md-6 col-sm-12 my-3 text-uppercase text-secondary">
                    <hr/>
                    <center >
                    <h4>Shipping Address</h4>
                    </center>
                    <hr/>

                    <input type="text" name="address" id="address"
                    className="form-control mb-2" value={address}
                    style={{display:"none"}}
                    />
                    
  <div className="form-group" >
  <input type="street" 
      className="form-control formControl" 
      id="input" 
      placeholder="Street"
      value={street}
      name="street"
      onChange={e => setStreet(e.target.value)}
    />
   <div className='row my-4'>
    <div className='col-6'>

    <CountryDropdown
      value={country}
      style={{ color: "grey" }}
      className="form-control"
      onChange={setCountry}
      name="country"
    />
    </div>
    <div className='col-6'>

    <RegionDropdown
      disableWhenEmpty={true}
      country={country}
      style={{ color: "grey" }}
      className="form-control"
      value={region}
      onChange={setRegion}
      name="region"
    />
    </div>

  </div>
<div className='row my-4'>
  <div className='col-6'>
  <input type="postalCode" 
         className="form-control formControl" 
         id="inputPostalCode input" 
         placeholder="Postal Code"
         value={postalCode}
         name="postalCode"
         onChange={e => setPostalCode(e.target.value)}
         />

  </div>
  
  <div className='col-6'>

         <Input
            placeholder="Mobile"
            className="form-control"
            value={mobile}
            onChange={setMobile}
          />
  </div>
</div>

</div>
              </div>
							<div className=" col-lg-6 col-md-6 col-sm-12">
								<div className="right">
									<ul className='pr-3'>
										<li>Cart Subtotal<span>${subTotal}</span></li>
										<li>Shipping<span>${solveShipping}</span></li>
										<li>You Save<span>${solveDicount}</span></li>
										<li className="last">You Pay<span>$
                      {realPrice}
                    </span></li>
									</ul>
									<div className="button5">
                      {auth.user ? 
										  <>
                      {payment?
                      <PaypalBtn 
                      total={realPrice}
                      address={address}
                      mobile={mobile}
                      state={state}
                      dispatch={dispatch}
                      />
                      : 
                      <a className="btn" onClick={handlePayment}>Proceed To Payment</a>
                      }
                      </>
                      : 
										  <Link href='/signin'>
                        <a className="btn">Login to checkout</a>
                      </Link>
                      }
										<Link href="/shop"><a className="btn">Continue shopping</a></Link>
									</div>
								</div>
							</div>
                </div>
              </form>

						</div>
					</div>
					{/* {/* End Total Amount */}
				</div>
			</div>
		</div>
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
export default Cart