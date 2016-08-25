import React from 'react'
import SignupIndex from '../signup/Index';
import SigninHeader from '../../components/header/SigninHeader'
import SidebarNav from '../../components/sidebarNav/SidebarNav'
import FooterHolder from '../../components/footer/FooterHolder'
import Session  from '../../middleware/Session';
import Dashboard  from '../dashboard/Dashboard';
import InCallPane  from '../chat/InCallPane';
const DefaultLayout = (props) =>{

  return(
      <div className="row row-clr pg-full-wrapper">
            <SigninHeader />
            <SidebarNav side="left" menuItems={{items:[
                {"name": "Notes", "link" : "/notes", "imgName": "nav-ico-2"},
                {"name": "Folders", "link" : "/folders", "imgName": "folder-icon"},
                {"name": "Doc", "link" : "/doc", "imgName": "document-icon"},
                {"name": "Pro Calendar", "link" : "/calender-weeks", "imgName": "nav-ico-5"}
              ]
            }}/>

            <SidebarNav side="right" menuItems={{items:[
                {"name": "News", "link" : "/news", "imgName": "nav-ico-1"},
                {"name": "interests", "link" : "/interests", "imgName": "nav-ico-8"},
                {"name": "Groups", "link" : "/professional-networks", "imgName": "nav-ico-10"},
                {"name": "Call Center", "link" : "/chat", "imgName": "call-center-icon"}
              ]
            }}/>
            <div className="row row-clr pg-middle-sign-wrapper">
              <div className="container-fluid pg-custom-container">
                    {props.children || <Dashboard />}
              </div>
            </div>
            <FooterHolder />
            <InCallPane />
      </div>
  );
}

export default DefaultLayout;
