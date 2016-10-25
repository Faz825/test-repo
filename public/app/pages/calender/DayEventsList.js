/**
 * Day Name Component 
 */
import React from 'react';
import DayEventListItem from './DayEventListItem';

export default class DayEventsList extends React.Component {

    render() {
        return(
            <ul className="list-unstyled events-list-area-content-list">
                <DayEventListItem />
            </ul>
        );
    }
}





