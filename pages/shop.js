import Link from 'next/link'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '../store/GlobalState'

import { getData } from '../utils/fetchData'
import ProductItem from '../components/product/ProductItem'
import filterSearch from '../utils/filterSearch'
import { useRouter } from 'next/router'
import Sort from '../components/Sort'
import SiteName from '../components/SiteName'
import Footer from '../components/Footer'
import NavBar from '../components/NavBar'

const Shop = (props) => {
  const [products, setProducts] = useState(props.products)
  const [sites, setSites] = useState(props.sites)

  const [isCheck, setIsCheck] = useState(false)
  const [page, setPage] = useState(1)
  const router = useRouter()

  const { state } = useContext(DataContext)
  const { categories, auth, cart } = state

  useEffect(() => {
    setProducts(props.products)
  }, [props.products])

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
  }, [router.query])

  const handleCheck = (id) => {
    products.forEach((product) => {
      if (product._id === id) product.checked = !product.checked
    })
    setProducts([...products])
  }

  const handleCheckALL = () => {
    products.forEach((product) => (product.checked = !isCheck))
    setProducts([...products])
    setIsCheck(!isCheck)
  }

  const handleDeleteAll = () => {
    let deleteArr = []
    products.forEach((product) => {
      if (product.checked) {
        deleteArr.push({
          data: '',
          id: product._id,
          title: 'Delete all selected products?',
          type: 'DELETE_PRODUCT',
        })
      }
    })

    dispatch({ type: 'ADD_MODAL', payload: deleteArr })
  }

  const handleLoadmore = () => {
    setPage(page + 1)
    filterSearch({ router, page: page + 1 })
  }

  return (
    <>
      <head>
        <title>
          {sites.map((site) => (
            <SiteName key={site._id} site={site} />
          ))}{' '}
          | Shop
        </title>
      </head>
      {sites.map((site) => (
        <NavBar key={site._id} site={site} />
      ))}
      <>
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
                      <a>Shop</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        {products.length === 0 ? (
          <>
            <div className="container">
              <h2 className="mt-5 mb-5">Search not found ...</h2>
            </div>
          </>
        ) : (
          <section className="product-area shop-sidebar shop section">
            <div className="container">
              <div className="row">
                <div className="col-lg-3 col-md-4 col-12">
                  <div className="shop-sidebar">
                    {/* Single Widget */}
                    {auth.user && auth.user.role === 'admin' && (
                      <div className="single-widget category">
                        <h3 className="title">DELETE PRODUCT</h3>
                        <div
                          className="delete_all btn btn-danger mt-2"
                          style={{ marginBottom: '-10px' }}
                        >
                          <input
                            type="checkbox"
                            checked={isCheck}
                            onChange={handleCheckALL}
                            style={{
                              width: '25px',
                              height: '25px',
                              transform: 'translateY(8px)',
                            }}
                          />

                          <button
                            className="btn btn-danger ml-2 mt-4"
                            data-toggle="modal"
                            data-target="#exampleModal"
                            onClick={handleDeleteAll}
                          >
                            DELETE ALL
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="single-widget category">
                      <h3 className="title">Categories</h3>
                      <ul className="categor-list">
                        {categories.map((item) => (
                          <li key={item._id}>
                            <a>{item.name}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* End Single Widget */}
                  </div>
                </div>
                <div className="col-lg-9 col-md-8 col-12">
                  <div className="row">
                    <div className="col-12">
                      {/* Shop Top */}
                      <Sort state={state} />
                      {/* End Shop Top */}
                    </div>
                  </div>
                  <div className="row">
                    {products.map((product) => (
                      <ProductItem
                        key={product._id}
                        product={product}
                        handleCheck={handleCheck}
                      />
                    ))}
                  </div>
                  <br />
                  {props.result < page * 6 ? (
                    ''
                  ) : (
                    <button
                      className="btn btn-outline-info d-block mx-auto mb-4"
                      onClick={handleLoadmore}
                    >
                      Load more
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </>

      {sites.map((site) => (
        <Footer key={site._id} site={site} />
      ))}
    </>
  )
}

export async function getServerSideProps({ query }) {
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

export default Shop
