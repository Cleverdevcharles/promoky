import React from 'react'
import Footer from './Footer'
import Notify from './Notify'
import Modal from './Modal'
import NavBar from '../pages/NavBar'

function Layout({children}) {
    return (
        <div>
            {/* <NavBar/> */}
            <Notify />
            <Modal />
            {children}
            {/* <Footer /> */}
        </div>
    )
}

export default Layout
