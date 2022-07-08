import Link from 'next/link'
import {useContext, useState, useEffect} from 'react'
import {DataContext} from '../store/GlobalState'
import {updateItem} from '../store/Actions'
import { postData, putData, getData } from "../utils/fetchData";
import { useRouter } from 'next/router'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import SiteName from '../components/SiteName'

const Categories = (props) => {
    const [name, setName] = useState('')
    const [sites, setSites] = useState(props.sites)
    const [page, setPage] = useState(1)
    const router = useRouter();

    const {state, dispatch} = useContext(DataContext)
    const {categories, auth} = state
    
    const [id, setId] = useState('')

    const createCategory = async () => {
        if(auth.user.role !== 'admin')
        return dispatch({type: 'NOTIFY', payload: {error: 'Authentication is not vaild.'}})

        if(!name) return dispatch({type: 'NOTIFY', payload: {error: 'Name can not be left blank.'}})

        dispatch({type: 'NOTIFY', payload: {loading: true}})

        let res;
        if(id){
            res = await putData(`categories/${id}`, {name}, auth.token)
            if(res.err) return dispatch({type: 'NOTIFY', payload: {error: res.err}})
            dispatch(updateItem(categories, id, res.category, 'ADD_CATEGORIES'))

        }else{
            res = await postData('categories', {name}, auth.token)
            if(res.err) return dispatch({type: 'NOTIFY', payload: {error: res.err}})
            dispatch({type: "ADD_CATEGORIES", payload: [...categories, res.newCategory]})
        }
        setName('')
        setId('')
        return dispatch({type: 'NOTIFY', payload: {success: res.msg}})
    }

    const handleEditCategory = (catogory) => {
        setId(catogory._id)
        setName(catogory.name)
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
		} | Categories</title>
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
								<li className="active"><Link href="/categories">Categories</Link></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
        <div className="col-md-6 mx-auto my-3 container">

            <div className="input-group mb-3">
                <input type="text" className="d-block w-75 p-2"
                placeholder="Add a new category" value={name}
                onChange={e => setName(e.target.value)} />

                <button className="btn btn-secondary ml-1"
                onClick={createCategory}>
                    {id ? "Update": "Create"}
                </button>
            </div>

            {
                categories.map(catogory => (
                    <div key={catogory._id} className="card w-75 my-2 text-capitalize">
                        <div className="card-body d-flex justify-content-between">
                            {catogory.name}

                            <div style={{cursor: 'pointer'}}>
                                <i className="fas fa-edit mr-2 text-info"
                                onClick={() => handleEditCategory(catogory)}></i>

                                <i className="fas fa-trash-alt text-danger"
                                data-toggle="modal" data-target="#exampleModal"
                                onClick={() => dispatch({
                                    type: 'ADD_MODAL',
                                    payload: [{ 
                                        data: categories, id: catogory._id, 
                                        title: catogory.name, type: 'ADD_CATEGORIES' 
                                    }]
                                })} ></i>
                            </div>

                        </div>
                    </div>
                ))
            }
        </div>
        {
			sites.map(site => (
			<Footer key={site._id}  site={site} />
			))
		}
        </>
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

export default Categories