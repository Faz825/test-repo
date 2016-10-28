/**
 * Day Name Component 
 */
import React from 'react';
import moment from 'moment';
//import {stateToHTML} from 'draft-js-export-html';
import {convertFromRaw, convertToRaw} from 'draft-js';

export default class DayEventsList extends React.Component {

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
                <li key={key}>
                    <i className="fa fa-circle" aria-hidden="true"></i>
                    <span>{event.start_date_time}</span>
                    <i className="fa fa-trash-o pull-right" aria-hidden="true"></i>
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





