/**
 * This is profile index component
 */
import React from 'react';
import Header from './Header';
import EducationalInfo from './EducationalInfo';
import WorkExperience from './WorkExperience';
import SkillsAndInterests from './SkillsAndInterests';
import AddPostElement from '../../components/timeline/AddPostElement';
import ListPostsElement from '../../components/timeline/ListPostsElement'
import Session  from '../../middleware/Session';
import _ from 'lodash';
export default class Index extends React.Component{


    constructor(props) {
        super(props);
        this.state={
            uname:this.getUrl(),
            user:{},
            data:{},
            posts:[]
        };
        this.loadExperiences = this.loadExperiences.bind(this);
        this.loadProfileData = this.loadProfileData.bind(this);
        this.loadExperiences();
        this.loadProfileData();
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
            data:{__pg:page,uname:_this.state.uname,__own:"me"},
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
    loadProfileData(){
        $.ajax({
            url: '/get-profile/'+this.state.uname,
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
    loadExperiences(){
        $.ajax({
            url: '/work-experiences/'+this.state.uname,
            method: "GET",
            dataType: "JSON",
            data:{uname:this.state.uname},
            success: function (data, text) {
                if (data.status.code == 200) {
                    this.setState({data:data.user});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });
    };



    render(){

        return (
            <div id="pg-profile-page" className="loggedUserView pg-page">
                <Header uname={this.state.uname} user={this.state.user} loadExperiences={this.loadExperiences} loadProfileData={this.loadProfileData}/>
                <div className="row row-clr">
                    <div className="container-fluid">
                        <div className="col-xs-10 col-xs-offset-1" id="middle-content-wrapper">
                            <div className="col-xs-6" id="profile-middle-container-left-col">
                                <div id="pg-profile-middle-container-left-col-details">
                                    <div className="row row-clr pg-profile-content">
                                        <EducationalInfo uname={this.state.uname} />
                                        <SkillsAndInterests uname={this.state.uname} />
                                        <WorkExperience uname={this.state.uname} data={this.state.data} loadExperiences={this.loadExperiences} loadProfileData={this.loadProfileData}/>


                                    </div>
                                </div>
                            </div>

                            <div className="col-xs-6" id="newsfeed-middle-container-right-col">
                                <AddPostElement onPostSubmitSuccess ={this.onPostSubmitSuccess.bind(this)}
                                                uname = {this.state.uname}/>
                                <ListPostsElement posts={this.state.posts}
                                                  uname = {this.state.uname}
                                                  onPostSubmitSuccess ={this.onPostSubmitSuccess.bind(this)}/>
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
