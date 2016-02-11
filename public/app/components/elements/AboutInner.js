/**
 * About Inner content section
 */
import React from 'react'
import Session  from '../../middleware/Session';

const AboutInner =(pros)=>{
	let session = Session.getSession('prg_lg');

    return (
        <div className="row row-clr pgs-middle-sign-wrapper-about-inner">
            <h1>Hello {session.first_name},</h1>
            <h2>THANK YOU FOR CHOOSING ME</h2>
            <h5>I, {session.secretary_name}, will now be your very own personal assistant and will be making your life easier.<br />We are bonded for life now. Yay!</h5>
        </div>

    )
}

export default  AboutInner;