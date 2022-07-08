import Link from 'next/link'
import { useContext } from 'react'
import { DataContext } from '../../store/GlobalState'

const SiteDetail = ({site}) => {
    const { state, dispatch } = useContext(DataContext)
    const { auth } = state


    const adminLink = () => {
        return(
            <div className='right p-3' style={{float: "right"}}>
                <Link href={`create/${site._id}`}>
                    <a className="btn btn-info text-white"
                    style={{marginRight: '5px', flex: 1}}>Edit</a>
                </Link>
                <button className="btn btn-danger"
                style={{marginLeft: '5px', flex: 1}}
                data-toggle="modal" data-target="#exampleModal"
                onClick={() => dispatch({
                    type: 'ADD_MODAL',
                    payload: [{ 
                        data: '', id: site._id, 
                        title: site.title, type: 'DELETE_SITE' 
                    }]
                })} >
                    Delete
                </button>
            </div>
        )
    }

    return(
        <>
            <div className="col-lg-4 col-md-6 mt-5 p-3 col-12">
                <div className="single-product">
                    <div className="product-img">
                        <>
                            <a>
                            <img className="default-img" style={{width: "100%", height: "300px"}} src={site.images[0].url} alt="#" />
                            <img className="hover-img" style={{width: "100%", height: "300px"}} src={site.images[0].url} alt="#" />
                            </a>
                        </>
                        <div className="button-head">
                            <div className="product-action pr-3">
                                <Link href={`site/${site._id}`}>
                                <a>
                                    <i className=" ti-eye"></i><span>Quick View</span>
                                </a>
                                </Link>
                            </div>
                           
                        </div>
                    </div>
                    <div className="product-content pl-3">
                        <h3 className='text-capitalize'><Link href={`site/${site._id}`}>{site.title}</Link></h3>
                    </div>
                    {!auth.user || auth.user.role !== "admin" ? null : adminLink()}
                </div>
            </div>
        </>
    )
}


export default SiteDetail