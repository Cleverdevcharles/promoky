import { patchData, deleteData } from '../utils/fetchData'
import React, { useEffect, useState } from 'react'
import { updateItem } from '../store/Actions'
import PromotionPaymentBtn from './promotionPaymentBtn'
const PromotionDetail = ({ promotionDetail, state, dispatch }) => {
  const { auth, promotions } = state
  var expirationCount
  var compareExpiration = ' '
  var today = Date

  const expirationDate = () => {
    var today = new Date()
    var business_days = 14

    var expirationDate = today
    var total_days = business_days
    for (var days = 1; days <= total_days; days++) {
      expirationDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
      if (expirationDate.getDay() == 0 || expirationDate.getDay() == 6) {
        //it's a weekend day so we increase the total_days of 1
        total_days++
      }
    }

    return today.toLocaleDateString()
  }

  const handleActivated = (promotion) => {
    dispatch({ type: 'NOTIFY', payload: { loading: true } })

    patchData(`promotion/activated/${promotion._id}`, null, auth.token).then(
      (res) => {
        if (res.err)
          return dispatch({ type: 'NOTIFY', payload: { error: res.err } })

        const {
          paid,
          dateOfPayment,
          method,
          dateOfExpiration,
          activated,
        } = res.result

        dispatch(
          updateItem(
            promotions,
            promotion._id,
            {
              ...promotion,
              paid,
              dateOfPayment,
              dateOfExpiration,
              method,
              activated,
            },
            'ADD_PROMOTIONS',
          ),
        )

        return dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
      },
    )
  }

  const handleDeactivated = (promotion) => {
    dispatch({ type: 'NOTIFY', payload: { loading: true } })

    patchData(`promotion/deactivated/${promotion._id}`, null, auth.token).then(
      (res) => {
        if (res.err)
          return dispatch({ type: 'NOTIFY', payload: { error: res.err } })

        const {
          paid,
          dateOfPayment,
          method,
          dateOfExpiration,
          activated,
        } = res.result

        dispatch(
          updateItem(
            promotions,
            promotion._id,
            {
              ...promotion,
              paid,
              dateOfPayment,
              method,
              dateOfExpiration,
              activated,
            },
            'ADD_PROMOTIONS',
          ),
        )

        return dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
      },
    )
  }

  const handleNotPaid = (promotion) => {
    dispatch({ type: 'NOTIFY', payload: { loading: true } })

    patchData(`promotion/not-paid/${promotion._id}`, null, auth.token).then(
      (res) => {
        if (res.err)
          return dispatch({ type: 'NOTIFY', payload: { error: res.err } })

        const {
          paid,
          dateOfPayment,
          method,
          dateOfExpiration,
          activated,
        } = res.result

        dispatch(
          updateItem(
            promotions,
            promotion._id,
            {
              ...promotion,
              paid,
              dateOfPayment,
              method,
              dateOfExpiration,
              activated,
            },
            'ADD_PROMOTIONS',
          ),
        )

        return dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
      },
    )
  }

  const handlePaid = (promotion) => {
    dispatch({ type: 'NOTIFY', payload: { loading: true } })

    patchData(`promotion/paid/${promotion._id}`, null, auth.token).then(
      (res) => {
        if (res.err)
          return dispatch({ type: 'NOTIFY', payload: { error: res.err } })

        const {
          paid,
          dateOfPayment,
          method,
          dateOfExpiration,
          activated,
        } = res.result

        dispatch(
          updateItem(
            promotions,
            promotion._id,
            {
              ...promotion,
              paid,
              dateOfPayment,
              method,
              dateOfExpiration,
              activated,
            },
            'ADD_PROMOTIONS',
          ),
        )

        return dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
      },
    )
  }

  useEffect(() => {
    handleExpired()
  }, [])

  const handleExpired = () => {
    promotionDetail.map((promotion) => {
      const EXPIRED_PROMOTION = promotion.updatedAt
      console.log('CONFIRMED EXPIRATION DATE:', EXPIRED_PROMOTION)
      console.log('TODAY: ', today)
      console.log('EXPECTED EXPIRATION DATE:', expirationDate())
      if (
        expirationDate() === promotion.dateOfExpiration &&
        promotion.activated == true
      ) {
        handleNotPaid()
        return router.push('/')
      }
    })
  }

  if (!auth.user) return null
  return (
    <>
      {promotionDetail.map((promotion) => (
        <div
          key={promotion._id}
          style={{ margin: '20px auto' }}
          className="row justify-content-around"
        >
          <div
            className="text-uppercase my-3 col-8"
            style={{ maxWidth: '800px' }}
          >
            <h2 className="text-break">Promotion {promotion._id}</h2>

            <div className="mt-4 text-secondary">
              <h3>DETAILS</h3>
              <p>
                User: {promotion.user.firstName} {promotion.user.lastName}
              </p>
              <p>Name of Company: {promotion.companyName}</p>
              <p>
                Comapny's website:{' '}
                <a
                  href={`${promotion.companyWebsite}`}
                  target="_blank"
                  className="text-lowercase text-primary"
                >
                  {promotion.companyWebsite}
                </a>
              </p>
              <p>Company CAC: {promotion.companyCAC}</p>
              <p>Company Address: {promotion.address}</p>
              <p>Country: {promotion.country}</p>
              <p>State/Region: {promotion.region}</p>
              <p>
                Duration:{' '}
                {promotion.duration > 1
                  ? `${promotion.duration} days`
                  : `${promotion.duration} day`}{' '}
              </p>

              <div
                className={`alert ${
                  promotion.activated ? 'alert-success' : 'alert-danger'
                }
                        d-flex justify-content-between align-items-center`}
                role="alert"
              >
                {promotion.activated ? (
                  <>
                    Activated on{' '}
                    {promotion.updatedAt},
                    <span className="text-danger">
                      Will expire on {promotion.dateOfExpiration}
                    </span>
                    {auth.user.role === 'admin' && promotion.activated && (
                      <button
                        className="btn btn-dark text-uppercase"
                        onClick={() => handleDeactivated(promotion)}
                      >
                        Deactivate Promotion
                      </button>
                    )}
                  </>
                ) : (
                  'Not Activated'
                )}
                {auth.user.role === 'admin' && !promotion.activated && (
                  <button
                    className="btn btn-dark text-uppercase"
                    onClick={() => handleActivated(promotion)}
                  >
                    Mark as activated
                  </button>
                )}
              </div>

              <h3>Payment</h3>
              {promotion.method && (
                <h6>
                  Method: <em>{promotion.method}</em>
                </h6>
              )}

              {promotion.paymentId && (
                <p>
                  PaymentId: <em>{promotion.paymentId}</em>
                </p>
              )}

              <div
                className={`alert ${
                  promotion.paid ? 'alert-success' : 'alert-danger'
                }
                        d-flex justify-content-between align-items-center`}
                role="alert"
              >
                {promotion.paid ? (
                  <>
                    Paid on{' '}
                    {promotion.dateOfPayment}
                    {auth.user.role === 'admin' && promotion.paid && (
                      <button
                        className="btn btn-dark text-uppercase"
                        onClick={() => handleNotPaid(promotion)}
                      >
                        Mark as not paid
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    Not Paid
                    {auth.user.role === 'admin' && !promotion.paid && (
                      <button
                        className="btn btn-dark text-uppercase"
                        onClick={() => handlePaid(promotion)}
                      >
                        Mark as paid
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          {!promotion.paid && auth.user.email === promotion.user.email && (
            <div className="p-4 col-6">
              <h2 className="mb-4 text-uppercase">Total: ${promotion.total}</h2>
              <PromotionPaymentBtn promotion={promotion} />
            </div>
          )}
        </div>
      ))}
    </>
  )
}

export default PromotionDetail
