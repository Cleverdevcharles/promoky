import Link from 'next/link'
import { decrease, increase } from '../store/Actions'

const CartItem = ({item, dispatch, cart}) => {
    return (
        <tr>
        <td className="image" data-title="Image">
            <img src={item.images[0].url} alt={item.images[0].url}/>
        </td>
        <td className="product-des" data-title="Description">
            <p className="product-name">
            <Link href={`/product/${item._id}`}>
                <a>{item.title}</a>
            </Link>
            </p>
            <p className="product-des">{item.description}</p>
        </td>
        <td className="price" data-title="Price"><span>${item.price} </span></td>
        <td className="qty" data-title="Qty">{/* Input Order */}
            <div className="input-group">
                <div className="button minus">
                    <button type="button" className="btn btn-primary btn-number" 
                    data-type="minus" data-field="quant[1]"
                    onClick={ () => dispatch(decrease(cart, item._id)) } 
                    disabled={item.quantity === 1 ? true : false}
                    >
                        <i className="ti-minus"></i>
                    </button>
                </div>
                <input type="text" name="quant[1]" disabled className="input-number"  data-min="1" data-max="100" value={item.quantity} />
                <div className="button plus">
                    <button type="button" className="btn btn-primary btn-number" data-type="plus" data-field="quant[1]"
                     onClick={ () => dispatch(increase(cart, item._id)) }
                     disabled={item.quantity === item.inStock ? true : false} >
                        <i className="ti-plus"></i>
                    </button>
                </div>
            </div>
            {/* End Input Order */}
        </td>
        <td className="total-amount" data-title="Total"><span>${item.quantity * item.price}</span></td>
        <td className="action" data-title="Remove">
            <a href="#" aria-hidden="true"
             data-toggle="modal" data-target="#exampleModal"
             onClick={() => 
                dispatch({
                 type: 'ADD_MODAL',
                 payload: [{ data: cart, id: item._id, title: item.title, type: 'ADD_CART' }]
                })
            } 
            >
            <i className="ti-trash remove-icon" ></i>
            </a>
        </td>
    </tr>
    )
}

export default CartItem