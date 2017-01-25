/**
 * The Group discussion page
 */
import React from 'react';
import moment from 'moment';

import Session  from '../../middleware/Session';
import GroupHeader from './GroupHeader';

import SearchMembersField  from './elements/SearchMembersField';
import AddPostElement from '../../components/timeline/AddPostElement';
import ListPostsElement from '../../components/timeline/ListPostsElement';

export default class Discussion extends React.Component{

    constructor(props) {

        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        var group = this.props.myGroup;
        this.state = {
            user : user,
            uname : user.user_name,
            currentGroup : group,
            randomMembers : this.props.randomMembers,
            membersCount : this.props.membersCount,
            members : this.props.members,
            posts:[],
        };

        this.postType = 2; // [ PERSONAL_POST:1, GROUP_POST:2 ]
        this.postVisibleMode = 5; // [ PUBLIC:1, FRIEND_ONLY:2, ONLY_MY:3, SELECTED_USERS:4, GROUP_MEMBERS:5 ]
        this.currentGroup =this.state.currentGroup;
    }

    componentWillReceiveProps(nextProps) {

        // Basically, whenever you assign parent's props to a child's state
        // the render method isn't always called on prop update
        if (nextProps.randomMembers !== this.state.randomMembers) {
            this.setState({ randomMembers: nextProps.randomMembers });
        }

        if (nextProps.membersCount !== this.state.membersCount) {
            this.setState({ membersCount: nextProps.membersCount });
        }

        if (nextProps.members !== this.state.members) {
            this.setState({ members: nextProps.members });
        }

        if (nextProps.myGroup !== this.state.currentGroup) {
            this.setState({ currentGroup: nextProps.myGroup });
            this.currentGroup = nextProps.myGroup;
            this.loadPosts(0);
        }
    }

    loadPosts(page){
        let user = Session.getSession('prg_lg');
        let _this =  this;

        var data = {
            __group_id: this.currentGroup._id,
            __posts_type: this.postType,
            __pg: page,
            uname: this.state.uname,
            __own: "me"
        };
        $.ajax({
            url: '/pull/posts',
            method: "GET",
            dataType: "JSON",
            data:data,
            success: function (data, text) {

                if(data.status.code == 200){
                    this.setState({posts:data.posts})
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(status);
                console.log(error);
            }.bind(this)
        });
    }

    onPostSubmitSuccess() {
        console.log("onPostSubmitSuccess");
    }

    onPostDeleteSuccess() {
        console.log("onPostDeleteSuccess");
    }
    onLikeSuccess() {
        console.log("onLikeSuccess");
    }
    onLoadProfile() {
        console.log("onLoadProfile");
    }

    render() {
        let workmodeClass = "workmode-switched";
        // let user = Session.getSession('prg_lg');
        const {user, uname}= this.state;
        return (
            <section className="group-content">
                <div className="sidebar col-sm-4">
                    <div className="grp-desc panel">
                        <h3 className="panel-title">Description</h3>
                        <p className="desc">{this.state.currentGroup.description}</p>
                    </div>
                    <MembersWidget
                        randomMembers={this.state.randomMembers}
                        membersCount={this.state.membersCount}
                        currentGroup={this.state.currentGroup}
                    />
                    <CalendarWidget />
                </div>
                <div className="post-panel col-sm-8">
                    <div className="post-holder">
                        <AddPostElement
                            workModeStyles={workmodeClass}
                            onPostSubmitSuccess={this.onPostSubmitSuccess.bind(this)}
                            uname = {uname}
                            profileUsr={user}
                            connectionStatus={this.state.connectionStatus}
                            postType={this.postType}
                            postVisibleMode={this.postVisibleMode}
                            members={this.state.members.members}
                            group={this.state.currentGroup._id}
                        />
                        <ListPostsElement
                            posts={this.state.posts}
                            uname = {uname}
                            onPostSubmitSuccess= {this.onPostSubmitSuccess.bind(this)}
                            onPostDeleteSuccess = {this.onPostDeleteSuccess.bind(this)}
                            onLikeSuccess = {this.onLikeSuccess.bind(this)}
                            onLoadProfile = {this.onLoadProfile.bind(this)}
                        />
                    </div>
                    {/*
                     ** This is the original the layout and the sytle to be displayed except the above post editor **
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
                            <div className="edit-post-field">Post something...</div>
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
                    </div> */}
                </div>
            </section>
        );
    }
}

/**
 * The Members Widget
 */
export class MembersWidget extends React.Component{

    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        var group = this.props.currentGroup;
        this.state = {
            user : user,
            randomMembers : this.props.randomMembers,
            membersCount : this.props.membersCount,
            members : [],
            group : group
        };

        this.addNewMembers = this.addNewMembers.bind(this);
        this.handleSearchUser = this.handleSearchUser.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        // Basically, whenever you assign parent's props to a child's state
        // the render method isn't always called on prop update
        if (nextProps.randomMembers !== this.state.randomMembers) {
            this.setState({ randomMembers: nextProps.randomMembers });
        }

        if (nextProps.membersCount !== this.state.membersCount) {
            this.setState({ membersCount: nextProps.membersCount });
        }

        if (nextProps.group !== this.state.group) {
            this.setState({ group: nextProps.group });
        }
    }

    handleSearchUser(sharedWithIds, members){
        this.setState({members: members});
    }

    addNewMembers() {
        var groupData = {
            __groupId : this.state.group._id,
            __members : this.state.members
        }

        $.ajax({
            url: '/groups/add-members',
            method: "POST",
            dataType: "JSON",
            data: JSON.stringify(groupData),
            headers : { "prg-auth-header" : this.state.user.token },
            contentType: "application/json; charset=utf-8",
        }).done(function (data, text) {
            if(data.status.code == 200){
                console.log(data);
            }
        }.bind(this));
    }

    render() {
        var userBlocks = '';
        var overflowCount = this.state.membersCount-this.state.randomMembers.length;
        var overflowCountStr = '+'+overflowCount.toString();
        var _this = this;

        if(this.state.randomMembers.length > 0 ) {
            userBlocks = this.state.randomMembers.map(function(member,userKey){

                if(userKey+1 == _this.state.randomMembers.length && _this.state.randomMembers.length < _this.state.membersCount) {

                    return <div key={userKey+1} className="mem-img last-mem">
                        <img src={member.profile_image} alt="mem" />
                        <div className="mem-count">
                            <span className="count">{overflowCountStr}</span>
                        </div>
                    </div>;
                } else {
                    return <div key={userKey+1} className="mem-img"><img src={member.profile_image} alt="mem" /></div>;
                }
            });
        }

        return (
            <div className="grp-members panel">
                <div className="panel-header clearfix">
                    <h3 className="panel-title">Group Members</h3>
                    <span className="mem-count">{this.state.membersCount} Members</span>
                </div>
                <div className="add-member invite-people clearfix">
                    <div className="search-field-holder">
                        <SearchMembersField
                            handleSearchUser={this.handleSearchUser}
                            placeholder="+ Add a member to this group..."
                        />
                    </div>
                    <button
                        className="col-sm-2 btn btn-primary success-btn"
                        onClick={this.addNewMembers}>
                        Add
                    </button>
                </div>
                <div className="all-members clearfix">
                    {userBlocks}

                </div>
            </div>
        );
    }
}

/**
 * The Calendar Widget
 */
export class CalendarWidget extends React.Component{

    constructor(props) {
        super(props);
        var group = this.props.myGroup;
        this.state = {
            currentDate : moment().format('YYYY-MM-DD')
        };
    }

    render() {
        return (
            <div className="grp-day-panel panel">
                <div className="day-slide-header">
                    <div className="day-slider">
                        <p className="date">{moment(this.state.currentDate).format('dddd')}, {moment(this.state.currentDate).format('YY')}</p>
                        <span className="fa fa-angle-left prev slide-btn"></span>
                        <span className="fa fa-angle-right next slide-btn"></span>
                    </div>
                </div>
                <div className="date-selected clearfix">
                    <div className="date-wrapper pull-left">
                        <p className="day-name">{moment(this.state.currentDate).format('dddd')}</p>
                        <p className="day-num">{moment(this.state.currentDate).format('YY')}</p>
                    </div>
                    <p className="month-name pull-right">{moment(this.state.currentDate).format('MMMM')}</p>
                </div>
                <div className="event-task-holder">
                    <div className="event-wrapper inner-wrapper">
                        <div className="title-holder clearfix">
                            <i className="fa fa-calendar task-icon" aria-hidden="true"></i>
                            <h3 className="title">Event</h3>
                        </div>
                        <ul className="events-tasks-list events-list">
                            <li>Event one</li>
                            <li>Event two</li>
                            <li>Event three</li>
                        </ul>
                    </div>
                    <div className="task-wrapper inner-wrapper">
                        <div className="title-holder clearfix">
                            <span className="task-icon"></span>
                            <h3 className="title">Tasks</h3>
                        </div>
                        <ul className="events-tasks-list tasks-list">
                            <li>Task one</li>
                            <li>Task two</li>
                            <li>Task three</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
