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

                <div className="container">

                    <div className="row">

                        <Logo url ="images/logo.png" />
                        <div className="col-xs-6 pgs-main-nav-area">
                            <div className="row row-clr pgs-main-nav-area-inner">
                                <ul>
                                    <li><Link to="/about">About Proglobe</Link></li>
                                    <li><Link to="/how-it-works">How it works</Link></li>
                                    <li><Link to="/the-team">The Team</Link></li>
                                    <li><Link to="/contact-us">Contact us</Link></li>

                                </ul>
                            </div>
                        </div>
                        <div className="col-xs-3 pgs-main-btn-area">
                            <div className="row row-clr pgs-main-btn-area-inner">

                                <LogoutButton value="logout" />

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}