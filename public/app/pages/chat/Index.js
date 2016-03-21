/**
 * This is chat index component
 */
import React from 'react';
import Button from '../../components/elements/Button';
import TextField from '../../components/elements/TextField'
import Session  from '../../middleware/Session';
import {Alert} from '../../config/Alert';
import ChatHistory from './ChatHistory';
import DetailChat from './DetailChat';
import NewChat from './NewChat';
import _ from 'lodash';
export default class Index extends React.Component{

    constructor(props) {
        super(props);
        this.state= {
            isDetail:this.isDetail(),
            userLogedIn : Session.getSession('prg_lg')
        };
        if(this.state.isDetail == false){
            this.chatWith = this.props.params.chatWith;
        }

    }

    isDetail(){
        var url = window.location.href;
        var urlArr = url.split('chat/');
        if(typeof urlArr[1] != 'undefined' && urlArr[1].indexOf('new-message/') != -1){
            return  false;
        }
        return true;
    }

    renderSelector(){

        if(this.state.isDetail){

            return (

                <div id="pg-profile-page" className="loggedUserView pg-page">
                    <div className="row row-clr">
                        <div className="container-fluid">
                            <div className="col-xs-10 col-xs-offset-1" id="middle-content-wrapper">
                                <div className="col-xs-4" id="profile-middle-container-left-col">
                                    <ChatHistory/>
                                </div>

                                <div className="col-xs-8" id="newsfeed-middle-container-right-col">
                                    <DetailChat/>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>


            )

        } else{
            return (

                <div id="pg-profile-page" className="loggedUserView pg-page">
                    <div className="row row-clr">
                        <div className="container-fluid">
                            <div className="col-xs-10 col-xs-offset-1" id="middle-content-wrapper">
                                <div className="col-xs-4" id="profile-middle-container-left-col">
                                    <ChatHistory/>
                                </div>

                                <div className="col-xs-8" id="newsfeed-middle-container-right-col">
                                    <NewChat chatWith={this.chatWith}/>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>


            )
        }

    }




    render(){

        return this.renderSelector();


    }

}
export default  Index;
