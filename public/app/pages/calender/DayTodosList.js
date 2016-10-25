/**
 * Day Name Component 
 */
import React from 'react';
import DayTodoListItem from './DayTodoListItem';

export default class DayTodosList extends React.Component {

    render() {
        return(
            <ul className="list-unstyled to-do-list-area-content-list">
                <DayTodoListItem />
            </ul>
        );
    }
}





