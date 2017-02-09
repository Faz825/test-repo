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
            currentGroup : group,
            defaultPriorityTab : 1, // Priority 1 | Priority 2 | Priority 3,
            newTasks : [],
        };

        this.month = moment().startOf("day");
        this.calendarOrigin = 2; // PERSONAL_CALENDAR || GROUP_CALENDAR
        this.changePriorityTab = this.changePriorityTab.bind(this);
        this.loadNewTasks = this.loadNewTasks.bind(this);
    }

    componentWillMount() {
        this.loadNewTasks();
    }

    loadNewTasks() {

        let _month = this.month.format("MM");
        let _year = this.month.format("YYYY");
        let postData = {
            month : _month,
            year : _year,
            events_type : 3, // 1 - event | 2 - todo | 3 - task
            group_id : this.state.currentGroup._id,
            calendar_origin : this.calendarOrigin,
            status : 1 // 1 - pending | 2 - completed | 3 - expired | 4 - cancelled | 5 - accepted
        };

        $.ajax({
            url : '/calendar/month/all',
            method : "GET",
            data : postData,
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    console.log(data);
                    this.setState({newTasks: data.events});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });


    }

    componentWillReceiveProps(nextProps) {}

    changePriorityTab(priority) {
        this.setState({defaultPriorityTab : priority});
    }

    render() {
        var priorityList = '';
        switch (this.state.defaultPriorityTab) {
            case 3:
                priorityList = <ExistingTaskList priority="3" />
                break;
            case 2:
                priorityList = <ExistingTaskList priority="2" />
                break;
            default:
                priorityList = <ExistingTaskList priority="1" />
        }

        return (
            <section className="group-tasks-content group-content">
                <section className="new-task-holder">
                    <div className="section-header">
                        <h3 className="section-title">New tasks (3)</h3>
                    </div>
                    { this.state.newTasks.length > 0 ?
                        this.state.newTasks.map(function(event,key){
                            return <NewTask key={key} task={event} />
                        })
                    :
                        <div className="new-task-wrapper clearfix"><p>There are no new tasks assigned to you</p></div>
                    }
                </section>
                <section className="priority-task-holder">
                    <div className="section-header clearfix">
                        <h3 className="section-title pull-left">Existing task priorites</h3>
                        <div className="tab-holder">
                            <p
                                className={this.state.defaultPriorityTab == 1 ? "active tab priority-01" : "tab priority-01"}
                                onClick={() => this.changePriorityTab(1)}>
                                Priority 1
                            </p>
                            <p
                                className={this.state.defaultPriorityTab == 2 ? "active tab priority-02" : "tab priority-02"}
                                onClick={() => this.changePriorityTab(2)}>
                                Priority 2
                            </p>
                            <p
                                className={this.state.defaultPriorityTab == 3 ? "active tab priority-03" : "tab priority-03"}
                                onClick={() => this.changePriorityTab(3)}>
                                Priority 3
                            </p>
                        </div>
                    </div>
                    {priorityList}
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
        this.state = {
            task : this.props.task
        };

        this.acceptTask = this.acceptTask.bind(this);
        this.declineTask = this.declineTask.bind(this);
    }

    declineTask() {
        console.log(" Decline a taks");
    }

    acceptTask() {
        console.log(" Accept a taks");
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
                        <p className="task pull-left">{this.state.task.plain_text}</p>
                    </div>
                </div>
                <div className="task-time col-sm-2">
                    <p className="time">{moment(this.state.task.start_date_time).format('dddd, h.mma')}</p>
                </div>
                <div className="task-action col-sm-3">
                    <button className="btn btn-decline" onClick={() => this.declineTask()}>Decline</button>
                    <button className="btn btn-accept" onClick={() => this.acceptTask()}>Accept</button>
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

/**
 * Existing task list element
 */
export class ExistingTaskList extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            tasks : []
        };

        this.loadEvents = this.loadEvents.bind(this);
    }

    componentWillMount() {
        this.loadEvents();
    }

    loadEvents() {
        // var data = {
        //     day : this.currentDate,
        //     calendar_origin : this.calendarOrigin,
        //     group_id : this.state.currentGroup._id
        // };
        //
        // $.ajax({
        //     url : '/calendar/day/all',
        //     method : "POST",
        //     data : data,
        //     dataType : "JSON",
        //     headers : { "prg-auth-header" : this.state.user.token },
        //     success : function (data, text) {
        //         if (data.status.code == 200) {
        //             console.log(data);
        //             this.setState({events: data.events});
        //         }
        //     }.bind(this),
        //     error: function (request, status, error) {
        //         console.log(error);
        //     }
        // });
    }

    render() {
        return (
            <div className="priority-task-list">
                {this.state.tasks.length > 0 ?
                    <ExistingTask />
                :
                    <p>There are no tasks under priority {this.props.priority}</p>
                }
            </div>
        );
    }
}
