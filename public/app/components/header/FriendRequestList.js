import React from 'react';
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
import Session  from '../../middleware/Session';
import Lib from '../../middleware/Lib';

export default class FriendRequestList extends React.Component {
    constructor(props) {
        super(props);

        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        this.state = {
            seeAll: false,
            loggedUser: Session.getSession('prg_lg'),
            show_request_skip:false,
            show_suggestion_skip:false,
            showFriendRequestNotification: this.props.showFriendRequests,
            my_connections: this.props.my_connections
        };

        this.loadFriendRequests();
        this.allFriendRequest = [];
    }

    componentWillReceiveProps(nextProps) {
        this.setState({my_connections: nextProps.my_connections, showFriendRequestNotification: nextProps.showFriendRequests});
    }

    loadFriendRequests(){
        $.ajax({
            url: '/connection/requests',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data:{ page_count: 10},
        }).done(function(data){
            if(data.status.code == 200){

                let _tmp_req_cons = [];
                if( data.req_cons.length > 0){
                    this.allFriendRequest = data.req_cons;
                }
                this.props.setFriendRequestCount(this.allFriendRequest.length);
                this.setState({friend_requests:this.allFriendRequest});

            }
        }.bind(this));
    }

    toggleRequestList(){
        let _rql = this.state.seeAll;
        this.setState({
            seeAll: !_rql
        });
    }

    acceptFriendRequest(userReq){
        $.ajax({
            url: '/connection/accept',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data:{ sender_id: userReq.user_id},

        }).done(function(data){
            if(data.status.code == 200){
                this.loadFriendRequests();
            }
        }.bind(this));

    }

    declineFriendRequest(userReq){
        $.ajax({
            url: '/connection/decline',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data:{ sender_id: userReq.user_id},

        }).done(function(data){
            if(data.status.code == 200){
                this.loadFriendRequests();
            }
        }.bind(this));
    }

    render() {

        let _this = this;
        let _requestsMap = null;

        if(this.state.friend_requests != undefined) {
            _requestsMap = this.state.friend_requests.map(function(request ,key){
                return (
                    <RequestItem
                        friend_req={request}
                        key={key}
                        acceptRequest={_this.acceptFriendRequest.bind(_this)}
                        declineRequest={_this.declineFriendRequest.bind(_this)}
                    />
                );
            });
        }

        return (
            (this.state.showFriendRequestNotification ?
                <section className="friends-popover-holder">
                    <div className="inner-wrapper">
                        <div className="popover-header">
                            <p className="friend-requests">friend requests</p>
                            <p className="find-friends">find friend</p>
                        </div>
                        <div className={(this.state.seeAll) ? "friends-list-holder see-all" : "friends-list-holder"}>
                            {_requestsMap}
                        </div>
                        {
                            (_dummyRequests.length > 7) ?
                                <div className="popover-footer">
                                    <p className="see-all" onClick={this.toggleRequestList.bind(this)}>{(this.state.seeAll)?"see less":"see all"}</p>
                                </div> : null
                        }

                    </div>
                </section>
                :
                null
            )

        );
    }
}

export class RequestItem extends React.Component {
    constructor(props) {
        super(props);
    }

    acceptFriendRequest() {
        this.props.acceptRequest(this.props.friend_req);
    }

    declineFriendRequest() {
        this.props.declineRequest(this.props.friend_req);
    }

    render (){

        let friend_req = this.props.friend_req;
        let profileImg = friend_req.images.profile_image.http_url;
        let profName = friend_req.first_name + " " +friend_req.last_name;
        let subTitle = friend_req.mutual_connection_count + " mutual Friends";
        let requestedTime = Lib.getRelativeTime(friend_req.created_time);

        return (
            <div className="friends-item">
                <div className="prof-img">
                    <img src={profileImg} className="img-responsive" />
                </div>
                <div className="friends-preview">
                    <h3 className="prof-name">{profName}</h3>
                    <p className="sub-title">{subTitle}</p>
                    <p className="requested-time">{requestedTime}</p>
                </div>
                <div className="controls">
                    <button className="btn btn-decline" onClick={this.declineFriendRequest.bind(this)}>
                        <span className="ico"></span> decline</button>
                    <button className="btn btn-accept" onClick={this.acceptFriendRequest.bind(this)}>
                        <span className="ico"></span> accept</button>
                </div>
            </div>
        );
    }

}
