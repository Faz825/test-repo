/**
 * Created by gihan on 11/28/16.
 */

import React from 'react';
import Session from '../../middleware/Session';
import moment from 'moment-timezone';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import { EditorState, RichUtils, ContentState, convertFromRaw, convertToRaw, Modifier} from 'draft-js';
import Socket  from '../../middleware/Socket';

import EditorField from './EditorField';
import SharedUsers from './SharedUsers';

import 'rc-time-picker/assets/index.css';
import TimePicker from 'rc-time-picker';

export default class WeekDayEventPopUp extends React.Component {
    constructor(props) {
        super(props);
        let user = Session.getSession('prg_lg');
        this.state = {
            user:user,
            eventType:'event',
            sharedWithIds:[],
            sharedWithNames: [],
            defaultEventTime:moment().format('HH:mm'),
            getEditor : false,
            showTimePanel : '',
            showTimePanelWindow : false,
            showUserPanel : '',
            showUserPanelWindow : false,
            msgOn : false,
            errorMsg : ''
        }

        this.loggedUser = user;
        this.sharedWithIds = [];
        this.sharedWithNames = [];
        this.addEvent = this.addEvent.bind(this);
        this.toggleMsg = this.toggleMsg.bind(this);
    }

    componentDidMount() {
        this.setState({getEditor : true});
    }

    componentWillUnmount() {
        this.setState({getEditor : false});
    }

    changeEventType(type) {
        this.setState({eventType:type});
    }

    setSharedUsers(selected) {
        var arrEntries = selected._root.entries;
        if(this.sharedWithIds.indexOf(arrEntries[3][1])==-1){
            this.sharedWithIds.push(arrEntries[3][1]);
            this.sharedWithNames.push(arrEntries[0][1]);
            this.setState({sharedWithIds:this.sharedWithIds, sharedWithNames:this.sharedWithNames, isAlreadySelected:false})
        } else{
            this.setState({isAlreadySelected:true});
            console.log("already selected" + this.state.isAlreadySelected)
        }
    }

    setSharedUsersFromDropDown(selected) {

      if(this.sharedWithIds.indexOf(selected.user_id)==-1){
          this.sharedWithIds.push(selected.user_id);
          this.sharedWithNames.push(selected.first_name+" "+selected.last_name);
          this.setState({sharedWithIds:this.sharedWithIds, sharedWithNames:this.sharedWithNames, isAlreadySelected:false});

      } else{
          this.setState({isAlreadySelected:true});
          console.log("already selected" + this.state.isAlreadySelected)
      }
      return "";
    }

    removeUser(key, name){

        // removing the mention text
        const contentState = this.editor.state.editorState.getCurrentContent();
        const rawContent = convertToRaw(contentState);
        const plainText = contentState.getPlainText();

        const startingAt = plainText.indexOf(name);
        const endingAt = startingAt+name.length;
        const newSelection = this.editor.state.editorState.getSelection().merge({
            anchorOffset: startingAt,
            focusOffset: endingAt
        });
        const newContent = Modifier.removeRange(contentState, newSelection, 'backward');

        const editorState = EditorState.push(this.editor.state.editorState, newContent);
        this.editor.setState({editorState});


        this.sharedWithIds.splice(key,1);
        this.sharedWithNames.splice(key,1);
        this.setState({sharedWithIds : this.sharedWithIds, sharedWithNames : this.sharedWithNames});
    }

    removeUsersByName(arrUsers) {

        var arrKeysToBeRemoved = [];
        for (var i = 0; i < arrUsers.length; i++) {
            arrKeysToBeRemoved.push(this.sharedWithNames.indexOf(arrUsers[i]));

            // indexOf returnes the key of the matching value
            // splice removes the given key form the array.
            this.sharedWithIds.splice(this.sharedWithIds.indexOf(arrUsers[i]),1); 
            this.sharedWithNames.splice(this.sharedWithNames.indexOf(arrUsers[i]),1);

            if(i == (arrUsers.length - 1)) {
                this.setState({sharedWithIds : this.sharedWithIds, sharedWithNames : this.sharedWithNames});        
            }
        }

    }

    setTime(selected) {
        var arrEntries = selected._root.entries;
        var time = arrEntries[1][1];
        let year = this.props.curr_date.year();
        let month = this.props.curr_date.month();
        let date = this.props.curr_date.day();
        let timeWithDay = year+'/'+month+'/'+date+' '+time;

        this.setState({ defaultEventTime: moment(timeWithDay).format('HH:mm') });
    }

    _onHashClick() {
        let showUserPanel = this.state.showUserPanel;
        let showUserPanelWindow = this.state.showUserPanelWindow;
        this.setState({showUserPanel : (showUserPanel == 'active' ? '' : 'active'), showUserPanelWindow : (showUserPanelWindow == true ? false : true) });
    }

    _onAtClick() {
        let showTimePanel = this.state.showTimePanel;
        let showTimePanelWindow = this.state.showTimePanelWindow;
        this.setState({showTimePanel : (showTimePanel == 'active' ? '' : 'active'), showTimePanelWindow : (showTimePanelWindow == true ? false : true) });
    }

    handleTimeChange(time) {
        this.setState({ defaultEventTime: moment(time).format('HH:mm')});
    }

    toggleMsg() {
        this.setState({ msgOn: !this.state.msgOn });
    }

    addEvent(event) {

        const strDate = this.props.curr_date.format('YYYY-MM-DD');
        const strTime = this.state.defaultEventTime;
        const dateWithTime = moment(strDate + ' ' + strTime, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');

        const Editor = this.editor.state.editorState;
        const contentState = this.editor.state.editorState.getCurrentContent();
        const editorContentRaw = convertToRaw(contentState);
        const plainText = contentState.getPlainText();

        // front-end validations
        // TODO: remove this msg showing method after implementing a global way to show error message
        if(!plainText) {
            this.setState({errorMsg : 'Please add the event description'});
            this.toggleMsg();
            setTimeout(this.toggleMsg, 3000);
            return;
        }

        if(dateWithTime < moment().format('YYYY-MM-DD HH:mm')) {
            this.setState({errorMsg : 'Please add a future date and time'});
            this.toggleMsg();
            setTimeout(this.toggleMsg, 3000);
            return;
        }

        // get shared users from SharedUsers field
        const sharedUsers = this.state.sharedWithIds;
        // const sharedUsers = this.refs.SharedUserField.sharedWithIds;
        const postData = {
            description : editorContentRaw,
            plain_text : plainText,
            type : this.state.eventType,
            apply_date : dateWithTime,
            event_time : strTime,
            event_timezone : moment.tz.guess(),
            shared_users : sharedUsers,
        };

        $.ajax({
            url: '/calendar/event/add',
            method: "POST",
            dataType: "JSON",
            data: JSON.stringify(postData),
            headers : { "prg-auth-header" : this.state.user.token },
            contentType: "application/json; charset=utf-8",
        }).done(function (data, text) {
            if(data.status.code == 200){
                const editorState = EditorState.push(this.editor.state.editorState, ContentState.createFromText(''));
                this.editor.setState({editorState});
                this.props.handleClose();

                if(typeof sharedUsers != 'undefined' && sharedUsers.length > 0) {
                    let _notificationData = {
                        cal_event_id:data.events._id,
                        notification_type:"calendar_share_notification",
                        notification_sender:this.loggedUser,
                        notification_receiver:sharedUsers
                    };

                    Socket.sendCalendarShareNotification(_notificationData);
                }

                // load data
                let week_start = moment(this.props.week_startDt).format('YYYY-MM-DD');
                let week_end = moment(this.props.week_startDt).weekday(7).format('YYYY-MM-DD');

                let postData = {
                    start_date:week_start,
                    end_date:week_end
                };
                this.props.loadData(postData);
            }
        }.bind(this));
    }

    _onBoldClick() {
        this.editor.onChange(RichUtils.toggleInlineStyle(this.editor.state.editorState, 'BOLD'));
    }

    _onItalicClick() {
        this.editor.onChange(RichUtils.toggleInlineStyle(this.editor.state.editorState, 'ITALIC'));
    }

    _onUnderLineClick() {
        this.editor.onChange(RichUtils.toggleInlineStyle(this.editor.state.editorState, 'UNDERLINE'));
    }

    render() {

        const showSecond = false;

        const typoPopover = (
            <Popover id="calendar-popover-typo">
                <div className="menu-ico">
                    <p>
                        <span className="bold" onClick={this._onBoldClick.bind(this)}>B</span>
                    </p>
                </div>
                <div className="menu-ico">
                    <p>
                        <span className="italic" onClick={this._onItalicClick.bind(this)}>I</span>
                    </p>
                </div>
                <div className="menu-ico">
                    <p>
                        <span className="underline" onClick={this._onUnderLineClick.bind(this)}>U</span>
                    </p>
                </div>
            </Popover>
        );

        let shared_with_list = [];
        let _this = this;
        if(this.state.sharedWithNames.length > 0){
            shared_with_list = this.state.sharedWithNames.map((name,key)=>{
                return <span key={key} className="user selected-users">{name}<i className="fa fa-times" aria-hidden="true" onClick={(event)=>{_this.removeUser(key, name)}}></i></span>
            });
        } else {
            shared_with_list = <span className="user-label">Only me</span>
        }
        return(
            <ModalContainer zIndex={9999}>
                <ModalDialog className="modalPopup">
                    <div className="popup-holder week-view-editor-popup-holder">
                        <div className="calendar-week-popup-wrapper">
                            <div className="model-header">
                                <div className="model-title-wrapper">
                                    <div className="model-title-inner-wrapper week-popup">
                                        <h4 className="modal-title">{this.state.eventType == 'todo' ? 'to-do' : this.state.eventType }</h4>
                                        <span className="calender-popup-closeBtn" onClick={this.props.handleClose}></span>
                                    </div>
                                </div>
                            </div>
                            <div className="model-body">
                                <div className="calendar-date-wrapper">
                                    <h4>{this.props.curr_date.format('dddd')}</h4>
                                    <p>{this.props.curr_date.format('DD')}</p>
                                </div>
                                <div className="calendar-input-area">
                                    {this.state.getEditor ?
                                        <EditorField
                                            ref={(element) => { this.editor = element; }}
                                            setTime={this.setTime.bind(this)}
                                            setSharedUsers={this.setSharedUsers.bind(this)}
                                            removeUsersByName={this.removeUsersByName.bind(this)}
                                            />
                                    : null }
                                    <div className="shared-users-time-panel row">
                                        <div className="col-sm-3">
                                            <p>
                                                <span onClick={this._onAtClick.bind(this)} className="user-label">Time <span className="selected-time">{this.state.defaultEventTime}</span></span>
                                            </p>
                                            {this.state.showTimePanelWindow ?
                                                <div className={this.state.showTimePanel + " panel time-panel"}>
                                                    <TimePicker
                                                        style={{ width: 100 }}
                                                        showSecond={showSecond}
                                                        defaultValue={moment()}
                                                        onChange={this.handleTimeChange.bind(this)}
                                                    />
                                                </div>
                                                : null}
                                        </div>
                                        <div className="invite-people col-sm-9">
                                            <p>
                                                <span className="user-label" onClick={this._onHashClick.bind(this)}> People in the event : </span>
                                                {shared_with_list}
                                            </p>
                                            {this.state.showUserPanelWindow ?
                                                <SharedUsers
                                                    setSharedUsersFromDropDown={this.setSharedUsersFromDropDown.bind(this)}
                                                    showPanel={this.state.showUserPanel}
                                                    removeUser={this.removeUser}
                                                />
                                            : null }
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className="model-footer">
                                <div className="input-items-outer-wrapper">
                                    <div className="msg-holder pull-left">
                                        {this.state.msgOn ?
                                            <p className="text-danger">{this.state.errorMsg}</p>
                                        : null }
                                    </div>
                                    <ul className="input-items-wrapper pull-right">
                                        <li>
                                            <button className="menu-ico">
                                                <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={typoPopover}>
                                                    <p>A</p>
                                                </OverlayTrigger>
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={this._onHashClick.bind(this)} className="menu-ico">
                                                <i className="fa fa-hashtag" aria-hidden="true"></i>
                                            </button>
                                        </li>

                                        <li>
                                            <button onClick={this._onAtClick.bind(this)} className="menu-ico">
                                                <i className="fa fa-at" aria-hidden="true"></i>
                                            </button>
                                        </li>
                                        <li>
                                            <div className="btn-group">
                                                <button type="button" className={"menu-ico-group btn event " + (this.state.eventType == 'event' ? "active" : null)} onClick={() => this.changeEventType('event')}>
                                                    <i className="fa fa-calendar" aria-hidden="true"></i> Event
                                                </button>
                                                <button type="button" className={"menu-ico-group btn todo " + (this.state.eventType == 'todo' ? "active" : null)} onClick={() => this.changeEventType('todo')}>
                                                    <i className="fa fa-wpforms" aria-hidden="true"></i> To-do
                                                </button>
                                            </div>

                                        </li>
                                        <li>
                                            <button className="menu-ico-txt btn" onClick={this.addEvent}>
                                                <i className="fa fa-paper-plane" aria-hidden="true"></i> Enter
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalDialog>
            </ModalContainer>
        );
    }
}
