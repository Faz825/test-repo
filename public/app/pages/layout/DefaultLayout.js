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
                {"name": "News", "link" : "/news", "imgName": "nav-ico-1"},
                {"name": "Notes", "link" : "/notes", "imgName": "nav-ico-2"},
                {"name": "Desktop", "link" : "/desktop", "imgName": "nav-ico-3"},
                {"name": "Smart Mail", "link" : "/email", "imgName": "nav-ico-4"},
                {"name": "Pro Calendar", "link" : "/calender-weeks", "imgName": "nav-ico-5"}
              ]
            }}/>

            <SidebarNav side="right" menuItems={{items:[
                {"name": "Connections", "link" : "/connections", "imgName": "nav-ico-6"},
                {"name": "Chats/Video", "link" : "/chat", "imgName": "nav-ico-7"},
                {"name": "interests", "link" : "/interests", "imgName": "nav-ico-8"},
                {"name": "Recruiting", "link" : "/find-job", "imgName": "nav-ico-9"},
                {"name": "Pro Networks", "link" : "/professional-networks", "imgName": "nav-ico-10"}
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
