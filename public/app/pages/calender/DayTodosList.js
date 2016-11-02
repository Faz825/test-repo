/**
 * Day Name Component 
 */
import React from 'react';

export default class DayTodosList extends React.Component {

	constructor(props) {
        super(props);
        this.state = {}; 
    }

    render() {

        let _this = this;
		let items = this.props.events.map(function(event,key){
		    // TODO convert description object to HTML and render them.
		    // let rawDescription = event.description;
		    // let contentState = convertFromRaw(event.description);
		    // let html = stateToHTML(event.description);

		    return (
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
		});

		return(
		    <ul className="list-unstyled to-do-list-area-content-list">
		        {items}
		    </ul>
		);
    }
}





