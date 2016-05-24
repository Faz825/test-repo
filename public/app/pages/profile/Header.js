/**
 * This component is use to handle Profile Header
 * This will contain Cover image, Profile image, Profile general Information,
 * Connection
 */
import React,{Component} from 'react';
import Session  from '../../middleware/Session';
import CoverImageUploader from '../../components/elements/CoverImageUploader'
import ProfileImageUploader from '../../components/elements/ProfileImageUploader'
export default class Header extends Component {

    constructor(props) {
        super(props);
        this.state={
            loggedUser:Session.getSession('prg_lg'),
            user:{},
            ProgressBarIsVisible : false
        };

        let _this = this;
        $.ajax({
            url: '/get-profile/'+this.props.uname,
            method: "GET",
            dataType: "JSON",
            success: function (data, text) {

                if (data.status.code == 200) {

                    this.setState({user:data.profile_data});

                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });
    }

    render(){

        if(Object.keys(this.state.user).length ==0){
            return (<div> Loading ....</div>);
        }

        let read_only = (this.state.loggedUser.id == this.state.user.user_id)?false:true;
        return (
            <div className="row row-clr" id="pg-profile-banner-area">
                <CoverImage dt={this.state.user} readOnly={read_only}/>
                <ConnectionIndicator dt ={this.state.user}  readOnly={read_only}/>
                <ProfileInfo dt={this.state.user} readOnly={read_only} />
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
                console.log(data)
                if (data.status.code == 200) {

                    _this.setState({loadingBarIsVisible : false,coverimgSrc : data.user.cover_image});
                    Session.createSession("prg_lg", data.user);
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
                <p>
                    <span className="pg-pro-share-btn-txt">{props.dt.connection_count}</span>
                    Connections
                </p>
            </div>
    );
};

/**
 * Profile General in formations
 */
export class ProfileInfo extends React.Component{
    constructor(props){
        super(props);
        let profileImg = (typeof  this.props.dt.images.profile_image.http_url != 'undefined')? this.props.dt.images.profile_image.http_url : this.props.dt.images.profile_image.file_name;
        this.state = {
            profileImgSrc : profileImg,

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

                    var _pay_load = {};
                    _pay_load['__content'] = "Updated profile picture";
                    _pay_load['__hs_attachment'] = true;
                    _pay_load['__post_type'] = "AP";
                    _pay_load['__profile_picture'] = data.profile_image;

                    $.ajax({
                        url: '/upload/profile-image',
                        method: "POST",
                        dataType: "JSON",
                        headers: {'prg-auth-header': _this.loggedUser.token},
                        data: {profileImg: data, extension: 'png'},
                        cache: false,
                        contentType: "application/x-www-form-urlencoded",
                        success: function (data, text) {
                            if (data.status.code == 200) {

                                _this.setState({loadingBarIsVisible: false, profileImgSrc: data.user.profile_image});
                                Session.createSession("prg_lg", data.user);
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

    render() {
        let working_at = (this.props.dt.cur_working_at)? this.props.dt.cur_working_at:"";
        let designation = (this.props.dt.cur_designation)? this.props.dt.cur_designation:"";
        let full_name =  this.props.dt.first_name + " " +   this.props.dt.last_name;

        return (
            <div className="row row-clr row-rel">
                <div id="pg-profile-pic-detail-wrapper">
                    <div className="col-xs-10 col-xs-offset-1">
                        <div className="row">
                            <div className="col-xs-5 pg-profile-detail-work">
                                <h3 className="text-center">{designation} at {working_at}</h3>
                            </div>
                            <div className="col-xs-2">
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
                                    <h3 className="text-center">Lives in {this.props.dt.country}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        );
    }
}
