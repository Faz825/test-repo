/**
 * The Index view of the folder section
 */
import React from 'react';
import {Alert} from '../../config/Alert';
import Session  from '../../middleware/Session';
import FolderList from '../folders/FoldersList';

export default class Index extends React.Component{

    constructor(props) {

        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        this.state = {
            loggedUser : Session.getSession('prg_lg'),
            group: this.props.myGroup,
            members_count:1,
            folders:[]
        };

        this.loadFolders = this.loadFolders.bind(this);
    }

    componentWillMount() {
        this.checkDefaultFolder();
    }

    componentWillReceiveProps(nextProps) {
        if(typeof nextProps.myGroup != 'undefined' && nextProps.myGroup) {
            let _count = typeof nextProps.myGroup.members == 'undefined' ? 1 : nextProps.myGroup.members.length + 1;
            this.setState({group: nextProps.myGroup, members_count: _count});
        }
    }

    checkDefaultFolder(){

        console.log("came to checkDefaultFolder---");
        console.log(this.state.group);

        if(typeof this.state.group != 'undefined') {
            $.ajax({
                url: '/group-folders/count/'+ this.state.group._id,
                method: "GET",
                dataType: "JSON",
                headers: {'prg-auth-header': this.state.loggedUser.token}
            }).done( function (data, text){
                if(data.status.code == 200){
                    console.log("results from checkDefaultFolder");
                    console.log(data);
                    if(data.count == 0){
                        this.addDefaultFolder();
                    } else{
                        this.loadFolders();
                    }
                }
            }.bind(this));
        }

    }

    loadFolders(){

        $.ajax({
            url: '/group-folders/get-all/'+ this.state.group._id,
            method: "GET",
            dataType: "JSON",
            headers: {'prg-auth-header': this.state.loggedUser.token}
        }).done( function (data, text){

            if(data.status.code == 200){
                console.log("results from loadFolders --");
                console.log(data);
                this.setState({folders: data.folders});
            }

        }.bind(this));
    }

    addDefaultFolder(){

        let _members = this.state.group.members;

        let _data = {
            folder_name: this.state.group.name,
            folder_color: "#1b9ed9",
            shared_with: this.state.group.members,
            isDefault: 1,
            folder_type:1,
            group_id:this.state.group._id,
            group_members: _members ? _members : []
        }

        $.ajax({
            url: '/group-folders/add',
            method: "POST",
            dataType: "JSON",
            headers: {'prg-auth-header': this.state.loggedUser.token},
            data: _data
        }).done( function (data, text){
            if (data.status.code == 200) {
                let folders = [data.folder];
                this.setState({folders: folders});
                console.log("folder added  successfully ", folders);
            }
        }.bind(this));
    }

    render() {

        console.log("before loading folder list ");
        console.log(this.state.folders);

        let _this = this;
        let folderList = this.state.folders.map(function(folder,key){
            return (
                <FolderList key={key} folderData={folder} folderCount={key} onLoadFolders={_this.loadFolders.bind(this)} />
            )
        });

        return (
            <section className="group-content">
                <div className="group-folder-container">
                    <section className="folder-header">
                        <div className="row">
                            <div className="col-sm-7">
                                <h2>My Group Folder</h2>
                            </div>
                            <div className="col-sm-5">
                                <div className="search-folder">
                        <span className="inner-addon">
                            <i className="fa fa-search"></i>
                            <input type="text" className="form-control" placeholder="Search"/>
                        </span>
                                </div>
                                <div className="crt-folder">
                                    <button className="btn btn-crt-folder">
                                        <i className="fa fa-plus"></i> New Folder
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="folder-body">
                        {folderList}
                    </section>
                </div>
            </section>
        );
    }
}
