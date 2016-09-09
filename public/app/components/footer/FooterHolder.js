import React from 'react'
import Session  from '../../middleware/Session';
import Socket  from '../../middleware/Socket';

export default class FooterHolder extends React.Component{

    constructor(props){
        super(props);
        this.state ={
            notificationCount:0,
            loggedUser:Session.getSession('prg_lg')
        };
        Socket.connect();
        this.listenToNotification();
        this.getNotificationCount();
    }

    getNotificationCount(){
        $.ajax({
            url: '/notifications/get-notification-count',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done( function (data, text) {

            if(data.status.code == 200){
                this.setState({notificationCount:data.count});
            }
        }.bind(this));
    }

    listenToNotification(){
        let _this = this;

        Socket.listenToNotification(function(data){
            console.log("Got Notification from footer")
            if(data.notification_type == "Birthday"){
                _this.state.notificationCount++;
            }else{
                if(data.user != _this.state.loggedUser.user_name){
                    console.log("Increase")
                    let _notCount = _this.state.notificationCount;
                    _notCount++;
                    _this.setState({notificationCount:_notCount});
                }
            }

        });
    }

    render() {
        let _sesData = Session.getSession('prg_lg');

        let _secretary_image = _sesData.secretary_image_url;

        const {
            notificationCount
            }=this.state;

        return (
            <div className="row row-clr pg-footer-wrapper">
                <div className="pg-footer-left-options-panel">
                    <a href="/notifications">
                        <div className="col-xs-2 pgs-secratery-img">

                                <img src={_secretary_image} alt="Secretary" className="img-responsive" />
                                {notificationCount>0?<span className="counter">{notificationCount}</span>:null}

                        </div>
                    </a>
                    <div className="pg-footer-left-options">
                        <a href="#" onClick={event=>onLinkClick(event)}><img src="/images/pg-home-v6_03.png" alt=""
                                                                             className="img-responsive"/></a>
                        <a href="#" onClick={event=>onLinkClick(event)}><img src="/images/pg-home-v6_066.png" alt=""
                                                                             className="img-responsive"/></a>
                        <a href="#" onClick={event=>onLinkClick(event)}><img src="/images/pg-home-v6_08.png" alt=""
                                                                             className="img-responsive"/></a>
                    </div>
                </div>

                <div className="container">
                    <div className="pg-footer-top-control-panel">
                        <a href="#" onClick={event=>onLinkClick(event)}><img src="/images/footer-control-ico-1.png"
                                                                             alt="" className="img-responsive"/>
                            split</a>
                        <a href="#" onClick={event=>onLinkClick(event)}><img src="/images/footer-control-ico-2.png"
                                                                             alt="" className="img-responsive"/>
                            full</a>
                    </div>
                </div>

                <div className="pg-footer-right-options-panel">
                    <div className="pg-footer-right-options-panel-inner">
                        <a href="/work-mode" onClick={event=>onLinkClick(event)}>
                            <img src="/images/footer-right-image.png" alt="Logo" className="img-responsive"/>

                            <p>Work Mode</p>
                        </a>
                    </div>
                </div>
            </div>



        );
    }
}
