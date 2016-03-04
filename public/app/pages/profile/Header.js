/**
 * This component is use to handle Profile Header
 * This will contain Cover image, Profile image, Profile general Information,
 * Connection
 */
import React,{Component} from 'react';
import Session  from '../../middleware/Session';
import CoverImageUploader from '../../components/elements/CoverImageUploader'
export default class Header extends Component {

    constructor(props) {
        super(props);
        this.state={
            loggedUser:Session.getSession('prg_lg'),
            user:{}
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
                <CoverImage dt={this.state.user.images} readOnly={read_only}/>
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
const CoverImage = (props)=>{

    let cover_image = (typeof props.dt.cover_image !='undefined')?props.dt.cover_image:"/images/cover_images/default_cover_1.jpg";

    let style ={
        height:"230px",
        display:"block"
    }
    return (
        <div className="cover-image-wrapper">
            <img src={cover_image} alt="" className="img-responsive pg-profile-cover-banner" style={style}/>
            <CoverImageUploader />
        </div>
        );
};


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
const ProfileInfo = (props) =>{
    let working_at = ( typeof props.dt.cur_working_at != 'undefuled' )?props.dt.cur_working_at:"";
    let designation = ( typeof props.dt.cur_designation != 'undefuled' )?props.dt.cur_designation:"";
    let full_name =  props.dt.first_name +" " +   props.dt.last_name;
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
                                <img src={ props.dt.images.profile_image.http_url}
                                     alt={full_name}
                                     className="img-responsive center-block pg-profile-detail-img"/>

                                </div>
                            </div>
                            <div className="col-xs-5 pg-profile-detail-live">
                                <h3 className="text-center">Lives in {props.dt.country}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};


