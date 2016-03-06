/**
 * Header component for users who are not logged in
 */

import React from 'react';
import Img from '../elements/Img'
import { Link} from 'react-router'
import Logo from './Logo'
export default class Header extends React.Component {

    constructor(props) {
        super(props);
    }

	render(){
		return(
            <div className="row row-clr pg-top-navigation">
                <div className="container-fluid pg-custom-container">
                    <div className="row">
                        <div className="col-xs-3 logoHolder">
                            <Logo url ="/images/logo.png" />
                        </div>
                        <div className="col-xs-5 pgs-main-nav-area">
                            <div className="row row-clr pgs-main-nav-area-inner">
                                <ul>
                                    <li>
                                        <Link to="/about">
                                            About Proglobe
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/how-it-works">
                                            How it works
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/the-team">
                                            The Team
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/contact-us">
                                            Contact us
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-xs-4 pgs-login-area">
                            <form>
                                <div className="form-group userNameHolder inputWrapper col-sm-4">
                                    <input type="text" className="form-control pgs-sign-inputs" name="uname" placeholder="USERNAME" />
                                    <div className="checkbox">
                                        <input type="checkbox" id="rememberMe" />
                                        <label htmlFor="rememberMe">Remember Me</label>
                                    </div>
                                </div>
                                <div className="form-group passwordHolder inputWrapper col-sm-4">
                                    <input type="password" className="form-control pgs-sign-inputs" name="pass" placeholder="PASSWORD" />
                                    <a href="#">Forgot Password?</a>
                                </div>

                                <div className="form-group btnHolder col-sm-3">
                                    <button type="submit" size="6" className="pgs-sign-submit">Login</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
		);
	}
}
