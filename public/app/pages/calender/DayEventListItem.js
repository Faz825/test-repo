/**
 * Day Name Component 
 */
import React from 'react';

export default class DayEventListItem extends React.Component {

    render() {
        return(
            <li>
                <i className="fa fa-circle" aria-hidden="true"></i>
                <span>Custom event #1</span>
                <i className="fa fa-trash-o pull-right" aria-hidden="true"></i>
            </li>
        );
    }
}





