import {ethers} from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from "web3modal"
import {marketplaceAddress} from '../../config'
import NFTMarketplace from '../../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import Link from 'next/link';
import Loading from '../Loading';


const Nfts = () => {
   const [nfts, setNfts] = useState([]);
   const [loadingState, setLoadingState] = useState('not-loaded');
   useEffect(()=>{
     loadNFTs();
   }, []);
 
   async function loadNFTs() {
      /* create a generic provider and query for unsold market items */
      const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/5641ae1754df4d5f9fcf44bb220acad0")
      const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, provider)
      const data = await contract.fetchMarketItems()
  
      /*
      *  map over items returned from smart contract and format 
      *  them as well as fetch their token metadata
      */
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
          name: meta.data.name,
          description: meta.data.description,
        }
        return item
      }))
      setNfts(items)
      setLoadingState('loaded') 
   }

   async function buyNft(nft) {
      /* needs the user to sign the transaction, so will use Web3Provider and sign it */
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
  
      /* user will be prompted to pay the asking proces to complete the transaction */
      const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')   
      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: price
      })
      await transaction.wait()
      loadNFTs()
   }

   return (
        <>
            {/* All NTFs */}
         {loadingState !== 'loaded' ? <Loading/> :
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
                         <li className="active"><a>Explore</a></li>
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
                         {!nfts.length ?
                       <center>
                       <h4 className="text-coolGray-900 container leading-tight text-4xl lg:text-6xl font-bold mb-4">No item in market place</h4>
                       </center>  :
                       <>
                         {nfts.map((nft, i) =>(
                            <div key={i} className="col-lg-4 col-md-6 col-12">
 
                         <div  className="single-product border p-3">
                            <div className="product-img">
                                  <a>
                                     <img className="default-img" style={{width: "100%", height: "300px"}} src={nft.image} alt="#" />
                                  </a>
                                  <div className="button-head" style={{background: "orange"}} onClick={() => buyNft(nft)}>
                                     <div className="product-action-2" style={{position: "relative", left: '40%', top: '30%'}} >
                                        <h6 title="Buy NFT" href="#" className='text-white'
                                        >BUY NFT</h6>
                                     </div>
                                  </div>
                            </div>
                            <div className="product-content pl-3">
                                 <h3 className='text-capitalize'><a>{nft.name}</a></h3>
                                 <div className="product-price">
                                    <span>{nft.price}MATIC</span>
                                 </div>
                            </div>
                         </div>
                            </div>
                            ))
                         }   
                       </> 
                      }
                   </div>
                </div>
                </div>
             </div>
             </section>
         </>
         }
        </>
    )
}

export default Nfts;