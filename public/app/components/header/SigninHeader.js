/**
 * Header is to display menu items for the si
 */
import React from 'react';
import { Link} from 'react-router';
import Logo from './Logo';

import GlobalSearch from './GlobalSearch';
import ProfileImg from './ProfileImg';
import LogoutButton from '../../components/elements/LogoutButton';

export default class Header extends React.Component {

    constructor(props) {
        super(props);

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
                      <div className="col-xs-7">
                        <div className="row row-clr pg-header-search">
                          <input type="text" placeholder="Search..." />
                          <a href="#">
                            <img className="img-responsive" alt="search" src="/images/pg-home-v6_17.png" />
                          </a>
                        </div>
                      </div>
                      <span className="col-xs-1"></span>
                      <div className="col-xs-2 pg-header-options">
                        <a href="#">
                          <img className="img-responsive pg-top-defalt-ico" src="/images/pg-home-v6_09.png" alt="" />
                          <img className="img-responsive pg-top-hover-ico" src="/images/pg-newsfeed_03.png" alt="" />
                        </a>
                        <a href="#">
                          <span className="pg-drop-down">
                            <img className="img-responsive pg-top-defalt-ico" src="/images/pg-home-v6_11.png" alt="" />
                            <img className="img-responsive pg-top-hover-ico" src="/images/pg-newsfeed_033.png" alt="" />
                          </span>
                            <span id="unread_chat_count_header"></span>
                        </a>
                        <a href="#">
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
