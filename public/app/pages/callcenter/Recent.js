/*
 * Individual call record in recent list
 */

import React from 'react';
import {UserMode, ContactType, CallStatus} from '../../config/CallcenterStats';

export default class Recent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(user, callType) {
        this.props.onCalling(user, callType);
    }

    render() {
        let _this = this;
        let contact = this.props.contact;

        let mood, call_type, call_status;

        if (contact.mood == UserMode.ONLINE) {
            mood = "online";
        } else if (contact.mood == UserMode.WORK_MODE) {
            mood = "busy";
        } else {
            mood = "offline";
        }
        
        if(contact.callStatus == CallStatus.MISSED){
            call_status = "missed";
        }

        if (contact.contactType == ContactType.MULTI) {
            call_type = "multi";
        } else if (contact.contactType == ContactType.GROUP) {
            call_type = "group";
        } else {
            call_type = "user";
        }

        return (
            <div className={"row contact-item " + call_status}>
                <div className="col-sm-6">
                    <div className="image-wrapper">
                        <img src={contact.images.profile_image.http_url}/>
                        <span className={"status " + mood}></span>
                    </div>
                    <div className="name-wrapper">
                        <div className="name-holder">
                            <p className="name">{contact.first_name + " " + contact.last_name}</p>
                            {(contact.calls)? 
                                <span className="num-calls">{"("+contact.calls+")"}</span>
                                :
                                null                            
                            }
                        </div>
                        <p className="status">{mood}</p>
                    </div>
                    <div className="contact-type">
                        <span className={contact.call_type + " call-type-icon"}></span>
                        <p className="call-time">{contact.call_time}</p>
                    </div>
                </div>
                <div className="col-sm-6">
                    <div className="call-ico-wrapper">
                        <button className="call-ico video" onClick={(event)=> {
                            _this.handleClick(contact, "video")
                        }}></button>
                        <button className="call-ico phone" onClick={(event)=> {
                            _this.handleClick(contact, "audio")
                        }}></button>
                    </div>
                </div>
            </div>
        );
    }
}