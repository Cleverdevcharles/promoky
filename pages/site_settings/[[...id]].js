import Head from 'next/head'
import Link from 'next/link'
import {useState, useContext, useEffect} from 'react'
import {DataContext} from '../../store/GlobalState'
import {imageUpload} from '../../utils/imageUpload'
import {postData, getData, putData} from '../../utils/fetchData'
import {useRouter} from 'next/router'
import Input from "react-phone-number-input/input";
import { toast } from 'react-toastify';
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import SiteName from '../../components/SiteName'

const SitesManager = (props) => {
    const initialState = {
        title: '', 
        about: '', 
        email: '', 
        facebook: '', 
        whatsapp: '', 
        twitter: '', 
        instagram: '', 
        terms_conditions: '', 
        privacy_policy: '' 
    }
    const [site, setSite] = useState(initialState)
    const [sites, setSites] = useState(props.sites)
	const [page, setPage] = useState(1)
    const [phone, setPhone] = useState('')
    const {
        title, 
        about, 
        email, 
        facebook, 
        whatsapp, 
        twitter, 
        instagram, 
        terms_conditions, 
        privacy_policy 
    } = site

    const [images, setImages] = useState([])

    const {state, dispatch} = useContext(DataContext)
    const {auth} = state

    const router = useRouter()
    const {id} = router.query
    const [onEdit, setOnEdit] = useState(false)

    useEffect(() => {       
        if(id){
            setOnEdit(true)
            getData(`site/${id}`).then(res => {
                setSite(res.site)
                setImages(res.site.images)
            })
        }else{
            setOnEdit(false)
            setSite(initialState)
            setImages([])
        }
    },[id])

    const handleChangeInput = e => {
        const {name, value} = e.target
        setSite({...site, [name]:value})
        dispatch({type: 'NOTIFY', payload: {}})
    }

    const handleUploadInput = e => {
        dispatch({type: 'NOTIFY', payload: {}})
        let newImages = []
        let num = 0
        let err = ''
        const files = [...e.target.files]

        if(files.length === 0) 
        return dispatch({type: 'NOTIFY', payload: {error: 'Files does not exist.'}})

        files.forEach(file => {
            if(file.size > 1024 * 1024)
            return err = 'The largest image size is 1mb'

            if(file.type !== 'image/jpeg' && file.type !== 'image/png')
            return err = 'Image format is incorrect.'

            num += 1;
            if(num <= 5) newImages.push(file)
            return newImages;
        })

        if(err) dispatch({type: 'NOTIFY', payload: {error: err}})

        const imgCount = images.length
        if(imgCount + newImages.length > 5)
        return dispatch({type: 'NOTIFY', payload: {error: 'Select up to 5 images.'}})
        setImages([...images, ...newImages])
    }

    const deleteImage = index => {
        const newArr = [...images]
        newArr.splice(index, 1)
        setImages(newArr)
    }

    

    const handleSubmit = async(e) => {
        e.preventDefault()
        if(auth.user.role !== 'admin') 
        return dispatch({type: 'NOTIFY', payload: {error: 'Authentication is not valid.'}})

        if(!title && !about && !phone && !email && !terms_conditions && privacy_policy  && images.length === 0)
        return toast.error('Please fill out all fileds')

        if(!title)
        return toast.error('Site name is required')
        if(!about)
        return toast.error('About site is required')
        if(!phone)
        return toast.error('Site phone contact is required')
        if(!email)
        return toast.error('Site email is required')
        if(!terms_conditions)
        return toast.error('Site terms and conditions is required')
        if(!privacy_policy)
        return toast.error('Site privacy policy is required')
        if(images.length === 0)
        return toast.error('Please upload a logo for your site')

    
        dispatch({type: 'NOTIFY', payload: {loading: true}})
        let media = []
        const imgNewURL = images.filter(img => !img.url)
        const imgOldURL = images.filter(img => img.url)

        if(imgNewURL.length > 0) media = await imageUpload(imgNewURL)

        let res;
        if(onEdit){
            res = await putData(`site/${id}`, {...site, phone, images: [...imgOldURL, ...media]}, auth.token)
            if(res.err) return dispatch({type: 'NOTIFY', payload: {error: res.err}})
        }else{
            res = await postData('site', {...site, phone, images: [...imgOldURL, ...media]}, auth.token)
            if(res.err) return dispatch({type: 'NOTIFY', payload: {error: res.err}})
        }

        router.push('/');
        return dispatch({type: 'NOTIFY', payload: {success: res.msg}})
        
    }

    useEffect(() => {
		if(Object.keys(router.query).length === 0) setPage(1)
	},[router.query])

    useEffect(() => {
        if(!auth.user) {
            router.push('/');
            return
        }
    }, [auth.user])
    if(!auth.user) return null

   
    return(
        <>
        <head>
          <title>
		  {
			sites.map(site => (
			<SiteName key={site._id}  site={site} />
			))
		} | Sites Manager</title>
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
								<li className="active"><Link href="/create">Site Manager</Link></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
        <div className="sites_manager container">
            <form className="row" onSubmit={handleSubmit}>
                <div className="col-md-6">
                    
                    <input type="text" name="title" value={title}
                    placeholder="Site's Name ..." className="d-block my-4 w-100 p-2"
                    onChange={handleChangeInput} />

                    <div className="row">
                        <div className="col-sm-6">
                            <label htmlFor="facebook">Facebook URL (Optional)</label>
                            <input type="text" name="facebook" value={facebook}
                            placeholder="Facebook URL" className="d-block w-100 p-2"
                            onChange={handleChangeInput} 
                            />
                        </div>
                        <div className="col-sm-6">
                            <label htmlFor="whatsapp">WhatsApp URL (Optional)</label>
                            <input type="text" name="whatsapp" value={whatsapp}
                            placeholder="WhatsApp URL" className="d-block w-100 p-2"
                            onChange={handleChangeInput} 
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-6">
                            <label htmlFor="instagram">Instagram URL (Optional)</label>
                            <input type="text" name="instagram" value={instagram}
                            placeholder="Instagram URL" className="d-block w-100 p-2"
                            onChange={handleChangeInput} 
                            />
                        </div>
                        <div className="col-sm-6">
                            <label htmlFor="twitter">Twitter URL (Optional)</label>
                            <input type="text" name="twitter" value={twitter}
                            placeholder="Twitter URL" className="d-block w-100 p-2"
                            onChange={handleChangeInput} 
                            />
                        </div>
                    </div>
          
                    <textarea name="about" id="about" cols="30" rows="4"
                    placeholder="About" onChange={handleChangeInput}
                    className="d-block my-4 w-100 p-2" value={about} />

                    <textarea name="terms_conditions" id="terms_conditions" cols="30" rows="6"
                    placeholder="Terms and Conditions" onChange={handleChangeInput}
                    className="d-block my-4 w-100 p-2" value={terms_conditions} />
                    
                    <textarea name="privacy_policy" id="privacy_policy" cols="30" rows="6"
                    placeholder="Privacy Policy" onChange={handleChangeInput}
                    className="d-block my-4 w-100 p-2" value={privacy_policy} />


                    <button type="submit" className="btn btn-info my-2 px-4 w-100">
                        {onEdit ? 'Update': 'Create'}
                    </button>

                </div>

                <div className="col-md-6 my-4">
                    <div className="input-group mb-4">
                        <div className="input-group-prepend">
                            <span className="input-group-text">Upload</span>
                        </div>
                        <div className="custom-file border rounded">
                            <input type="file" className="custom-file-input" placeholder='Upload site image ...'
                            onChange={handleUploadInput} multiple accept="image/*" />
                        </div>

                    </div>  

                    <div className='row'>
                        <div className='col-6'>
                            <label htmlFor="phone" className='mt-1'>Phone Contact</label>
                            <Input name="phone" value={phone}
                            placeholder="Phone Contact" className="d-block w-100 p-2 mb-4"
                            onChange={setPhone}
                            />
                        </div>
                        <div className='col-6'>
                            <label htmlFor="email" className='mt-1'>Email Address</label>
                            <input type="email" name="email" value={email}
                            placeholder="Email Address" className="d-block w-100 p-2 mb-4"
                            onChange={handleChangeInput} />
                        </div>
                    </div>

                    <div className="row img-up mx-0">
                        {
                            images.map((img, index) => (
                                <div key={index} className="file_img my-1">
                                    <img src={img.url ? img.url : URL.createObjectURL(img)}
                                     alt="" className="img-thumbnail rounded" />

                                     <span onClick={() => deleteImage(index)}>X</span>
                                </div>
                            ))
                        }
                    </div>
                        

                </div>

               
            </form>

            
        </div>
        {
			sites.map(site => (
			<Footer key={site._id}  site={site} />
			))
		}
        </>
    )
}

export async function getServerSideProps({query }) {
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

export default SitesManager