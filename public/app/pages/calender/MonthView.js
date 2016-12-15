/**
 * Month view of the calender
 */
import React from 'react';
import Calender from './Calender';
import Session  from '../../middleware/Session';
import moment from 'moment';

export default class MonthView extends React.Component {

    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
          }

    render() {
        var selected = this.props.selected;
        return (
            <div>
                <Calender selected={selected} changeView={this.props.setDayView}/>
            </div>
        );
    }
}
