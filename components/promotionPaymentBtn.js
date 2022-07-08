import { useEffect, useRef, useContext } from 'react'
import { patchData } from '../utils/fetchData'
import { DataContext } from '../store/GlobalState'
import { updateItem } from '../store/Actions'

const promotionPaymentBtn = ({ promotion }) => {
  const refPaypalBtn = useRef()
  const { state, dispatch } = useContext(DataContext)
  const { auth, promotions } = state

  useEffect(() => {
    paypal
      .Buttons({
        createPromotion: function (data, actions) {
          // This function sets up the details of the transaction, including the amount and line user details.
          return actions.promotion.create({
            purchase_units: [
              {
                amount: {
                  value: promotion.total,
                },
              },
            ],
          })
        },
        onApprove: function (data, actions) {
          // This function captures the funds from the transaction.
          dispatch({ type: 'NOTIFY', payload: { loading: true } })

          return actions.promotion.capture().then(function (details) {
            patchData(
              `promotion/payment/${promotion._id}`,
              {
                paymentId: details.payer.payer_id,
                dateOfExpiration: promotion.dateOfExpiration,
              },
              auth.token,
            ).then((res) => {
              if (res.err)
                return dispatch({ type: 'NOTIFY', payload: { error: res.err } })

              dispatch(
                updateItem(
                  promotions,
                  promotion._id,
                  {
                    ...promotion,
                    paid: true,
                    dateOfPayment: details.create_time,
                    dateOfExpiration: promotion.dateOfExpiration,
                    paymentId: details.payer.payer_id,
                    method: 'Paypal',
                  },
                  'ADD_PROMOTIONS',
                ),
              )

              return dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
            })
            // This function shows a transaction success message to your buyer.
          })
        },
      })
      .render(refPaypalBtn.current)
  }, [])

  return <div ref={refPaypalBtn}></div>
}

export default promotionPaymentBtn
