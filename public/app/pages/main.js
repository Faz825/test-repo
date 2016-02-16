import React from 'react'
import SignupHeader from '../components/header/SignupHeader'
import SigninHeader from '../components/header/SigninHeader'
import SignupIndex from '../pages/signup/Index';
import SidebarNav from '../components/sidebarNav/SidebarNav';

import Session  from '../middleware/Session';


class Main extends React.Component {

	constructor(props) {
		super(props);

	}
    layoutSelector() {

        if (Session.isSessionSet('prg_lg')) {
            return (
                <div className="row row-clr pg-full-wrapper">
                    <SigninHeader />
										<SidebarNav side="left" menuItems={{items:[
												{"name": "News", "link" : "/news", "imgName": "nav-ico-1"},
												{"name": "Notes", "link" : "/note", "imgName": "nav-ico-2"},
												{"name": "Desktop", "link" : "/desktop", "imgName": "nav-ico-3"},
												{"name": "Smart Mail", "link" : "/email", "imgName": "nav-ico-4"},
												{"name": "Pro Calendar", "link" : "/calender-weeks", "imgName": "nav-ico-5"}
											]
										}}/>

										<SidebarNav side="right"menuItems={{items:[
												{"name": "Connections", "link" : "/connections", "imgName": "nav-ico-6"},
												{"name": "Chats/Video", "link" : "/chat-screen", "imgName": "nav-ico-7"},
												{"name": "interests", "link" : "/interests", "imgName": "nav-ico-8"},
												{"name": "Recruiting", "link" : "/find-job", "imgName": "nav-ico-9"},
												{"name": "Pro Networks", "link" : "/professional-networks", "imgName": "nav-ico-10"}
											]
										}}/>

                    {this.props.children || <SignupIndex />}
                </div>


            )

        }else{
            return (
                <div>
                    <SignupHeader />
                    {this.props.children || <SignupIndex />}
                </div>
            )
        }
    }

    render() {
        return this.layoutSelector();

    }
}

module.exports = Main
