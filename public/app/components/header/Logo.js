/**
 * Logo Component
 */
import React from 'react'


const Logo =(props)=>{
    return (

        <div className="col-xs-3 pgs-main-logo-area">
            <img src={props.url} alt="Logo" />
        </div>
    )
}
export default Logo;