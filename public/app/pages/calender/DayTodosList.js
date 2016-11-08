/**
 * Day Name Component 
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
            let usersString = event.shared_users.map(function(user,userKey){
            	return <span key={userKey}>{user.name}, </span>
            });

		    return (
		        <li className="active" key={key}>
					<div className="checkbox-area">
						<input id="check1" name="check" value="check1" type="checkbox" />
						<label for="check1" >
							<p dangerouslySetInnerHTML={{__html: htmlC}} ></p>
							<p>People in the To-do: {usersString ? usersString : 'No shared users'}</p>
						</label>
					</div>
					<div className="time-wrapper pull-right">{moment(event.start_date_time).format('LT')}</div>
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





