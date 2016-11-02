/**
 * Week view of the calender
 */
import React from 'react';
import Session from '../../middleware/Session';

export default class WeekView extends React.Component {
    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
        this.state={}
    }

    render() {
        return (
            <div id="pg-month-view-page" className="pg-page">
            </div>
        );
    }
}
