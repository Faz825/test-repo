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
        this.updateNotificationPopCount = this.updateNotificationPopCount.bind(this);
    }

    getNotificationCount(){
        if(!this.props.blockSocialNotification){
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
    }

    listenToNotification(){
        if(!this.props.blockSocialNotification){
            let _this = this;

            Socket.listenToNotification(function(data){
                console.log("Got Notification from footer");
                let _notificationType = typeof data.notification_type != "undefined" ? data.notification_type : data.data.notification_type;
    
                if(_notificationType == "Birthday"){
                    _this.state.notificationCount++;
                }else {
                    if (data.user != _this.state.loggedUser.user_name) {
                        console.log("Increase")
                        let _notCount = _this.state.notificationCount;
                        _notCount++;
                        _this.setState({notificationCount: _notCount});
                        _this.updateNotificationPopCount(_notCount);
                    }
                }
    
            });
        }
    }

    onWorkmodeClick(){
        this.props.onWorkmodeClick();
    }

    onNotifiClick(e){
        this.props.onNotifiTypeClick(e.target.id, this.state.notificationCount);
    }

    updateNotificationPopCount(count){
        this.props.onUpdateNotifiPopupCount(count);
    }

    render() {
        let _sesData = Session.getSession('prg_lg');

        let _secretary_image = _sesData.secretary_image_url;

        const {
            notificationCount
            }=this.state;
        let workmodeCSS = (this.props.blockBottom)?" workmode-switched":"";
        //console.log("=====Footer Holder======"+this.props.blockBottom)
        //TODO::
        // if blockBottom true need to hide

        return (
            <div>

                <div className={"row row-clr pg-footer-wrapper "+workmodeCSS}>
                    <div className="pg-footer-left-options-panel">
                        <a href="/notifications">
                            <div className="col-xs-2 pgs-secratery-img">
                                <img src={_secretary_image} alt="Secretary" className="img-responsive" />
                                {notificationCount>0?<span className="counter">{notificationCount}</span>:null}
                            </div>
                        </a>
                        <div className="pg-footer-left-options">
                            <div className="notifi-type-holder">
                                <i className="fa fa-list-alt" id="todos" onClick={(event) => this.onNotifiClick(event)}></i>
                                {notificationCount>0?<span className="notifi-counter">{notificationCount}</span>:null}
                            </div>
                            <div className="notifi-type-holder">
                                <i className="fa fa-globe" id="social" onClick={(event) => this.onNotifiClick(event)}></i>
                                {notificationCount>0?<span className="notifi-counter">{notificationCount}</span>:null}
                            </div>
                            <div className="notifi-type-holder">
                                <i className="fa fa-line-chart" id="productivity" onClick={(event) => this.onNotifiClick(event)}></i>
                                {notificationCount>0?<span className="notifi-counter">{notificationCount}</span>:null}
                            </div>
                        </div>
                    </div>
                    {
                        (this.props.blockBottom)?
                            null
                            :
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
                    }
                    <div className="pg-footer-right-options-panel">
                        <div className="pg-footer-right-options-panel-inner" onClick={this.onWorkmodeClick.bind(this)}>
                            <img src="/images/footer-right-image.png" alt="Logo" className="img-responsive"/>
                            <p>Work Mode</p>
                        </div>
                    </div>

                </div>
            </div>

        );
    }
}
