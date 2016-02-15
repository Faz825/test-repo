/**
 * This Componet for handle logged user profile
 */

import React from 'react';
import { Link} from 'react-router'

export default class ProfileImage extends React.Component {
    constructor(props) {
        super(props);

    }

    render(){
        return (
            <div className="pg-top-profile-pic-box">

                <a href="profile.html">
                    <img src="images/top-profile-pic.png" alt="Profile-Pic" className="img-responsive"/>
                </a>
                <div className="pg-top-profile-pic-options">

                    <a href="#"><img src="images/pg-home-v6_06.png" alt="" className="img-responsive"/></a>

                    <a href="#"><img src="images/pg-home-v6_20.png" alt="" className="img-responsive"/></a>

                </div>
            </div>
        )
    }
}
