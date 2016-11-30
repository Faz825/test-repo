/**
 * Todo list Component
 */
import React from 'react';
import moment from 'moment';
import {convertFromRaw, convertToRaw} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';

export default class DayTodosList extends React.Component {

	constructor(props) {
        super(props);
        this.state = {};
    }

    render() {

        let _this = this;
        let items = this.props.events.map(function(event,key){
            if(event.type == 1) {
                return;
            }

            let rawDescription = event.description;
            if(rawDescription.hasOwnProperty("entityMap") == false){
                rawDescription.entityMap = [];
            }

            let contentState = convertFromRaw(event.description);
            let htmlC = stateToHTML(contentState);
            // let usersString = event.shared_users.map(function(user,userKey){
            // 	return <span key={userKey}>{user.name}, </span>
            // });
						let usersString = [];
						if(event.shared_users.length > 0 ) {
								usersString = event.shared_users.map(function(user,userKey){
		                return <span className={user.shared_status == 3 ? 'selected-people' : 'people-list'} key={userKey}>{user.name}, </span>
		            });
						} else {
								usersString = <span className="people-list" >Only me</span>
						}

		    return (
		        <li className={event.status == 2 ? 'active' : ''} key={key}>
								<div className="checkbox-area">
										<input id="check1" name="check" value="check1" type="checkbox" />
										<label for="check1" onClick={_this.props.onClickItem.bind(_this, event._id, event.status)} >
												<div dangerouslySetInnerHTML={{__html: htmlC}} ></div>
												<p>People in the To-do : {usersString}</p>
										</label>
								</div>
								<div className="time-wrapper pull-right">{event.event_time}</div>
								<i onClick={_this.props.clickEdit.bind(_this, event._id)} className="fa fa-pencil pull-right edit-icon" aria-hidden="true"></i>
						</li>
		    );
		});

		return(
		    <ul className="list-unstyled to-do-list-area-content-list">
		        {items}
		    </ul>
		);
    }
}
