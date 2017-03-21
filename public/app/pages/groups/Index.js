/**
 * The Index view of the group section
 */
import React from 'react';
import {Alert} from '../../config/Alert';
import Folders  from './Folders';
import Session  from '../../middleware/Session';
import GroupChat  from './GroupChat';
import GroupProfileImageUploader from '../../components/elements/GroupProfileImageUploader';

import SearchMembersField  from './elements/SearchMembersField';

import { Popover } from 'react-bootstrap';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

export default class Index extends React.Component{

    constructor(props) {

        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        this.state = {
            user : user,
            firstStepOpen : false,
            secondStepOpen : false,
            defaultType : 1,
            groups : []
        };
    }

    componentWillMount() {
        var groupPrefix = this.props.params.name;
        let _data = {};
        $.ajax({
            url : '/groups/get-groups',
            method : "POST",
            data : _data,
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    this.setState({groups: data.groups});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }

    openFirstStep() {
        this.closeSecondStep();
        this.setState({firstStepOpen : true});
    }

    closeFirstStep() {
        this.setState({firstStepOpen : false});
    }

    openSecondStep() {
        this.closeFirstStep();
        this.setState({secondStepOpen : true });
    }

    closeSecondStep() {
        this.setState({secondStepOpen : false});
    }

    setType(type) {
        this.setState({defaultType : type});
    }

    createGroup(groupData) {

        // adding the values got from the first step
        groupData['_type'] = this.state.defaultType;
        console.log(groupData);
        $.ajax({
            url: '/groups/add',
            method: "POST",
            dataType: "JSON",
            data: JSON.stringify(groupData),
            headers : { "prg-auth-header" : this.state.user.token },
            contentType: "application/json; charset=utf-8",
        }).done(function (data, text) {
            if(data.status.code == 200){
                this.closeSecondStep();
                this.closeFirstStep();
                if(data.result.name_prefix) {
                    window.location = '/groups/'+data.result.name_prefix;
                }
            }
        }.bind(this));
    }

    render() {
        var groupBlock = '';
        if(this.state.groups.length > 0 ) {
            groupBlock = this.state.groups.map(function(group,userKey){
                return <a className="list-item clearfix" href={'groups/'+group.name_prefix}>
                    <img src={group.group_pic_link ? group.group_pic_link : "images/group/dashboard/grp-icon.png"} alt="Group icon" className="pull-left" />
                    <p className="list-item-title">{group.name}</p>
                </a>
            });
        }
        return (
            <section className="group-dashboard-container">
                <div className="container">
                    <section className="group-dashboard-header">
                        <div className="row">
                            <div className="col-sm-6">
                                <h2>group</h2>
                            </div>
                            <div className="col-sm-6 action-holder">
                                <div className="crt-grp">
                                    <button className="btn btn-crt-grp" onClick={this.openFirstStep.bind(this)}>CREATE A GROUP</button>
                                </div>
                                <div className="search-group">
                                    <span className="inner-addon">
                                        <i className="fa fa-search"></i>
                                        <input type="text" className="form-control" placeholder="Search" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="group-content">
                        <section className="group-list list-holder">
                            <h3 className="list-title">My groups</h3>
                            <div className="list-wrapper clearfix">
                                {groupBlock}
                            </div>
                        </section>
                    </section>
                </div>
                {this.state.firstStepOpen ?
                    <CreateStepOne
                        handleClose={this.closeFirstStep.bind(this)}
                        handleNext={this.openSecondStep.bind(this)}
                        handleType={this.setType.bind(this)}
                    />
                    : null
                }
                {this.state.secondStepOpen ?
                    <CreateStepTwo
                        handleClose={this.closeSecondStep.bind(this)}
                        handleBack={this.openFirstStep.bind(this)}
                        handleCreate={this.createGroup.bind(this)}
                    />
                    : null
                }
            </section>
        );
    }
}

/**
 * Popup 1 - The group creation
 */
export class CreateStepOne extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            activeType : 1
        };
    }

    setType(type) {
        this.setState({activeType : type});
        this.props.handleType(type);
    }

    render() {
        const whatIsGroup = (
            <Popover title="Popover bottom">
                <strong>Lorem ipsum dolor sit amet</strong>  consectetur adipiscing elit.
            </Popover>
        );

        const whatIsCommunity = (
            <Popover title="Popover bottom">
                <strong>Donec pellentesque ante,</strong> nec vulputate eros pretium.
            </Popover>
        );
        return (
            <ModalContainer>
                <ModalDialog className="modalPopup">
                    <div className="popup-holder">
                        <div className="create-group-type-popup">
                            <div className="model-header">
                                <h3 className="modal-title">Create a group</h3>
                                <p className="sub-title">Which type of group would you like to make?</p>
                                <span
                                    className="close-icon"
                                    onClick={this.props.handleClose}
                                ></span>
                            </div>
                            <div className="model-body clearfix">
                                <div className={this.state.activeType == 1 ? 'selected col-sm-6 selector-wrapper' : 'col-sm-6 selector-wrapper'}>
                                    <div className="inner-holder clearfix">
                                        <input type="radio" name="group" id="group-select" />
                                        <label for="group-select" onClick={(type)=>{this.setType(1)}}>
                                            <div className="select-content clearfix">
                                                <img src="images/group/group-icon.png" className="type-icon" />
                                                <div className="type-content">
                                                    <h3 className="type-title">Group</h3>
                                                    <div className="tool-tip clearfix">
                                                        <p className="tool-tip-text">What is group</p>
                                                        <i className="fa fa-question-circle-o" aria-hidden="true"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className={this.state.activeType == 2 ? 'selected col-sm-6 selector-wrapper' : 'col-sm-6 selector-wrapper'}>
                                    <div className="inner-holder clearfix">
                                        <input type="radio" name="group" id="community-select" />
                                        <label
                                            for="community-select"
                                            onClick={(type)=>{this.setType(2)}}
                                            className={this.state.activeType == 2 ? 'selected' : ''}>
                                            <div className="select-content clearfix">
                                                <img src="images/group/community-icon.png" className="type-icon" />
                                                <div className="type-content">
                                                    <h3 className="type-title">Community</h3>
                                                    <div className="tool-tip clearfix">
                                                        <p className="tool-tip-text">What is community</p>
                                                        <i className="fa fa-question-circle-o" aria-hidden="true"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="model-footer">
                                <div className="footer-btn btn-holder">
                                    <button
                                        className="btn btn-default cancel-btn"
                                        onClick={this.props.handleClose}
                                    >Cancel</button>
                                    <button
                                        className="btn btn-default success-btn"
                                        onClick={this.props.handleNext}
                                    >Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalDialog>
            </ModalContainer>
        );
    }
}

/**
 * Popup 1 - The group creation
 */
export class CreateStepTwo extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            groupColor : 'pink',
            groupName : '',
            groupDescription : '',
            members : [],
            sharedWithIds : [],
            groupProfileImgSrc : '',
            groupProfileImgId : ''
        };

        this.sharedWithIds = [];
        this.members = [];
        this.loggedUser = Session.getSession('prg_lg');

        this.setName = this.setName.bind(this);
        this.setDescription = this.setDescription.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
        this.imgUpdated = this.imgUpdated.bind(this);
        this.handleSearchUser = this.handleSearchUser.bind(this);
    }

    setColor(color) {
        this.setState({ groupColor : color});
    }

    setName(event) {
        this.setState({groupName : event.target.value});
    }

    setDescription(event) {
        this.setState({groupDescription : event.target.value});
    }

    handleCreate(event) {
        event.preventDefault();
        var groupData = {
            _name : this.state.groupName,
            _description : this.state.groupDescription,
            _color : this.state.groupColor,
            _members : this.state.members,
            _group_pic_link : this.state.groupProfileImgSrc,
            _group_pic_id : this.state.groupProfileImgId
        }
        this.props.handleCreate(groupData);
    }

    handleSearchUser(sharedWithIds, members){
        this.setState({sharedWithIds: sharedWithIds, members: members});
    }

    imgUpdated(data){

        this.setState({loadingBarIsVisible : true});
        let _this =  this;
        $.ajax({
            url: '/groups/upload-image',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':_this.loggedUser.token },
            data:{image:data,extension:'png'},
            cache: false,
            contentType:"application/x-www-form-urlencoded",
            success: function (data, text) {
                if (data.status.code == 200) {
                    _this.setState({
                        loadingBarIsVisible : false,
                        groupProfileImgSrc : data.upload.http_url,
                        groupProfileImgId : data.upload.document_id
                    });
                }
            },
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });
    }

    colorPicker(e){
        let colorCls = e.target.getAttribute('data-color');
        this.setState({groupColor : colorCls, isFolderClrEmpty: false});
    }

    isActive(value){
        return ((value===this.state.groupColor) ? 'palette active': 'palette');
    }

    render() {
        const { value, suggestions } = this.state;
        const inputProps = {
            placeholder: 'Type a name...',
            value,
            onChange: this.onChange,
            className: 'form-control'
        };
        let shared_with_list = [];
        if(this.state.members.length > 0){
            shared_with_list = this.state.members.map((member,key)=>{
                return <span key={key} className="user">{member.name}<i className="fa fa-times" aria-hidden="true" onClick={(event)=>{this.removeUser(key)}}></i></span>
            });
        }

        return (
            <ModalContainer>
                <ModalDialog className="modalPopup">
                    <div className="popup-holder">
                        <div className="create-group-popup">
                            <div className="model-header">
                                <h3 className="modal-title">Create a group</h3>
                                <span className="close-icon" onClick={this.props.handleClose}></span>
                            </div>
                            <div className="model-body clearfix">
                                <section className="folder-body">
                                    <div className="form-group">
                                        <label for="grpname">Group name</label>
                                        <input type="text" className="form-control" id="grpname" onChange={this.setName}/>
                                    </div>
                                    <div className="form-group invite-people clearfix">
                                        <label>Members</label>
                                        <SearchMembersField
                                            handleSearchUser={this.handleSearchUser}
                                            placeholder=""
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label for="desc">Description</label>
                                        <textarea className="form-control" rows="5" id="desc" onChange={this.setDescription}></textarea>
                                    </div>
                                    <div className="form-group">
                                        <p className="label">Choose a colour</p>
                                        <div className="color-palette">
                                            <div  className={this.state.groupColor == '#ed0677' ? 'active pink' : 'pink'} onClick={(color)=>{this.setColor('#ed0677')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#1b9ed9' ? 'active light-blue' : 'light-blue'} onClick={(color)=>{this.setColor('#1b9ed9')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#a2c73e' ? 'active light-green' : 'light-green'} onClick={(color)=>{this.setColor('#a2c73e')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#b01d5a' ? 'active red' : 'red'} onClick={(color)=>{this.setColor('#b01d5a')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#091652' ? 'active dark-blue' : 'dark-blue'} onClick={(color)=>{this.setColor('#091652')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#bbbdbe' ? 'active gray' : 'gray'} onClick={(color)=>{this.setColor('#bbbdbe')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#067d41' ? 'active dark-green' : 'dark-green'} onClick={(color)=>{this.setColor('#067d41')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <p className="label">Group icon</p>
                                        <div className="btn-holder clearfix">
                                            <div className="btn-default choose-btn upload-btn btn">
                                                <GroupProfileImageUploader className="btn-default upload-btn btn" profileImgSrc={this.state.groupProfileImgSrc} imgUpdated={this.imgUpdated} />
                                                Upload New
                                            </div>

                                        </div>
                                    </div>
                                </section>
                            </div>
                            <div className="model-footer">
                                <div className="footer-btn btn-holder">
                                    <button className="btn btn-default back-btn" onClick={this.props.handleBack}>Back</button>
                                    <button className="btn btn-default cancel-btn" onClick={this.props.handleClose}>Cancel</button>
                                    <button className="btn btn-default success-btn" onClick={this.handleCreate}>Create</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalDialog>
            </ModalContainer>
        );
    }
}
