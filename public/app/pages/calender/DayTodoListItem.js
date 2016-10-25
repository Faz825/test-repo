/**
 * Day Name Component 
 */
import React from 'react';

export default class DayTodoListItem extends React.Component {

	render() {
		return(
			<li className="active">
				<div className="checkbox-area">
					<input id="check1" name="check" value="check1" type="checkbox" />
					<label for="check1">
						<p>Meeting with web design team</p>
						<p>People in the event</p>
					</label>
				</div>
				<div className="time-wrapper pull-right">9.30 PM</div>
			</li>
        );
    }
}





