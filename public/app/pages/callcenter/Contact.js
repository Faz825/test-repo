/*
 * Individual contact in contact list
 */

import React from 'react';
import {UserMode, ContactType, CallChannel} from '../../config/CallcenterStats';

export default class Contact extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(user, callChannel) {
        this.props.onCalling(user, callChannel);
    }

    render() {
        let _this = this;
        let contact = this.props.contact;

        let mood, call_type;

        if (contact.mood == UserMode.ONLINE) {
            mood = "online";
        } else if (contact.mood == UserMode.WORK_MODE) {
            mood = "busy";
        } else {
            mood = "offline";
        }

        if (contact.contactType == ContactType.MULTI) {
            call_type = "multi";
        } else if (contact.contactType == ContactType.GROUP) {
            call_type = "group";
        } else {
            call_type = "user";
        }

        return (
            <div className="contact-item">
                <div className="col-sm-6">
                    <div className="image-wrapper">
                        <img src={contact.images.profile_image.http_url}/>
                        <span className={"status " + mood}></span>
                    </div>
                    <div className="name-wrapper">
                        <div className="name-holder">
                            <p className="name">{contact.first_name + " " + contact.last_name}</p>
                        </div>
                        <p className="status">{mood}</p>
                    </div>
                    <div className={"type-icon contact-type " + call_type}>
                        <span></span>
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