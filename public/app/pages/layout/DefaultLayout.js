import React from 'react'
import SignupIndex from '../signup/Index';
import SigninHeader from '../../components/header/SigninHeader'
import SidebarNav from '../../components/sidebarNav/SidebarNav'
import FooterHolder from '../../components/footer/FooterHolder'
import Session  from '../../middleware/Session';
import Dashboard  from '../dashboard/Dashboard';
import InCallPane  from '../chat/InCallPane';
import QuickChatHandler from '../chat/QuickChatHandler'

export default class DefaultLayout extends React.Component{
    constructor(props){
        super(props);

        //bit6 will work on https
        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }
        if (window.location.protocol == 'http:' ) {
            var url_arr = window.location.href.split('http');
            window.location.href = 'https'+url_arr[1];
        }


        this.state={
            chatBubble:[]
        }

        this.quickChatUsers = [];

    }

    loadQuickChat(conv){

        if(typeof this.quickChatUsers.length != 'undefined' && this.quickChatUsers.length >= 3) {
            alert("Maximum quick chat window limit is reached.");
            return;
        }

        var chatExists = false;
        if(this.quickChatUsers.length > 0) {
            for(let con in this.quickChatUsers){
                if(this.quickChatUsers[con].title == conv.title){
                    chatExists = true;
                }
            }
        }

        if(!chatExists) {
            this.quickChatUsers.push(conv);
            this.setState({chatBubble:this.quickChatUsers});
        }
    }

    closeChatBubble(title) {

        let bbList = this.state.chatBubble;
        if (typeof bbList != 'undefined' && bbList.length > 0) {
            let index = this.getBubbleIndex(title);
            if(index > -1) {
                bbList.splice(index, 1);
            }
            this.quickChatUsers = [];
            this.quickChatUsers = bbList;
            this.setState({chatBubble:this.quickChatUsers});
        }
    }

    getBubbleIndex(title) {
        let bbList = this.state.chatBubble;
        for (let my_con in bbList) {
            if (title == bbList[my_con].title) {
                return my_con;
            }
        }
        return -1
    }

    render(){



        return(
            <div className="row row-clr pg-full-wrapper">
                <SigninHeader quickChat={this.loadQuickChat.bind(this)} />
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
                        {this.props.children || <Dashboard />}
                    </div>
                </div>
                <FooterHolder />
                <InCallPane />
                <QuickChatHandler chatList={this.state.chatBubble} bubClose={this.closeChatBubble.bind(this)}/>
            </div>
        );
    }
}

