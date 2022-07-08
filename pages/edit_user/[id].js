import Head from 'next/head'
import Link from 'next/link'
import { useContext, useState, useEffect } from 'react'
import { DataContext } from '../../store/GlobalState'
import { updateItem } from '../../store/Actions'

import { useRouter } from 'next/router'
import { patchData, getData } from '../../utils/fetchData'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import SiteName from '../../components/SiteName'

const EditUser = (props) => {
  const [sites, setSites] = useState(props.sites)
  const [page, setPage] = useState(1)
  const router = useRouter()
  const { id } = router.query

  const { state, dispatch } = useContext(DataContext)
  const { auth, users } = state

  const [editUser, setEditUser] = useState([])
  const [checkAdmin, setCheckAdmin] = useState(false)
  const [num, setNum] = useState(0)

  useEffect(() => {
    users.forEach((user) => {
      if (user._id === id) {
        setEditUser(user)
        setCheckAdmin(user.role === 'admin' ? true : false)
      }
    })
  }, [users])

  const handleCheck = () => {
    setCheckAdmin(!checkAdmin)
    setNum(num + 1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    let role = checkAdmin ? 'admin' : 'general user'
    if (num % 2 !== 0) {
      dispatch({ type: 'NOTIFY', payload: { loading: true } })
      patchData(`user/${editUser._id}`, { role }, auth.token).then((res) => {
        if (res.err)
          return dispatch({ type: 'NOTIFY', payload: { error: res.err } })

        dispatch(
          updateItem(
            users,
            editUser._id,
            {
              ...editUser,
              role,
            },
            'ADD_USERS',
          ),
        )

        return dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
      })
    }
  }

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
  }, [router.query])

  useEffect(() => {
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
          | Edit User
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
                    <a>Edit User</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="edit_user my-3 container">
        <div>
          <button className="btn btn-dark" onClick={() => router.back()}>
            <i className="fas fa-long-arrow-alt-left" aria-hidden></i> Go Back
          </button>
        </div>

        <section className="shop login section">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 offset-lg-3 col-12">
                <div className="login-form">
                  <h2>Edit User</h2>
                  {/*Form */}
                  <form className="form" onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-6">
                        <div className="form-group">
                          <label htmlFor="name">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            defaultValue={editUser.firstName}
                            disabled
                            className="d-block w-100 p-2"
                            placeholder="Your first name"
                          />
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-group">
                          <label htmlFor="name">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            defaultValue={editUser.lastName}
                            disabled
                            className="d-block w-100 p-2"
                            placeholder="Your last name"
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="form-group">
                          <label>
                            Email<span>*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            defaultValue={editUser.email}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <input
                            type="checkbox"
                            id="isAdmin"
                            checked={checkAdmin}
                            style={{ width: '20px', height: '20px' }}
                            onChange={handleCheck}
                          />

                          <label
                            htmlFor="isAdmin"
                            style={{ transform: 'translate(4px, -3px)' }}
                          >
                            isAdmin
                          </label>
                          <div
                            className="form-group login-btn"
                            style={{ float: 'right' }}
                          >
                            <button className="btn" type="submit">
                              Update
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                  {/*  End Form */}
                </div>
              </div>
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

export default EditUser
