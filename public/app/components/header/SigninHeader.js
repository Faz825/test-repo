/**
 * Header is to display menu items for the si
 */
import React from 'react';
import { Link} from 'react-router';
import Logo from './Logo';
import ProfileImage from './ProfileImage';
import GlobalSearch from './GlobalSearch';
import LogoutButton from '../../components/elements/LogoutButton';

export default class Header extends React.Component {

    constructor(props) {
        super(props);

    }


    render(){
        return(
            <div className="row row-clr pgs-top-navigation">

              <Logo url ="images/logo.png" />

                <div className="container">
                    <div className="row">
                      <span className="col-xs-2"></span>
                      <div className="col-xs-7">
                        <div className="row row-clr pg-header-search">
                          <input type="text" placeholder="Search..." />
                          <a href="#">
                            <img className="img-responsive" alt="search" src="images/pg-home-v6_17.png" />
                          </a>
                        </div>
                      </div>
                      <span className="col-xs-1"></span>
                      <div className="col-xs-2 pg-header-options">
                        <a href="newsfeed.html">
                          <img className="img-responsive pg-top-defalt-ico" alt="" src="images/pg-home-v6_09.png" />
                          <img className="img-responsive pg-top-hover-ico" alt="" src="images/pg-newsfeed_03.png" />
                        </a>
                        <a>
                          <span className="pg-drop-down">
                            <img className="img-responsive pg-top-defalt-ico" alt="" src="images/pg-home-v6_11.png" />
                            <img className="img-responsive pg-top-hover-ico" alt="" src="images/pg-newsfeed_033.png" />
                          </span>
                        </a>
                        <a href="#">
                          <img className="img-responsive pg-top-defalt-ico" alt="" src="images/pg-home-v6_13.png" />
                          <img className="img-responsive pg-top-hover-ico" alt="" src="images/pg-newsfeed_05.png" />
                        </a>
                      </div>
                    </div>
                </div>
            </div>
        );
    }

}
