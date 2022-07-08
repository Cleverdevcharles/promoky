import { useState, useContext, useEffect } from 'react'
import { DataContext } from '../store/GlobalState'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getData } from '../utils/fetchData'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import SiteName from '../components/SiteName'

const AdminPromotion = (props) => {
  const [sites, setSites] = useState(props.sites)
  const [page, setPage] = useState(1)
  const router = useRouter()

  const { state, dispatch } = useContext(DataContext)
  const { auth, notify, promotions } = state

  useEffect(() => {
    promotions
    if (!auth.user) {
      router.push('/')
      return
    }
  }, [auth.user])
  if (!auth.user) return null


  return (
    <>
      <head>
        <title>
          {sites.map((site) => (
            <SiteName key={site._id} site={site} />
          ))}{' '}
          | Profile
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
                    <Link href="/manage-promotions">Manage Promotions</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="profile_page container">
        <section className="row text-secondary my-3">
          <div className="col-12">
            <h3 className="text-uppercase">Promotions</h3>

            <div className="my-3 table-responsive">
              <table
                className="table-bordered table-hover w-100 text-uppercase"
                style={{ minWidth: '600px', cursor: 'pointer' }}
              >
                <thead className="bg-light font-weight-bold">
                  <tr>
                    <td className="p-2">id</td>
                    <td className="p-2">date</td>
                    <td className="p-2">total</td>
                    <td className="p-2">duration</td>
                    <td className="p-2">activated</td>
                    <td className="p-2">paid</td>
                    {auth.user.role === 'admin' && auth.user.root ? (
                      <td className="p-2">delete</td>
                    ) : null}
                  </tr>
                </thead>

                <tbody>
                  {promotions.map((promotion) => (
                    <tr key={promotion._id}>
                      <td className="p-2">
                        <Link href={`/promotion/${promotion._id}`}>
                          <a>{promotion._id}</a>
                        </Link>
                      </td>
                      <td className="p-2">
                        {new Date(promotion.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-2">${promotion.total}</td>
                      <td className="p-2">
                        {promotion.duration > 1
                          ? `${promotion.duration} days`
                          : `${promotion.duration} day`}
                      </td>
                      <td className="p-2">
                        {promotion.activated ? (
                          <i className="fas fa-check text-success"></i>
                        ) : (
                          <i className="fas fa-times text-danger"></i>
                        )}
                      </td>
                      <td className="p-2">
                        {promotion.paid ? (
                          <i className="fas fa-check text-success"></i>
                        ) : (
                          <i className="fas fa-times text-danger"></i>
                        )}
                      </td>
                      {auth.user.role === 'admin' && auth.user.root ? (
                        <td>
                          <i
                            className="fas fa-trash-alt text-danger ml-2"
                            title="Remove"
                            data-toggle="modal"
                            data-target="#exampleModal"
                            onClick={() =>
                              dispatch({
                                type: 'ADD_MODAL',
                                payload: [
                                  {
                                    data: promotions,
                                    id: promotion._id,
                                    title: promotion._id,
                                    type: 'DELETE_PROMOTION',
                                  },
                                ],
                              })
                            }
                          ></i>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
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

export default AdminPromotion
