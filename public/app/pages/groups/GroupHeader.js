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
            user : user
        };
        this.activeLayout = 'discussion';
        this.setActiveLayout = this.setActiveLayout.bind(this);
    }

    setActiveLayout(_value) {
        this.props.setGroupLayout(_value);
        this.setState({activeLayout:_value});
        //this.activeLayout = _value;


    }

    render() {
        return (
            <section className="group-header">
                <div className="header-top">
                    <div className="banner">
                        <img src="images/group/group-header-bg.png" alt="banner" className="banner-img" />
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
                        <div className={this.state.activeLayout=='discussion' ? "nav-item first-item active" : "nav-item first-item"} onClick={() => this.setActiveLayout('discussion')}>
                            <i className="fa fa-users" aria-hidden="true"></i>
                            <p className="nav-text">group discussion</p>
                        </div>
                        <div className={this.state.activeLayout=='calendar' ? "nav-item left-second active" : "nav-item left-second"} onClick={() => this.setActiveLayout('calendar')}>
                            <i className="fa fa-calendar" aria-hidden="true"></i>
                            <p className="nav-text">group calendar</p>
                        </div>
                        <div className={this.state.activeLayout=='chat' ? "nav-item left-middle active" : "nav-item left-middle"} onClick={() => this.setActiveLayout('chat')}>
                            <i className="fa fa-comments" aria-hidden="true"></i>
                            <p className="nav-text">group chat</p>
                        </div>
                    </div>
                    <div className="right-nav-wrapper clearfix">
                        <div className={this.state.activeLayout=='notebook' ? "nav-item right-middle active" : "nav-item right-middle"} onClick={() => this.setActiveLayout('notebook')}>
                            <i className="fa fa-file-text" aria-hidden="true"></i>
                            <p className="nav-text">group notebooks</p>
                        </div>
                        <div className={this.state.activeLayout=='folder' ? "nav-item right-second active" : "nav-item right-second"} onClick={() => this.setActiveLayout('folder')}>
                            <i className="fa fa-folder-open" aria-hidden="true"></i>
                            <p className="nav-text">group folders</p>
                        </div>
                        <div className={this.state.activeLayout=='task_manager' ? "nav-item last-item active" : "nav-item last-item"} onClick={() => this.setActiveLayout('task_manager')}>
                            <i className="fa fa-list" aria-hidden="true"></i>
                            <p className="nav-text">Task Manager</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}
