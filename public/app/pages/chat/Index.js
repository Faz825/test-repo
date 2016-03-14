/**
 * This is chat index component
 */
import React from 'react';
import Session  from '../../middleware/Session';
import _ from 'lodash';
export default class Index extends React.Component{


    constructor(props) {
        super(props);
        this.state={
            uname:this.getUrl(),
            posts:[]
        }
        this.loadPosts(0)
    }

    getUrl(){
        return  this.props.params.uname;
    }
    onPostSubmitSuccess(data){

        let _posts = this.state.posts;
        _posts.unshift(data);
        this.setState({posts:_posts});


    }
    loadPosts(page){

        let user = Session.getSession('prg_lg');
        let _this =  this;
        $.ajax({
            url: '/pull/posts',
            method: "GET",
            dataType: "JSON",
            data:{__pg:page},
            headers: { 'prg-auth-header':user.token },
            success: function (data, text) {
                if(data.status.code == 200){

                    this.setState({posts:data.posts})
                }

            }.bind(this),
            error: function (request, status, error) {
                console.log(status);
                console.log(error);
            }.bind(this)
        });
    }
    render(){

        return (
            <div id="pg-profile-page" className="loggedUserView pg-page">

                <div className="row row-clr">
                    <div className="container-fluid">
                        <div className="col-xs-10 col-xs-offset-1" id="middle-content-wrapper">
                            <div className="col-xs-6" id="profile-middle-container-left-col">
                                <div id="pg-profile-middle-container-left-col-details">
                                    <div className="row row-clr pg-profile-content">



                                    </div>
                                </div>
                            </div>

                            <div className="col-xs-6" id="newsfeed-middle-container-right-col">

                            </div>
                            <div className="col-xs-6"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}
export default  Index;
