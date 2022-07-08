import { useState, useContext, useEffect } from 'react'
import { DataContext } from '../store/GlobalState'
import Link from 'next/link'
import { useRouter } from 'next/router'
import valid from '../utils/valid'
import { patchData, getData } from '../utils/fetchData'
import { toast } from 'react-toastify'
import { imageUpload } from '../utils/imageUpload'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import SiteName from '../components/SiteName'
import { RegionDropdown, CountryDropdown } from 'react-country-region-selector'
import Input from 'react-phone-number-input/input'

const Profile = (props) => {
  const initialSate = {
    avatar: '',
    firstName: '',
    lastName: '',
    password: '',
    cf_password: '',
  }
  const [sites, setSites] = useState(props.sites)
  const [page, setPage] = useState(1)
  const [data, setData] = useState(initialSate)
  const [passwordShown, setPasswordShown] = useState(false)
  const [confirmpasswordShown, setConfirmPasswordShown] = useState(false)
  const [phoneNo, setPhoneNo] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const { avatar, firstName, lastName, password, cf_password } = data
  const router = useRouter()

  const { state, dispatch } = useContext(DataContext)
  const { users, auth, notify, orders } = state

  useEffect(() => {
    if (auth.user) console.log(auth.user)
    setData({
      ...data,
      firstName: auth.user.firstName,
      lastName: auth.user.lastName,
      phoneNo: auth.user.phoneNo,
      country: auth.user.country,
      region: auth.user.region,
    })
  }, [auth.user])

  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true)
  }

  const toggleConfirmPasswordVisiblity = () => {
    setConfirmPasswordShown(confirmpasswordShown ? false : true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setData({ ...data, [name]: value })
    dispatch({ type: 'NOTIFY', payload: {} })
  }

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
  }, [router.query])

  const handleUpdateProfile = (e) => {
    e.preventDefault()
    const strongRegexSpecialCharacter = /^(.*\W).*$/
    if (!firstName) {
      toast.error('First name is required.')
      return
    }
    if (strongRegexSpecialCharacter.test(firstName)) {
      toast.error("First name can't contain any special character.")
      return
    }
    if (!lastName) {
      toast.error('Last name is required.')
      return
    }
    if (strongRegexSpecialCharacter.test(lastName)) {
      toast.error("Last name can't contain any special character.")
      return
    }

    if (!country) {
      toast.error('Your country is required.')
      return
    }
    if (!region) {
      toast.error('Your country is required.')
      return
    }

    if (password) {
      if (password.length < 8) {
        toast.error('Password must be at least 8 characters long.')
        return
      }
      if (password.length > 32) {
        toast.error('Password must be between 8 to 32 characters long only.')

        return
      }
      const strongRegexHighercase = new RegExp('^(?=.*[A-Z])')
      if (!strongRegexHighercase.test(password)) {
        toast.error('Password must contain at least an uppercase.')

        return
      }
      const strongRegexLowercase = new RegExp('^(?=.*[a-z])')
      if (!strongRegexLowercase.test(password)) {
        toast.error('Password must contain at least a lowercase.')

        return
      }
      const strongRegexNumber = new RegExp('^(?=.*[0-9])')
      if (!strongRegexNumber.test(password)) {
        toast.error('Password must contain at least one number.')

        return
      }
      if (!strongRegexSpecialCharacter.test(password)) {
        toast.error('Password must contain at least one special character.')

        return
      }
      if (!cf_password) {
        toast.error('Please confirm your password.')

        return
      }
      if (cf_password !== password) {
        toast.error('Password do not match.')

        return
      }
    
      updatePassword()
    }

    if (
      firstName !== auth.user.firstName ||
      lastName !== auth.user.lastName ||
      phoneNo !== auth.user.phoneNo ||
      country !== auth.user.country ||
      region !== auth.user.region ||
      avatar
    )
      updateInfor()
  }

  const updatePassword = () => {
    dispatch({ type: 'NOTIFY', payload: { loading: true } })
    patchData('user/resetPassword', { password }, auth.token).then((res) => {
      if (res.err)
        return dispatch({ type: 'NOTIFY', payload: { error: res.err } })
      return dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
    })
  }

  const changeAvatar = (e) => {
    const file = e.target.files[0]
    if (!file)
      return dispatch({
        type: 'NOTIFY',
        payload: { error: 'File does not exist.' },
      })

    if (file.size > 1024 * 1024)
      //1mb
      return dispatch({
        type: 'NOTIFY',
        payload: { error: 'The largest image size is 1mb.' },
      })

    if (file.type !== 'image/jpeg' && file.type !== 'image/png')
      //1mb
      return dispatch({
        type: 'NOTIFY',
        payload: { error: 'Image format is incorrect.' },
      })

    setData({ ...data, avatar: file })
  }

  const updateInfor = async () => {
    let media
    dispatch({ type: 'NOTIFY', payload: { loading: true } })

    if (avatar) media = await imageUpload([avatar])

    patchData(
      'user',
      {
        firstName,
        lastName,
        phoneNo,
        country,
        region,
        avatar: avatar ? media[0].url : auth.user.avatar,
      },
      auth.token,
    ).then((res) => {
      if (res.err) {
        console.log(res)
        return dispatch({ type: 'NOTIFY', payload: { error: res.err } })
      }

      dispatch({
        type: 'AUTH',
        payload: {
          token: auth.token,
          user: res.user,
        },
      })
      return dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
    })
  }

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
                    <Link href="/profile">Profile</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="profile_page container">
        <section className="row text-secondary my-3">
          <div className="col-md-4">
            <h3 className="text-center text-uppercase">
              {auth.user.role !== 'admin' ? 'User Profile' : 'Admin Profile'}
            </h3>

            <div className="avatar">
              <img
                src={avatar ? URL.createObjectURL(avatar) : auth.user.avatar}
                alt="avatar"
              />
              <span>
                <i className="fas fa-camera"></i>
                <p>Change</p>
                <input
                  type="file"
                  name="file"
                  id="file_up"
                  accept="image/*"
                  onChange={changeAvatar}
                />
              </span>
            </div>

            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="name">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={firstName}
                    className="d-block w-100 p-2"
                    placeholder="Your first name"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="name">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={lastName}
                    className="d-block w-100 p-2"
                    placeholder="Your last name"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label>
                    Your Country<span>*</span>
                  </label>
                  <CountryDropdown
                    value={country}
                    style={{ color: 'grey' }}
                    className="form-control"
                    onChange={setCountry}
                    name="country"
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label>
                    Your Region or State<span>*</span>
                  </label>
                  <RegionDropdown
                    disableWhenEmpty={true}
                    country={country}
                    style={{ color: 'grey' }}
                    className="form-control"
                    value={region}
                    onChange={setRegion}
                    name="region"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Phone Number</label>
              <Input
                placeholder="Phone Number"
                value={`+${auth.user.phoneNo}`}
                className="d-block w-100 p-2"
                onChange={setPhoneNo}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="text"
                name="email"
                defaultValue={auth.user.email}
                className="d-block w-100 p-2"
                disabled={true}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type={passwordShown ? 'text' : 'password'}
                name="password"
                value={password}
                className="d-block w-100 p-2 pr-5"
                placeholder="Your new password"
                onChange={handleChange}
              />
              <span className="profile_form__symbol">
                {passwordShown ? (
                  <i
                    className="fas fa-eye-slash"
                    onClick={togglePasswordVisiblity}
                  ></i>
                ) : (
                  <i
                    className="fas fa-eye"
                    onClick={togglePasswordVisiblity}
                  ></i>
                )}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="cf_password">Confirm New Password</label>
              <input
                type={confirmpasswordShown ? 'text' : 'password'}
                name="cf_password"
                value={cf_password}
                className="d-block w-100 p-2 pr-5"
                placeholder="Confirm new password"
                onChange={handleChange}
              />
              <span className="profile_form__symbol">
                {confirmpasswordShown ? (
                  <i
                    className="fas fa-eye-slash"
                    onClick={toggleConfirmPasswordVisiblity}
                  ></i>
                ) : (
                  <i
                    className="fas fa-eye"
                    onClick={toggleConfirmPasswordVisiblity}
                  ></i>
                )}
              </span>
            </div>

            <button
              className="btn btn-info w-100"
              disabled={notify.loading}
              onClick={handleUpdateProfile}
            >
              Update
            </button>

            <br />
            {auth.user.role === 'admin' ? null : (
              <Link href="/promotion-request">
                <a style={{ color: 'crimson' }}>
                  Request For Business Promotion
                </a>
              </Link>
            )}
          </div>

          <div className="col-md-8 ">
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
                    <td className="p-2">delivered</td>
                    <td className="p-2">paid</td>
                    {auth.user.role === 'admin' && auth.user.root ? (
                      <td className="p-2">delete</td>
                    ) : null}
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="p-2">
                        <Link href={`/order/${order._id}`}>
                          <a>{order._id}</a>
                        </Link>
                      </td>
                      <td className="p-2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-2">${order.total}</td>
                      <td className="p-2">
                        {order.delivered ? (
                          <i className="fas fa-check text-success"></i>
                        ) : (
                          <i className="fas fa-times text-danger"></i>
                        )}
                      </td>
                      <td className="p-2">
                        {order.paid ? (
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
                                    data: orders,
                                    id: order._id,
                                    title: order._id,
                                    type: 'DELETE_ORDER',
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

export default Profile
