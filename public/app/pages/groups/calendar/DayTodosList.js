/**
 * Todo list Component
 */
import React from 'react';
import moment from 'moment';
import {convertFromRaw, convertToRaw} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';

import Session from '../../../middleware/Session';

export default class DayTodosList extends React.Component {

	constructor(props) {
		let user =  Session.getSession('prg_lg');
		super(props);
		this.state = {
		user : user
		};
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
			let startDateTime = moment(event.start_date_time).format('YYYY-MM-DD HH:mm');

			let usersString = [];
			let ownerString = '';
			let acceptedClass = 'event-description';
			if(event.user_id ==  _this.state.user.id) {
				acceptedClass = 'event-description accepted';
			}

			if(event.shared_users.length > 0 ) {
				
				usersString = event.shared_users.map(function(user,userKey){
					if(event.user_id ==  _this.state.user.id || (user.shared_status == 3 &&_this.state.user.id == user.id )) {
						acceptedClass = 'event-description accepted';
					}
					if(user.shared_status == 2) {
						return null;
					}
					return <span className={user.shared_status == 3 ? 'selected-people' : 'people-list'} key={userKey}>
								{user.name}{userKey+1 == event.shared_users.length ? '' : ', '}
							</span>;
				});
				if(event.user_id != _this.state.user.id) {
					ownerString = <span className='selected-people'>{event.owner_name}{event.shared_users.length > 0 ? ', ' : ''}</span>
				} else {
					ownerString = <span className='selected-people'>me{event.shared_users.length > 0 ? ', ' : ''}</span>
				}
			} else {
				usersString = <span className="people-list" >Only me</span>
			}

			let ecentClassName = "";
			if(event.status == 2) {
				ecentClassName = ecentClassName.concat('active ');
			}

			if(event._id == _this.props.selectedEvent) {
				ecentClassName = ecentClassName.concat(' bg-success ');
			}

			return (
				<li className={ecentClassName} key={key}>
					<div className={event._id == _this.props.selectedEvent ? 'bg-success checkbox-area ' : 'checkbox-area'}>
						{event.user_id == _this.state.user.id ?
							<input id="check1" name="check" value="check1" type="checkbox" />
						: ''}
						<label for="check1" 
							onClick={event.user_id == _this.state.user.id ? 
								_this.props.onClickItem.bind(_this, event._id, event.status)
								: ''
							} 
							className={event.user_id == _this.state.user.id ? "description-holder" : "description-holder disabled" }
						>
							<div className={acceptedClass} >{event.plain_text}</div>
							<p>People in the To-do : {ownerString}{usersString}</p>
						</label>
						<div className="time-wrapper pull-right">{event.event_time}</div>
						{event.user_id == _this.state.user.id && startDateTime > moment().format('YYYY-MM-DD HH:mm') ?
							<span>
								<i onClick={_this.props.clickEdit.bind(_this, event._id)} className="fa fa-pencil pull-right action-icons edit-icon" aria-hidden="true"></i>
								<i onClick={_this.props.delete.bind(_this, event._id)} className="fa fa-trash pull-right action-icons delete-icon" aria-hidden="true"></i>
							</span>
							: ''
						}
					</div>
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
