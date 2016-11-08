/**
 * Day Name Component 
 */
import React from 'react';
import moment from 'moment';
import {convertFromRaw, convertToRaw} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';

export default class DayEventsList extends React.Component {

	constructor(props) {
        super(props);
        this.state = {}; 
    }

    render() {
        let _this = this;
        let  items = this.props.events.map(function(event,key){
            
            if(event.type == 2) {
                return;
            }

            let rawDescription = event.description;
            if(rawDescription.hasOwnProperty("entityMap") == false){
                rawDescription.entityMap = [];
            }

            let contentState = convertFromRaw(event.description);
            let htmlC = stateToHTML(contentState);
            let usersString = event.shared_users.map(function(user,userKey){
                return <span className="selected-people" key={userKey}>{user.name}, </span>
            });
            return (
                <li key={key}>
                    <i className="fa fa-circle" aria-hidden="true"></i>
                    <div>
                        <div dangerouslySetInnerHTML={{__html: htmlC}} ></div>
                        <div className="people-list-wrapper">
                            <span className="people-list">People on this event:</span>
                            {usersString ? usersString : 'No shared users'}
                        </div>
                    </div>
                    <span className="event-time pull-right">{moment(event.start_date_time).format('LT')}</span>
                </li>
            );
        });

        return(
            <ul className="list-unstyled events-list-area-content-list">
                {items}
            </ul>
        )
    }
}





