import Head from 'next/head'
import Link from 'next/link'
import {useState, useContext, useEffect} from 'react'
import {DataContext} from '../store/GlobalState'
import {postData, getData} from '../utils/fetchData'
import Cookie from 'js-cookie'
import { useRouter } from 'next/router'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import SiteName from '../components/SiteName'

const Signin = (props) => {
  const initialState = { email: '', password: '' }
  const [userData, setUserData] = useState(initialState)
  const { email, password } = userData
  const [sites, setSites] = useState(props.sites)
  const [page, setPage] = useState(1)
  const [passwordShown, setPasswordShown] = useState(false);
  const {state, dispatch} = useContext(DataContext)
  const { auth } = state

  const router = useRouter()

  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true);
  };

  const handleChangeInput = e => {
    const {name, value} = e.target
    setUserData({...userData, [name]:value})
    dispatch({ type: 'NOTIFY', payload: {} })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    dispatch({ type: 'NOTIFY', payload: {loading: true} })
    const res = await postData('auth/login', userData)
    
    if(res.err) return dispatch({ type: 'NOTIFY', payload: {error: res.err} })
    dispatch({ type: 'NOTIFY', payload: {success: res.msg} })

    dispatch({ type: 'AUTH', payload: {
      token: res.access_token,
      user: res.user
    }})

    Cookie.set('refreshtoken', res.refresh_token, {
      path: 'api/auth/accessToken',
      expires: 7
    })

    localStorage.setItem('firstLogin', true)
  }

  useEffect(() => {
    if(Object.keys(auth).length !== 0) router.push("/")
  }, [auth])

  useEffect(() => {
    if(Object.keys(router.query).length === 0) setPage(1)
  },[router.query])

    return(
      <div >
        <head>
          <title>
		  {
			sites.map(site => (
			<SiteName key={site._id}  site={site} />
			))
		} | Login</title>
        </head>
		{
			sites.map(site => (
			<NavBar key={site._id}  site={site} />
			))
		}
        <div className="breadcrumbs">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="bread-inner">
							<ul className="bread-list">
								<li><Link href="/"><a>Home<i className="ti-arrow-right"></i></a></Link></li>
								<li className="active"><Link href="/signin">Login</Link></li>
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
							<h2>Login</h2>
							<p>Please login, in order to checkout more quickly</p>
							{/*Form */}
							<form className="form" onSubmit={handleSubmit}>
								<div className="row">
									<div className="col-12">
										<div className="form-group">
											<label>Your Email<span>*</span></label>
											<input type="email" name="email" value={email} onChange={handleChangeInput} />
                      <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
										</div>
									</div>
									<div className="col-12">
										<div className="form-group">
											<label>Your Password<span>*</span></label>
											<input type={passwordShown ? "text" : "password"}  name="password"  className='pr-5' placeholder="" value={password} onChange={handleChangeInput} />
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
										<div className="form-group login-btn" style={{justifyContent: "space-between"}}>
											<button className="btn w-100" type="submit">Login</button>
											<a style={{ float: "right"}}>Don't have an account ? <Link href="/register" className="btn" ><a style={{color: 'crimson'}}>Register Now</a></Link></a>
										</div>
										{/* <div className="checkbox">
											<label className="checkbox-inline" htmlFor="2">
												<input name="news" id="2" type="checkbox" />Remember me
											</label>
										</div>
										<a style={{color: 'crimson', float: "right", marginTop: '20px'}}><Link href="/" className="lost-pass">Lost your password?</Link></a> */}
									</div>
								</div>
							</form>
							{/*  End Form */}
						</div>
					</div>
				</div>
			</div>
		</section>
		{
			sites.map(site => (
			<Footer key={site._id}  site={site} />
			))
		}
      </div>
    )
  }

  export async function getServerSideProps({query}) {
	const page = query.page || 1
	const search = query.search || 'all'
  
	
	const res = await getData(
	  `site?limit=${page * 1}&title=${search}`
	)
	// server side rendering
	return {
	  props: {
		sites: res.sites,
		result: res.result,
	  }, // will be passed to the page component as props
	}
  }
  
  
  export default Signin