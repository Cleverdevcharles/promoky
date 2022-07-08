import Link from 'next/link'
import { useContext } from 'react'
import { DataContext } from '../../store/GlobalState'
import { addToCart } from '../../store/Actions'

const ProductItem = ({ product, handleCheck }) => {
  const { state, dispatch } = useContext(DataContext)
  const { cart, auth } = state

  const adminLink = () => {
    return (
      <div className="right p-3" style={{ float: 'right' }}>
        <Link href={`create/${product._id}`}>
          <a
            className="btn btn-info text-white"
            style={{ marginRight: '5px', flex: 1 }}
          >
            Edit
          </a>
        </Link>
        <button
          className="btn btn-danger"
          style={{ marginLeft: '5px', flex: 1 }}
          data-toggle="modal"
          data-target="#exampleModal"
          onClick={() =>
            dispatch({
              type: 'ADD_MODAL',
              payload: [
                {
                  data: '',
                  id: product._id,
                  title: product.title,
                  type: 'DELETE_PRODUCT',
                },
              ],
            })
          }
        >
          Delete
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="col-lg-4 col-md-6 mt-5 p-3 col-12">
        {auth.user && auth.user.role === 'admin' && (
          <input
            type="checkbox"
            checked={product.checked}
            className="position-absolute"
            style={{ height: '20px', width: '20px' }}
            onChange={() => handleCheck(product._id)}
          />
        )}
        <div
          className="single-product"
        >
          <div className="product-img">
            <>
              <a>
                <img
                  className="default-img"
                  src={product.images[0].url}
                  style={{backgroundPosition: "center"}}
                  alt="#"
                />
            
                <span>
                  {product.inStock > 0 ? (
                    <>
                      {product.inStock <= 10 ? (
                        <span className="out-of-stock">"Hot"</span>
                      ) : null}
                    </>
                  ) : (
                    <span className="out-of-stock">Out of Stock</span>
                  )}
                </span>
              </a>
            </>
            <div className="button-head">
              <div className="product-action pr-3">
                <Link href={`product/${product._id}`}>
                  <a>
                    <i className=" ti-eye"></i>
                    <span>Quick View</span>
                  </a>
                </Link>
              </div>
              <div className="product-action-2 pl-3">
                <a
                  title="Add to cart"
                  href="#"
                  disabled={product.inStock === 0 ? true : false}
                  onClick={() => dispatch(addToCart(product, cart))}
                >
                  Add to cart
                </a>
              </div>
            </div>
          </div>
          <div className="product-content pl-3">
            <h3 className="text-capitalize">
              <Link href={`product/${product._id}`}>{product.title}</Link>
            </h3>
            <div className="product-price">
              <span>${product.price}</span>
            </div>
          </div>
          {!auth.user || auth.user.role !== 'admin' ? null : adminLink()}
        </div>
      </div>
    </>
  )
}

export default ProductItem
