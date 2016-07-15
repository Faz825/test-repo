/**
 * Header is to display menu items for the si
 */
import React from 'react';
import { Link} from 'react-router';
import Logo from './Logo';
import { Scrollbars } from 'react-custom-scrollbars';
import GlobalSearch from './GlobalSearch';
import ProfileImg from './ProfileImg';
import LogoutButton from '../../components/elements/LogoutButton';

export default class Header extends React.Component {

    constructor(props) {
        super(props);
        this.state={
            headerChatUnreadCount:0
        }
    }

    showChatList(){
        $("#chat_notification_wrapper").toggle();
        if($("#chat_notification_wrapper").is(':visible')){
            $("#chat_notification_a").addClass('chat-notification-wrapper-opened');
        } else{
            $("#chat_notification_a").removeClass('chat-notification-wrapper-opened')
        }
    }

    render(){
        return(
                <div className="row row-clr pg-top-navigation">
                  <div className="container-fluid pg-custom-container">
                    <div className="row">
                      <div className="col-xs-2">
                        <a href="/">
                            <Logo url ="/images/logo.png" />
                        </a>
                      </div>
                        <GlobalSearch/>
                      <span className="col-xs-1"></span>
                      <div className="col-xs-2 pg-header-options">
                        <a href="/news-feed" className="dropDown-holder">
                          <img className="img-responsive pg-top-defalt-ico" src="/images/pg-home-v6_09.png" alt="" />
                          <img className="img-responsive pg-top-hover-ico" src="/images/pg-newsfeed_03.png" alt="" />
                        </a>
                        <div onClick={()=>this.showChatList()} className="chat-dropdown-holder dropDown-holder" id="chat_notification_a">
                          <span className="pg-drop-down">
                            <img className="img-responsive pg-top-defalt-ico" src="/images/pg-home-v6_11.png" alt="" />
                            <img className="img-responsive pg-top-hover-ico" src="/images/pg-newsfeed_033.png" alt="" />
                          </span>
                            <span id="unread_chat_count_header">
                            </span>
                            <div id="chat_notification_wrapper" className="chat-notification-wrapper">
                                <img className="drop_downarrow" src="/images/drop_arrow.png" alt="" />
                                <Scrollbars style={{ height: 260 }}>
                                    <div className="chat-notification-header" id="unread_chat_list">
                                    </div>
                                    <div className="chat-dropdown-link-holder">
                                        <a href="/chat">See All</a>
                                    </div>
                                </Scrollbars>
                            </div>
                        </div>
                        <a href="#" className="dropDown-holder">
                          <img className="img-responsive pg-top-defalt-ico" src="/images/pg-home-v6_13.png" alt="" />
                          <img className="img-responsive pg-top-hover-ico" src="/images/pg-newsfeed_05.png" alt="" />
                        </a>
                      </div>
                    </div>
                  </div>
                  <ProfileImg />
                </div>

        );
    }

}
