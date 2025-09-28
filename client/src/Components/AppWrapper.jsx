import React from 'react'

const AppWrapper = ({ children }) => {
    return (
        <div className='md:max-w-screen-lg sm:max-w-sm mx-auto'>{children}</div>
    )
}

export default AppWrapper