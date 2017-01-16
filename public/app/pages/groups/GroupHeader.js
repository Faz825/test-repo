/**
 * The Group discussion page
 */
import React from 'react';
import Session  from '../../middleware/Session';

export default class GroupHeader extends React.Component{

    constructor(props) {

        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        this.state = {
            user : user,
        };
    }

    render() {
        return (
            <section className="group-header">
                <div className="header-top">
                    <div className="banner">
                        <img src="assets/images/group/group-header-bg.png" alt="banner" className="banner-img" />
                    </div>
                    <div className="members-holder">
                        <span className="member-icon"></span>
                        <div className="mem-count">
                            <span className="member-count">03</span>
                            <p className="mem-text">Members</p>
                        </div>
                    </div>
                </div>
                <div className="header-bottom clearfix">
                    <div className="prof-img-holder">
                        <img src="assets/images/group/grp-profile-pic.png" alt="grp-pic" />
                    </div>
                    <div className="left-nav-wrapper clearfix">
                        <div className="nav-item first-item active">
                            <i className="fa fa-users" aria-hidden="true"></i>
                            <p className="nav-text">group discussion</p>
                        </div>
                        <div className="nav-item left-second">
                            <i className="fa fa-calendar" aria-hidden="true"></i>
                            <p className="nav-text">group calendar</p>
                        </div>
                        <div className="nav-item left-middle">
                            <i className="fa fa-comments" aria-hidden="true"></i>
                            <p className="nav-text">group chat</p>
                        </div>
                    </div>
                    <div className="right-nav-wrapper clearfix">
                        <div className="nav-item right-middle">
                            <i className="fa fa-file-text" aria-hidden="true"></i>
                            <p className="nav-text">group notebooks</p>
                        </div>
                        <div className="nav-item right-second">
                            <i className="fa fa-folder-open" aria-hidden="true"></i>
                            <p className="nav-text">group folders</p>
                        </div>
                        <div className="nav-item last-item">
                            <i className="fa fa-list" aria-hidden="true"></i>
                            <p className="nav-text">Task Manager</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}
