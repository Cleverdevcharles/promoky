import Link from 'next/link'
import { useState, useContext, useEffect } from 'react'
import valid from '../utils/valid'
import { DataContext } from '../store/GlobalState'
import { postData, getData } from '../utils/fetchData'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import SiteName from '../components/SiteName'
import { RegionDropdown, CountryDropdown } from 'react-country-region-selector'
import Input from 'react-phone-number-input/input'

const Register = (props) => {
  const initialState = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    cf_password: '',
  }
  const [userData, setUserData] = useState(initialState)
  const [sites, setSites] = useState(props.sites)
  const [page, setPage] = useState(1)
  const [terms_conditions, setTerms_conditions] = useState(false)
  const [passwordShown, setPasswordShown] = useState(false)
  const [confirmpasswordShown, setConfirmPasswordShown] = useState(false)
  const [phoneNo, setPhoneNo] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const router = useRouter()
  const { firstName, lastName, email, password, cf_password } = userData

  const { state, dispatch } = useContext(DataContext)
  const { auth } = state

  const toggleRegisterVisiblity = () => {
    setTerms_conditions(terms_conditions ? false : true)
  }

  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true)
  }

  const toggleConfirmPasswordVisiblity = () => {
    setConfirmPasswordShown(confirmpasswordShown ? false : true)
  }

  const handleChangeInput = (e) => {
    const { name, value } = e.target
    setUserData({ ...userData, [name]: value })
    dispatch({ type: 'NOTIFY', payload: {} })
  }

  useEffect(() => {
    setSites(props.sites)
    console.log(sites[0])
  }, [props.sites])

  const handleSubmit = async (e) => {
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
    if (!email) {
      toast.error('A valid email is required.')
      return
    }
    if (!phoneNo) {
      toast.error('A valid phone number is required.')
      return
    }
    if (!country) {
      toast.error('Your country required.')
      return
    }
    if (!region) {
      toast.error('A state/region is required.')
      return
    }
    if (!password) {
      toast.error('Please create your password.')
      return
    }
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
    var fullName = firstName.trim() + ' ' + lastName.trim()

    const errMsg = valid({ name: fullName }, email, password, cf_password)
    if (errMsg) return dispatch({ type: 'NOTIFY', payload: { error: errMsg } })

    dispatch({ type: 'NOTIFY', payload: { loading: true } })

    const res = await postData('auth/register', {
      name: fullName,
      firstName,
      lastName,
      email,
      phoneNo,
      country,
      region,
      password,
      cf_password,
    })

    if (res.err) {
      return dispatch({ type: 'NOTIFY', payload: { error: res.err } })
    }

    return dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
  }

  useEffect(() => {
    if (Object.keys(auth).length !== 0) router.push('/')
  }, [auth])

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
  }, [router.query])

  return (
    <div>
      <head>
        <title>
          {sites.map((site) => (
            <SiteName key={site._id} site={site} />
          ))}{' '}
          | Register
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
                    <Link href="/register">Register</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="shop login section">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-3 col-12">
              <div className="login-form">
                <h2>Register</h2>
                <p>Please register in order to checkout more quickly</p>
                {/* Form */}
                <form className="form" onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-6">
                      <div className="form-group">
                        <label>
                          Your First Name<span>*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={firstName}
                          onChange={handleChangeInput}
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-group">
                        <label>
                          Your Last Name<span>*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={lastName}
                          onChange={handleChangeInput}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <label>
                          Your Email<span>*</span>
                        </label>
                        <input
                          type="text"
                          name="email"
                          value={email}
                          onChange={handleChangeInput}
                        />
                        <small id="emailHelp" className="form-text text-muted">
                          We'll never share your email with anyone else.
                        </small>
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
                        value={phoneNo}
                        className="d-block w-100 p-2"
                        onChange={setPhoneNo}
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <label>
                          Your Password<span>*</span>
                        </label>
                        <input
                          type={passwordShown ? 'text' : 'password'}
                          className="pr-5"
                          name="password"
                          value={password}
                          onChange={handleChangeInput}
                        />
                        <span className="form__symbol">
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
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <label>
                          Confirm Password<span>*</span>
                        </label>
                        <input
                          type={confirmpasswordShown ? 'text' : 'password'}
                          name="cf_password"
                          value={cf_password}
                          onChange={handleChangeInput}
                          className="pr-5"
                        />
                        <span className="form__symbol">
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
                    </div>
                    <div className="col-12">
                      <p>
                        <input
                          type="checkbox"
                          onClick={toggleRegisterVisiblity}
                          value="None"
                          id="slideThree"
                          name="check"
                        />{' '}
                        <small>
                          By registering you agree to our Conditions of Use &
                          Sale. Please see our Privacy Notice, our Cookies
                          Notice and our Interest-Based Ads Notice.{' '}
                          <a href="/terms-conditions" target="_blank">
                            <a style={{ color: 'crimson' }}>
                              Terms & Conditions
                            </a>
                          </a>
                        </small>
                      </p>
                    </div>
                    <div className="col-12">
                      <div
                        className="form-group login-btn"
                        style={{ justifyContent: 'space-between' }}
                      >
                        {terms_conditions ? (
                          <button type="submit" className="btn w-100">
                            <b>Register</b>
                          </button>
                        ) : (
                          <button type="submit" disabled className="btn w-100">
                            <b>Kindly agree to our Conditions of Use & Sale.</b>
                          </button>
                        )}
                        <a style={{ float: 'right' }}>
                          Have an account ?{' '}
                          <Link href="/signin" className="btn">
                            <a style={{ color: 'crimson' }}>Login Now</a>
                          </Link>
                        </a>
                      </div>
                    </div>
                  </div>
                </form>
                {/* End Form */}
              </div>
            </div>
          </div>
        </div>
      </section>
      {sites.map((site) => (
        <Footer key={site._id} site={site} />
      ))}
    </div>
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

export default Register
