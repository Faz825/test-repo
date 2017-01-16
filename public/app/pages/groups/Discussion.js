/**
 * The Group discussion page
 */
import React from 'react';
import Session  from '../../middleware/Session';
import GroupHeader from './GroupHeader';

export default class Discussion extends React.Component{

    constructor(props) {

        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        var groupPrefix = this.props.params.name;
        this.state = {
            description: '',
            user : user,
            currentGroup : (typeof(groupPrefix) != 'undefined' ? groupPrefix : '' )
        };
    }

    componentDidMount() {
        this.loadEvents();
    }

    loadEvents() {

        $.ajax({
            url : '/groups/get-group',
            method : "POST",
            data : { name_prefix : this.state.currentGroup},
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    console.log(data);
                    console.log("GROUP DATA FETCHED");
                    this.setState({description: data.group.description});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }

    render() {
        return (
            <section className="group-container">
                <div className="container">
                    <GroupHeader />
                    <section className="group-content">
                        <div className="sidebar col-sm-4">
                            <div className="grp-desc panel">
                                <h3 className="panel-title">Description</h3>
                                <p className="desc">{this.state.description}</p>
                            </div>
                            <div className="grp-members panel">
                                <div className="panel-header clearfix">
                                    <h3 className="panel-title">Group Members</h3>
                                    <span className="mem-count">30 Members</span>
                                </div>
                                <div className="add-member">
                                    <input type="text" className="form-control" placeholder="+ Add a member to this group..." />
                                </div>
                                <div className="all-members clearfix">
                                    <div className="mem-img">
                                        <img src="assets/images/group/mem-pics/member.png" alt="mem" />
                                    </div>
                                    <div className="mem-img">
                                        <img src="assets/images/group/mem-pics/mem2.png" alt="mem" />
                                    </div>
                                    <div className="mem-img">
                                        <img src="assets/images/group/mem-pics/member.png" alt="mem" />
                                    </div>
                                    <div className="mem-img">
                                        <img src="assets/images/group/mem-pics/mem2.png" alt="mem" />
                                    </div>
                                    <div className="mem-img">
                                        <img src="assets/images/group/mem-pics/member.png" alt="mem" />
                                    </div>
                                    <div className="mem-img">
                                        <img src="assets/images/group/mem-pics/mem2.png" alt="mem" />
                                    </div>
                                    <div className="mem-img">
                                        <img src="assets/images/group/mem-pics/member.png" alt="mem" />
                                    </div>
                                    <div className="mem-img">
                                        <img src="assets/images/group/mem-pics/mem2.png" alt="mem" />
                                    </div>
                                    <div className="mem-img">
                                        <img src="assets/images/group/mem-pics/member.png" alt="mem" />
                                    </div>
                                    <div className="mem-img">
                                        <img src="assets/images/group/mem-pics/mem2.png" alt="mem" />
                                    </div>
                                    <div className="mem-img">
                                        <img src="assets/images/group/mem-pics/member.png" alt="mem" />
                                    </div>
                                    <div className="mem-img last-mem">
                                        <img src="assets/images/group/mem-pics/mem2.png" alt="mem" />
                                        <div className="mem-count">
                                            <span className="count">+19</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grp-day-panel panel">
                                <div className="day-slide-header">
                                    <div className="day-slider">
                                        <p className="date">Wednesday, 9</p>
                                        <span className="fa fa-angle-left prev slide-btn"></span>
                                        <span className="fa fa-angle-right next slide-btn"></span>
                                    </div>
                                </div>
                                <div className="date-selected clearfix">
                                    <div className="date-wrapper pull-left">
                                        <p className="day-name">Wednesday</p>
                                        <p className="day-num">9</p>
                                    </div>
                                    <p className="month-name pull-right">December</p>
                                </div>
                                <div className="event-task-holder">
                                    <div className="event-wrapper inner-wrapper">
                                        <div className="title-holder clearfix">
                                            <i className="fa fa-calendar task-icon" aria-hidden="true"></i>
                                            <h3 className="title">Event</h3>
                                        </div>
                                    </div>
                                    <div className="task-wrapper inner-wrapper">
                                        <div className="title-holder clearfix">
                                            <span className="task-icon"></span>
                                            <h3 className="title">Tasks</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="post-panel col-sm-8">
                            <div className="post-editor-holder post">
                                <div className="post-header clearfix">
                                    <div className="post-nav share-nav active">
                                        <div className="inner-wrapper">
                                            <i className="fa fa-pencil-square-o pull-left" aria-hidden="true"></i>
                                            <p className="nav-title pull-left">Share Update</p>
                                        </div>
                                    </div>
                                    <div className="post-nav media-nav">
                                        <div className="inner-wrapper">
                                            <i className="fa fa-picture-o pull-left" aria-hidden="true"></i>
                                            <p className="nav-title pull-left">Photo/Video</p>
                                        </div>
                                    </div>
                                    <div className="post-nav loc-nav">
                                        <div className="inner-wrapper">
                                            <i className="fa fa-map-marker pull-left" aria-hidden="true"></i>
                                            <p className="nav-title pull-left">Share Location</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="post-editor">
                                    <div contenteditable="true" className="edit-post-field">Post something...</div>
                                </div>
                                <div className="post-editor-footer clearfix">
                                    <div className="post-opts-holder pull-left">
                                        <span className="photo-icon opt"></span>
                                        <span className="tag-icon opt"></span>
                                        <span className="smiley-icon opt"></span>
                                        <div className="location-opt clearfix">
                                            <span className="loc-icon opt"></span>
                                            <div className="loc-text-holder clearfix">
                                                <p className="loc-text">New york</p>
                                                <i className="fa fa-times" aria-hidden="true"></i>
                                            </div>
                                        </div>
                                        <span className="event-icon opt"></span>
                                    </div>
                                    <div className="btn-holder pull-right">
                                        <button className="btn post-btn">Post</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        );
    }
}
