/**
 * About Inner content section
 */
import React from 'react'

const AboutInner =(pros)=>{

    return (
        <div className="row row-clr pgs-middle-sign-wrapper-about-inner">
            <h1>Hello {pros.secretary_name},</h1>
            <h2>THANK YOU FOR CHOOSING ME</h2>
            <h5>I, {pros.secretary_name}, will now be your very own personal assistant and will be makingyour life easier.<br />We are bonded for life now. Yay!</h5>
        </div>

    )
}

export default  AboutInner;