import React from 'react'
import Session  from '../../middleware/Session'

export default class ProfileImg extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            userLogedIn : Session.getSession('prg_lg'),
            imgSrc : "/images/default-profile-pic.png"
        }


    }


    componentDidMount(){
        if(this.state.userLogedIn.profile_image){
              this.setState({imgSrc : this.state.userLogedIn.profile_image});
            }
        }
    loadProfile(event){
        window.location.href ='/profile/'+this.state.userLogedIn.user_name
    }
    logout(){
        Session.destroy("prg_lg");
        $.ajax({
            url: '/logout',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.userLogedIn.token },
            data:this.state.formData,
            success: function (data, text) {

                if (data.status.code == 200) {
                    location.href ="/sign-up"

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
        let _full_name = this.state.userLogedIn.first_name +" "+ this.state.userLogedIn.last_name;
        return (
          <div className="pg-top-profile-pic-box">
            <div className="proImgholder">
            <a href="javascript:void(0)" onClick={event=>this.loadProfile(event)} title={_full_name}>
                <img src={this.state.imgSrc} alt="Profile-Pic" className="img-responsive"/>
            </a>
            </div>
            <div className="pg-top-profile-pic-options">
                <a href="javascript:void(0)" onClick={event=>this.logout(event)}><img src="/images/pg-home-v6_06.png" alt="" className="img-responsive"/></a>
                <a href="javascript:void(0)" onClick={event=>this.loadProfile(event)}><img src="/images/pg-home-v6_20.png" alt="" className="img-responsive"/></a>
            </div>
          </div>
        );
    }
}
