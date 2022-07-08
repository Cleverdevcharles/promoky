import { useState,  useEffect } from 'react'
import emailjs from "emailjs-com";
import { toast } from "react-toastify";
import { getData } from '../utils/fetchData'
import {useRouter} from 'next/router'
import Link from 'next/link'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import SiteName, { SitePhone, SiteEmail } from '../components/SiteName'

const Contact = (props) => {
  const [sites, setSites] = useState(props.sites)
  const [page, setPage] = useState(1)
  const [send, setSend] = useState("Send Message");
  const router = useRouter()
  
  useEffect(() => {
    if(Object.keys(router.query).length === 0) setPage(1)
  },[router.query])

  const sendMail = (e) => {
    e.preventDefault();
    setSend("Sending...");
    emailjs
        .sendForm(
          "service_i18h2lq",
          "template_6dxivza",
          e.target,
          "user_UdgQW2uxRt0vdGCQzkK9Y"
        )
        .then((res) => {
          console.log(res);
          toast.success(
            "Message sent....we will get back to you as soon as possible."
          );
          setTimeout(() => {
            setSend("Send");
            window.location.reload();
          }, 1000);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Message Failed. Please try again.");
          setTimeout(() => {
            setSend("Send");
            window.location.reload();
          }, 1000);
        });
  };

  return(
    <>
        <head>
            <title>
                {
                    sites.map(site => (
                    <SiteName key={site._id}  site={site} />
                    ))
                } | Contact - Us
            </title>
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
								<li className="active"><Link href="/contact-us">Contact Us</Link></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>

        <>
            <section id="contact-us" class="contact-us section">
                <div class="container">
                        <div class="contact-head">
                            <div class="row">
                                <div class="col-lg-8 col-12">
                                    <div class="form-main">
                                        <div class="title">
                                            <h4>Get in touch</h4>
                                            <h3>Write us a message</h3>
                                        </div>
                                        <form class="form" onSubmit={sendMail}>
                                            <div class="row">
                                                <div class="col-lg-6 col-12">
                                                    <div class="form-group">
                                                        <label>Your Name<span>*</span></label>
                                                        <input name="name" type="text" placeholder="" />
                                                    </div>
                                                </div>
                                                <div class="col-lg-6 col-12">
                                                    <div class="form-group">
                                                        <label>Your Email<span>*</span></label>
                                                        <input name="user_email" type="email" placeholder="" />
                                                    </div>	
                                                </div>
                                                <div class="col-12">
                                                    <div class="form-group message">
                                                        <label>Your message<span>*</span></label>
                                                        <textarea name="message" placeholder=""></textarea>
                                                    </div>
                                                </div>
                                                <div class="col-12">
                                                    <div class="form-group button">
                                                        <button
                                                        className="btn w-100"
                                                        type="submit"
                                                        >{send}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                <div class="col-lg-4 col-12">
                                    <div class="single-head" style={{height: "350px"}}>
                                        <div class="single-info">
                                            <i class="fa fa-phone"></i>
                                            <h4 class="title">Call us Now:</h4>
                                            <ul>
                                            {
                                                sites.map(site => (
                                                <li>
                                                +<SitePhone key={site._id}  site={site} />
                                                </li>
                                                ))
                                            }

                                                
                                            </ul>
                                        </div>
                                        <div class="single-info">
                                            <i class="fa fa-envelope-open"></i>
                                            <h4 class="title">Email:</h4>
                                            <ul>
                                            {
                                                sites.map(site => (
                                                <li>
                                                <SiteEmail key={site._id}  site={site} />
                                                </li>
                                                ))
                                            }
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </section>
        </>
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
export default Contact