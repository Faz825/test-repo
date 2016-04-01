/**
 * This is Connection view file that handle connections
 */
import React from 'react';
import Session  from '../../middleware/Session';
import UserBlockTileView from '../../components/elements/UserBlockTileView';
import UserBlockThumbView from '../../components/elements/UserBlockThumbView';
import Lib from '../../middleware/Lib';
export default class Index extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            friend_requests:[],
            friend_suggestions:[],
            my_connections:[]
        };

        this.loggedUser = Session.getSession('prg_lg');

        this.loadFriendRequests();
        this.loadFriendSuggestions();
        this.loadMyConnections();
        this.allFriendRequest = [];

    }
    loadFriendRequests(){
        $.ajax({
            url: '/connection/requests',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },

        }).done(function(data){
            if(data.status.code == 200){



                let _tmp_req_cons = [];
                if( data.req_cons.length > 0){
                    this.allFriendRequest = data.req_cons;
                    let _end = (this.allFriendRequest.length < 3)?this.allFriendRequest.length:3;
                    for(let a = 0 ; a < _end;a++){
                        _tmp_req_cons.push(this.allFriendRequest[a]);
                    }

                }

                this.setState({friend_requests:_tmp_req_cons})
            }



        }.bind(this));
    }
    onAcceptFriendRequestSuccess(isAccept){
        this.loadFriendRequests();
        let _this =  this;
        window.setTimeout(function() {
            _this.loadMyConnections();
            console.log("am I .")
        }, 2000);

    }
    onFriendRequestSkip(user,_current_block_ids){
        let _friend_request = this.state.friend_requests;
        let _new_friend_request_list = [];

        if(this.allFriendRequest.length > 2 ){
            console.log(_current_block_ids);
            console.log(this.allFriendRequest);
            for(let a = 0 ; a < this.allFriendRequest.length;a++){
                if(_current_block_ids.indexOf(this.allFriendRequest[a].user_id) == -1){
                    _new_friend_request_list.push(this.allFriendRequest[a]);
                }
            }



            //REPLACE NEW OBJECT
            let _skipped_user_position = _current_block_ids.indexOf(user.user_id);
            let rand_number = Lib.getRandomInt(0,_new_friend_request_list.length - 1);
console.log(rand_number)
            let new_friend_request = _new_friend_request_list[rand_number];

            _friend_request.splice(_skipped_user_position,1,new_friend_request);


        }

        this.setState({friend_requests:_friend_request});




    }




    loadFriendSuggestions(){
        $.ajax({
            url: '/connection/suggestion',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },

        }).done(function(data){
            if(data.status.code == 200){

                this.setState({friend_suggestions:data.connections});

            }
        }.bind(this));
    }
    onAddFriendSuccess(){

        location.reload();
    }
    onFriendSuggestionSkip(){
        this.loadFriendSuggestions();
    }



    loadMyConnections(){
        $.ajax({
            url: '/connection/me',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },

        }).done(function(data){
            if(data.status.code == 200){
                this.setState({my_connections:data.my_con})

            }
        }.bind(this));
    }

    render(){
        const {
            friend_requests,
            friend_suggestions,
            my_connections
            }=this.state;


        return (

            <div className="pg-page" id="pg-connections-page">
                <div className="pg-connections-wrapper">
                    <div className="row row-clr pg-connections-page-header">
                        <div className="col-xs-10 col-xs-offset-1">
                            <div className="row">
                                <div className="col-xs-6">
                                    <h2 className="pg-connections-page-header-title">Connections</h2>
                                </div>

                            </div>
                        </div>
                    </div>
                    {
                        (friend_requests.length > 0 )?
                            <FriendRequests friend_requests={friend_requests}
                                            onAcceptFriendRequestSuccess ={this.onAcceptFriendRequestSuccess.bind(this)}
                                            onFriendRequestSkip = {this.onFriendRequestSkip.bind(this)}
                                            loggedUser = {this.loggedUser}/>
                            :null
                    }

                    {
                        (friend_suggestions.length > 0 )?
                            <FriendSuggestions friend_suggestions = {friend_suggestions}
                                               loggedUser = {this.loggedUser}
                                               onAddFriendSuccess={this.onAddFriendSuccess.bind(this)}
                                />
                            :null
                    }

                    {
                        (my_connections.length > 0)?
                            <MyConnections my_connections = {my_connections}/>
                            :null
                    }

                </div>
            </div>
        )

    }
}



export class FriendRequests extends React.Component{

    constructor(props){
        super(props)
        this.state ={};
        this.loggedUser = this.props.loggedUser;
    }

    acceptFriendRequest(user){
        $.ajax({
            url: '/connection/accept',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data:{ sender_id: user.user_id},

        }).done(function(data){
            if(data.status.code == 200){
                this.props.onAcceptFriendRequestSuccess(true)

            }
        }.bind(this));

    }
    skipRequest(user,_current_block_ids){

        this.props.onFriendRequestSkip(user,_current_block_ids)
    }

    render(){

        if(typeof this.props.friend_requests.length == 'undefined'){
            return (<div />)
        }


        let _this = this,
            _current_block_ids =[];
        let user_elements = this.props.friend_requests.map(function(friend,key){
            _current_block_ids.push(friend.user_id);
            return (
                <UserBlockTileView user = {friend}
                                   onAccept = {user=>_this.acceptFriendRequest(user)}
                                   onSkip = {user=>_this.skipRequest(user,_current_block_ids)}
                                   key = {key}/>
            );
        });

        return(
            <div className="row row-clr pg-connections-friend-request-section">
                <div className="col-xs-10 col-xs-offset-1">
                    <div className="row row-clr">
                        <h1 className="pg-connections-friend-request-section-header-txt">Friend Requests</h1>
                    </div>
                    <div className="row">
                        {user_elements}

                    </div>
                </div>
            </div>
        );
    }

}



export class FriendSuggestions  extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            friend_suggestions :this.props.friend_suggestions
        };
        this.loggedUser = this.props.loggedUser;


    }

    onAddFriend(user){
        let _connectedUsers = [];
        _connectedUsers.push(user.user_id)
        $.ajax({
            url: '/connection/send-request',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data:{ connected_users: JSON.stringify(_connectedUsers)},

        }).done(function(data){
            if(data.status.code == 200){
                this.props.onAddFriendSuccess(true);


            }
        }.bind(this));

    }

    skipRequest(user,_current_block_ids){

        $.ajax({
            url: '/connection/skip-request',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data:{ hit_b_id:user.user_id,cur_b_ids: JSON.stringify(_current_block_ids)},

        }).done(function(data){
            if(data.status.code == 200){
                let _friend_suggestions = this.state.friend_suggestions;
                if(data.connection){
                    for(let a = 0;a<_friend_suggestions.length;a++){

                        if(_friend_suggestions[a].user_id == user.user_id){
                            _friend_suggestions.splice(a,1,data.connection);
                            break;

                        }
                    }
                }

                this.setState({friend_suggestions:_friend_suggestions});
            }
        }.bind(this));
    }

    render(){
        const {friend_suggestions} =this.state;
        let _this = this,
            _current_block_ids =[];
        let user_elements = friend_suggestions.map(function(friend,key){
            _current_block_ids.push(friend.user_id);
            return (
                <UserBlockTileView user = {friend}
                                   onAdd = {user=>_this.onAddFriend(user)}
                                   onSkip = {user=>_this.skipRequest(user,_current_block_ids)}
                                   key = {key}/>


            );
        });

        return(
            <div className="row row-clr pg-connections-friend-suggesion-section">
                <div className="col-xs-10 col-xs-offset-1">
                    <div className="row row-clr">
                        <h1 className="pg-connections-friend-request-section-header-txt">FRIEND SUGGESTIONS</h1>
                    </div>
                    <div className="row">
                        {user_elements}

                    </div>
                </div>
            </div>
        );
    }
}




export class MyConnections  extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            my_connections:[],

        };


    }


    onUserSelect(user){
        location.href = "/profile/"+user.user_name;
    }

    render(){
        if(typeof this.props.my_connections == 'undefined'){
            return (<div />)
        }
        let _this = this;
        let user_elements = this.props.my_connections.map(function(friend,key){

            return (
                <UserBlockThumbView user = {friend}
                                    onClick = {user=>_this.onUserSelect(user)}
                                    key = {key}/>


            );
        });
        return(
            <div className="pg-my-connections-wrapper">
                <div className="row row-clr pg-connections-page-header2">
                    <div className="col-xs-10 col-xs-offset-1">
                        <div className="row">
                            <div className="col-xs-4 col-md-3">
                                <h2 className="pg-connections-page-header-title2">MY CONNECTIONS</h2>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row row-clr">
                    <div className="col-xs-10 col-xs-offset-1">
                        <div className="wrap">
                            {user_elements}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}