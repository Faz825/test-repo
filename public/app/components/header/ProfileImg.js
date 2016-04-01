import React from 'react'
import Session  from '../../middleware/Session'
import Chat  from '../../middleware/Chat';
export default class ProfileImg extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            userLogedIn : Session.getSession('prg_lg'),
            imgSrc : "/images/default-profile-pic.png"
        }
        if (Session.isSessionSet('prg_lg')) {
            Chat.bit6Auth(false);
        }

    }
    answerVideo(){
        var opts = {audio: true, video: true};
        Chat.answerCall(opts);
    }

    answerAudio(){
        var opts = {audio: true, video: false};
        Chat.answerCall(opts);
    }

    reject(){
        Chat.rejectCall();
    }

    hangup(){
        Chat.hangupCall();
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



              <div className="col-sm-9 fh top-padding-20 hidden inCallPane-wrapper" id="detailPane">
                  <div className="row video-call-view col-sm-5" id="inCallPane">
                      <div className="fh">
                          <div className="row top-row" id="inCallPane_inner_div">
                              <div className="video-call-holder">
                                  <div className="row text-center" id="videoContainer">
                                  </div>
                                  <div className="row">
                                      <div className="col-sm-12 top-margin-20">
                                          <img src="" id="call_other_profile_image" className="img-responsive img-circle img-custom-large pull-left left-margin-30 hidden" />
                                          <span id="inCallOther">Video Call</span> <span id="onCall">on call...</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="hangup-outer">
                                  <button className="btn btn-danger" id="hangup" title="Stop Call" onClick={()=>this.hangup()}>
                                      <span className="fa fa-times"></span>
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="modal fade" id="incomingCallAlert" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" data-backdrop="static" data-keyboard="false">
                  <div className="modal-dialog" role="document">
                      <div className="modal-content">
                          <div className="modal-body">
                              <div className="alert fade in" id="incomingCall">
                                  <img src="/images/default-profile-pic.png" id="incoming_call_alert_other_profile_image" className="img-circle img-custom-medium bottom-margin-20" />
                                  <h4 id="incomingCallFrom">User is calling...</h4>
                                  <p>
                                      <button type="button" className="btn btn-success income-call" id="answerVideo" onClick={()=>this.answerVideo()}>Video</button>
                                      <button type="button" className="btn btn-success income-call" id="answerAudio" onClick={()=>this.answerAudio()}>Audio</button>
                                      <button type="button" className="btn btn-danger income-call" id="reject" onClick={()=>this.reject()}>Reject</button>
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        );
    }
}
