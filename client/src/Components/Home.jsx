import React from 'react'
import Nav from './Nav'
import Footer from './Footer'
import Faq from './Faq'
import InputBox from './InputBox'
import Features from './Features'

const Home = () => {
    return (
        <div>
            <Nav />
            <InputBox />
            <Features />
            <Faq />
            <Footer /> 
        </div>
    )
}

export default Home