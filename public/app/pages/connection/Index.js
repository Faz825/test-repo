/**
 * This is Connection view file that handle connections
 */
import React from 'react';
import Session  from '../../middleware/Session';
import UserBlockTileView from '../../components/elements/UserBlockTileView';
import UserBlockThumbView from '../../components/elements/UserBlockThumbView';

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
    }
    loadFriendRequests(){
        $.ajax({
            url: '/connection/requests',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },

        }).done(function(data){
            if(data.status.code == 200){
                this.setState({friend_requests:data.req_cons})
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
    onFriendRequestSkip(){
        this.loadFriendRequests();
    }




    loadFriendSuggestions(){
        $.ajax({
            url: '/connection/suggestion',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },

        }).done(function(data){
            if(data.status.code == 200){
                this.setState({friend_suggestions:data.connections})

            }
        }.bind(this));
    }
    onAddFriendSuccess(){
        this.loadFriendSuggestions();
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
    skipRequest(_current_block_ids){

        console.log("FriendRequests->",_current_block_ids)
        this.props.onFriendRequestSkip()
    }

    render(){

        if(typeof this.props.friend_requests.length == 'undefined'){
            return (<div />)
        }


        let _this = this,
            _current_block_ids ="";
        let user_elements = this.props.friend_requests.map(function(friend,key){
            _current_block_ids += friend.user_id+"!$" ;

            return (
                <UserBlockTileView user = {friend}
                                   onAccept = {user=>_this.acceptFriendRequest(user)}
                                   onSkip = {user=>_this.skipRequest(_current_block_ids)}
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
                this.props.onAddFriendSuccess(true)

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
                for(let a = 0;a<_friend_suggestions.length;a++){

                    if(_friend_suggestions[a].user_id == user.user_id){
                        _friend_suggestions.splice(a,1,data.connection);
                        break;

                    }
                }
                this.setState({friend_suggestions:this.state.friend_suggestions});
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