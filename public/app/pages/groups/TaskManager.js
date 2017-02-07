/**
 * The Group discussion page
 */
import React from 'react';
import moment from 'moment';

import Session  from '../../middleware/Session';
import Lib    from '../../middleware/Lib';

export default class TaskManager extends React.Component{

    constructor(props) {

        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        var group = this.props.myGroup;
        this.state = {
            user : user,
            currentGroup : group
        };
    }

    componentWillReceiveProps(nextProps) {}

    render() {
        return (
            <section className="group-tasks-content group-content">
                <section className="new-task-holder">
                    <div className="section-header">
                        <h3 className="section-title">New tasks (3)</h3>
                    </div>
                    <NewTask />
                </section>
                <section className="priority-task-holder">
                    <div className="section-header clearfix">
                        <h3 className="section-title pull-left">Existing task priorites</h3>
                        <div className="tab-holder">
                            <p className="tab priority-01">Priority 1</p>
                            <p className="tab priority-02">Priority 2</p>
                            <p className="tab priority-03 active">Priority 3</p>
                        </div>
                    </div>
                    <div className="priority-task-list">
                        <ExistingTask />
                    </div>
                </section>
            </section>
        );
    }
}

/**
 * New task element
 */
export class NewTask extends React.Component{

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className="new-task-wrapper clearfix">
                <div className="task-info col-sm-7">
                    <div className="pro-pic pull-left">
                        <img src="/images/user-pro-pic.png" className="img-responsive img-circle" />
                    </div>
                    <div className="task-assigned pull-left clearfix">
                        <p className="task-owner pull-left">Soham Khaitan</p>
                        <span className="assign-txt pull-left">Assigned:</span>
                        <p className="task pull-left"> Get all the chapters of the assignment submitted before the final test</p>
                    </div>
                </div>
                <div className="task-time col-sm-2">
                    <p className="time">Wednesday, 10am</p>
                </div>
                <div className="task-action col-sm-3">
                    <button className="btn btn-decline">Decline</button>
                    <button className="btn btn-accept">Accept</button>
                </div>
            </div>
        );
    }
}


/**
 * Existing task element
 */
export class ExistingTask extends React.Component{

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className="task-wrapper clearfix">
                <div className="task-info ticked pull-left">
                    <p className="task-title">Call with mike on marketing startegy</p>
                    <p className="task-members clearfix">People on this task:
                        <span className="mem-name">Saad El Yamani,</span>
                        <span className="mem-name">Soham Khaitan</span>
                    </p>
                </div>
                <div className="task-time pull-right">
                    <p className="time">Wednesday, 10am</p>
                </div>
            </div>
        );
    }
}
