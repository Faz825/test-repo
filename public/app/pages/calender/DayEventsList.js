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
        let items = this.props.events.map(function(event,key){

            let rawDescription = event.description;
            if(rawDescription.hasOwnProperty("entityMap") == false){
                rawDescription.entityMap = [];
            }

            let contentState = convertFromRaw(event.description);
            let htmlC = stateToHTML(contentState);
            
            return (
                <li key={key}>
                    <i className="fa fa-circle" aria-hidden="true"></i>
                    <div dangerouslySetInnerHTML={{__html: htmlC}} ></div>
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





