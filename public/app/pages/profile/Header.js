/**
 * This component is use to handle Profile Header
 * This will contain Cover image, Profile image, Profile general Information,
 * Connection
 */
import React,{Component} from 'react';
import Session  from '../../middleware/Session';
import CoverImageUploader from '../../components/elements/CoverImageUploader';
import ProfileImageUploader from '../../components/elements/ProfileImageUploader';
import PubSub from 'pubsub-js';

export default class Header extends Component {

    constructor(props) {
        super(props);
        this.state={
            loggedUser:Session.getSession('prg_lg'),
            //user:this.props.user,
            ProgressBarIsVisible : false
        };

        let _this = this;

    }

    render(){

        if(Object.keys(this.props.user).length ==0){
            return (<div> Loading ....</div>);
        }

        let read_only = (this.state.loggedUser.id == this.props.user.user_id)?false:true;
        let isOnFriendsProfile = (this.state.loggedUser.id != this.props.user.user_id && this.props.connectionStatus == 0) ? true : false;

        return (
            <div className="row row-clr" id="pg-profile-banner-area">
                <CoverImage dt={this.props.user} readOnly={read_only} onFriendsProfile={isOnFriendsProfile}/>
                {
                    (isOnFriendsProfile)?
                        <MutualConnectionIndicator mutualCount={this.props.user.mutual_connection_count}
                                                   onLoadMutualFriends  = {this.props.onLoadMutualFriends}/>
                    :
                        <ConnectionIndicator dt ={this.props.user}  readOnly={read_only}/>
                }
                <ConnectionStatus connectionStatus={this.props.connectionStatus} onAddFriend = {this.props.onAddFriend}
                                  onAcceptFriendRequest = {this.props.onAcceptFriendRequest}
                                  onUnfriendUser = {this.props.onUnfriendUser}
                                  usrId={this.props.usrId}
                                  loggedUser={this.props.loggedUser}/>
                <ProfileInfo dt={this.props.user} readOnly={read_only} loadExperiences={this.props.loadExperiences} uname={this.props.uname} loadProfileData={this.props.loadProfileData}/>
            </div>
        )
    }
}

/**
 * Show cover image
 * @param props
 */
export class CoverImage extends React.Component{
    constructor(props){
        super(props);
        let coverImg = (props.dt.images.cover_image)? props.dt.images.cover_image.http_url : "/images/cover_images/default_cover_1.jpg";
        this.state = {
            coverimgSrc : coverImg
        }
        this.coverImgUpdate = this.coverImgUpdate.bind(this);
        this.loggedUser = Session.getSession('prg_lg');
    }

    onLoadQuickChatMessage() {

        if(!this.props.onFriendsProfile) {
            return;
        }

        let friend_title = this.props.dt.user_name;
        let progTitle = 'proglobe' + friend_title;
        var FPM = "FRIEND_PROFILE_MESSAGING";

        let messagingObj = {
            date: "",
            id: "",
            latestMsg: "",
            message_id: "",
            proglobeTitle: progTitle,
            tabId: "",
            title: friend_title,
            user:this.props.dt
        };

        PubSub.publishSync(FPM, messagingObj);
    }

    onLoadVideoCall(t) {

        if(!this.props.onFriendsProfile) {
            return;
        }

        let friend_title = this.props.dt.user_name;
        let friend_uri = 'usr:proglobe' + friend_title;
        let progTitle = 'proglobe' + friend_title;
        let FPVC = "FRIEND_PROFILE_VIDEO_CALL";

        let messagingObj = {
            date: "",
            id: "",
            latestMsg: "",
            message_id: "",
            proglobeTitle: progTitle,
            tabId: "",
            title: friend_title,
            user: this.props.dt,
            uri: friend_uri,
            type: t
        };

        PubSub.publishSync(FPVC, messagingObj);
    }

    coverImgUpdate(data){

        this.setState({loadingBarIsVisible : true});
        let _this =  this;

        $.ajax({
            url: '/upload/cover-image',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':_this.loggedUser.token },
            data:{cover_img:data,extension:'png'},
            cache: false,
            contentType:"application/x-www-form-urlencoded",
            success: function (data, text) {
                if (data.status.code == 200) {

                    _this.setState({loadingBarIsVisible : false,coverimgSrc : data.user.cover_image});
                    Session.createSession("prg_lg", data.user);

                    var _pay_load = {};
                    _pay_load['__content'] = "";
                    _pay_load['__hs_attachment'] = true;
                    _pay_load['__post_type'] = "CP";//cover update post
                    _pay_load['__profile_picture'] = data.cover_image;

                    $.ajax({
                        url: '/post/profile-image-post',
                        method: "POST",
                        dataType: "JSON",
                        headers: {'prg-auth-header': _this.loggedUser.token},
                        data: _pay_load,
                        cache: false,
                        contentType: "application/x-www-form-urlencoded",
                        success: function (data, text) {
                            if (data.status.code == 200) {
                                document.location.reload(true)
                            }
                        },
                        error: function (request, status, error) {
                            console.log(request.responseText);
                            console.log(status);
                            console.log(error);
                        }


                    });

                }
            },
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });

        this.setState({coverimgSrc : data});
    }

    render() {
        return (
            <div className="cover-image-wrapper">
                <img src={this.state.coverimgSrc} alt="" className="img-responsive pg-profile-cover-banner" />
                {(this.props.readOnly)? null : <CoverImageUploader imgUpdated={this.coverImgUpdate} /> }
                {(this.props.onFriendsProfile) ?
                    <div className="action-btn-holder">
                        <button className="btn btn-default" onClick={()=>this.onLoadQuickChatMessage()}><i className="fa fa-comments" aria-hidden="true"></i> Message</button>
                        <button className="btn btn-default" onClick={()=>this.onLoadVideoCall('CALL')}><i className="fa fa-phone" aria-hidden="true"></i> Call</button>
                        <button className="btn btn-default" onClick={()=>this.onLoadVideoCall('VIDEO')}><i className="fa fa-video-camera" aria-hidden="true"></i> Video</button>
                    </div>
                    :
                    null
                }

            </div>
        );
    }
}

/**
 * Show Connection count
 */
const ConnectionIndicator =(props)=> {
    let _style ={
        "width": "102px",
        "textTransform": "uppercase"
    }

    return (
        <div id="pg-pro-share-btn" style={_style}>
            <img src="/images/Share-copy.png" alt="" />
                {
                    (props.readOnly)?
                        <p>
                            <span className="pg-pro-share-btn-txt">{props.dt.connection_count}</span>
                            Connections
                        </p>
                    :
                        <a href="/connections">
                            <span className="pg-pro-share-btn-txt">{props.dt.connection_count}</span>
                            Connections
                        </a>
                }
        </div>
    );
};

/**
 * Show Mutual Friends count
 */
const MutualConnectionIndicator =(props)=> {
    let _style ={
        "width": "102px",
        "textTransform": "uppercase"
    }

    return (
        <div id="pg-pro-share-btn" className="mutual-friends-holder clearfix" style={_style} onClick={props.onLoadMutualFriends}>
            <p>
                <span className="pg-pro-share-btn-txt">{props.mutualCount}</span>
                Mutual Connections
            </p>
        </div>
    );
};


export class ConnectionStatus extends React.Component{
    constructor(props){
        super(props);

        //0-already connected (nothing to display), 1-request sent (Display "Request Pending" label), 2-request received (Display "Accept" button), 3-can send request (Display "Add as a Connection" button)
    }

    render(){
        {
            return(
                (this.props.connectionStatus == 0)?
                    (this.props.usrId != null)?
                        <a href="javascript:void(0)"
                           onClick={ () => this.props.onUnfriendUser(this.props.usrId) }
                           className="pg-fr-bot-btn action-btn">Unfriend</a> : null :
                    (this.props.connectionStatus == 1) ? <a className="action-btn">Request Pending</a> :
                        (this.props.connectionStatus == 2) ? <a href="javascript:void(0)"
                                                                onClick={ () => this.props.onAcceptFriendRequest(this.props.usrId) }
                                                                className="pg-fr-bot-btn action-btn">Accept</a> :
                            (this.props.connectionStatus == 3) ? <a href="javascript:void(0)"
                                                                    onClick={ () => this.props.onAddFriend(this.props.usrId) }
                                                                    className="pg-fr-bot-btn action-btn"><i className="fa fa-plus" aria-hidden="true"></i>Add as a Connection</a> : null
            )
        }
    }
}

/**
 * Profile General in formations
 */
export class ProfileInfo extends React.Component{
    constructor(props){
        super(props);
        let profileImg = (typeof  this.props.dt.images.profile_image.http_url != 'undefined')? this.props.dt.images.profile_image.http_url : this.props.dt.images.profile_image.file_name;
        let working_at = (this.props.dt.cur_working_at)? this.props.dt.cur_working_at:"";
        let designation = (this.props.dt.cur_designation)? this.props.dt.cur_designation:"";
        let exp_id = (this.props.dt.cur_exp_id)? this.props.dt.cur_exp_id:null;
        let desigFieldLength = designation.length;
        let officeFieldLength = working_at.length;
        let uname = this.props.uname;

        this.state = {
            profileImgSrc : profileImg,
            jobPostition : designation,
            office : working_at,
            desigFieldSize : desigFieldLength,
            officeFieldSize : officeFieldLength,
            saveEdit : false,
            exp_id : exp_id,
            uname:uname
        }
        this.profileImgUpdated = this.profileImgUpdated.bind(this);
        this.loggedUser = Session.getSession('prg_lg');
    }

    profileImgUpdated(data){
        this.setState({loadingBarIsVisible : true});

        let _this =  this;

        $.ajax({
            url: '/upload/profile-image',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':_this.loggedUser.token },
            data:{profileImg:data,extension:'png'},
            cache: false,
            contentType:"application/x-www-form-urlencoded",
            success: function (data, text) {
                if (data.status.code == 200) {

                    _this.setState({loadingBarIsVisible: false, profileImgSrc: data.user.profile_image});
                    Session.createSession("prg_lg", data.user);

                    var _pay_load = {};
                    _pay_load['__content'] = "";
                    _pay_load['__hs_attachment'] = true;
                    _pay_load['__post_type'] = "PP";//profile update post
                    _pay_load['__profile_picture'] = data.profile_image;

                    $.ajax({
                        url: '/post/profile-image-post',
                        method: "POST",
                        dataType: "JSON",
                        headers: {'prg-auth-header': _this.loggedUser.token},
                        data: _pay_load,
                        cache: false,
                        contentType: "application/x-www-form-urlencoded",
                        success: function (data, text) {
                            if (data.status.code == 200) {
                                document.location.reload(true)
                            }
                        },
                        error: function (request, status, error) {
                            console.log(request.responseText);
                            console.log(status);
                            console.log(error);
                        }


                    });
                }
            },

            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });

    }

    positonChange(e){
        let fieldName = e.target.name;
        let value = e.target.value;
        let fieldLength = value.length;

        if(fieldName == "designation"){
            this.setState({jobPostition : value, desigFieldSize : fieldLength});
            this.props.dt.cur_designation = value;
        }else{
            this.setState({office : value, officeFieldSize : fieldLength});
            this.props.dt.cur_working_at = value;
        }
    }

    editOccupation(){
        this.setState({saveEdit : true});
    }

    saveOccupation(){
        this.setState({saveEdit : false});

        let profileOccupation = {
            exp_id:this.state.exp_id,
            company_name:this.state.office,
            title:this.state.jobPostition,
            isProfile:true
        };
        let loggedUser = Session.getSession('prg_lg');

        $.ajax({
            url: '/work-experience/update',
            method: "POST",
            dataType: "JSON",
            data:profileOccupation,
            headers: { 'prg-auth-header':loggedUser.token },
            success: function (data, text) {
                if(data.status.code == 200){
                    this.props.loadExperiences();
                    this.props.loadProfileData();
                }

            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }.bind(this)
        });

    }

    render() {
        let full_name =  this.props.dt.first_name + " " +   this.props.dt.last_name;

        return (
            <div className="row row-clr row-rel">
                <div id="pg-profile-pic-detail-wrapper">
                    <div className="col-xs-10 col-xs-offset-1">
                        <div className="row block-wrapper">
                            <div className="col-xs-5 pg-profile-detail-work">
                                {
                                    (this.state.jobPostition || this.state.office)?
                                            <div className="curr-job-holder">
                                                <p className={(!this.state.saveEdit)? "designation-text" : "designation-text editable"} >{this.state.jobPostition}</p>
                                                <input type="text" name="designation" className={(!this.state.saveEdit)? "job-data" : "job-data editable"} size={this.state.desigFieldSize} value={this.props.dt.cur_designation} onChange={this.positonChange.bind(this)} readOnly={!this.state.saveEdit}/>
                                                <span className="combine-text">at</span>
                                                <p className={(!this.state.saveEdit)? "office-text" : "office-text editable"} >{this.state.office}</p>
                                                <input type="text" name="workplace" className={(!this.state.saveEdit)? "job-data" : "job-data editable"} size={this.state.officeFieldSize} value={this.props.dt.cur_working_at} onChange={this.positonChange.bind(this)} readOnly={!this.state.saveEdit}/>
                                                {
                                                    (!this.props.readOnly)?
                                                        (!this.state.saveEdit)?
                                                        <span className="fa fa-pencil-square-o" onClick={this.editOccupation.bind(this)}></span>
                                                        :
                                                        <span className="fa fa-floppy-o" onClick={this.saveOccupation.bind(this)}></span>
                                                    :
                                                    null
                                                }
                                            </div>
                                    :
                                    null
                                }
                            </div>
                            <div className="col-xs-2 profile-img-holder">
                                <div className="row pg-profile-mid-wrapper">
                                    <h1 className="pg-profile-detail-name text-center">{full_name}</h1>
                                    <div className="proImgHolder">
                                        <img src={this.state.profileImgSrc}
                                            alt={full_name}
                                            className="img-responsive center-block pg-profile-detail-img"/>
                                        {(this.props.readOnly)? null : <ProfileImageUploader profileImgSrc={this.state.profileImgSrc} imgUpdated={this.profileImgUpdated} /> }
                                    </div>
                                    </div>
                            </div>
                            <div className="col-xs-5 pg-profile-detail-live">
                                <h3 className="text-center">Lives in {this.props.dt.city_details}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
