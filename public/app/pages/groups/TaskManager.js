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
            newTasksCount : 0
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
            status : 1 // REQUEST_PENDING: 1, REQUEST_REJECTED: 2, REQUEST_ACCEPTED: 3
        };

        $.ajax({
            url : '/calendar/task/new-list',
            method : "GET",
            data : postData,
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    console.log(data);
                    this.setState({newTasks: data.events, newTasksCount : data.event_count});
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
                priorityList = <PriorityTaskList priority="3" currentGroup={this.state.currentGroup} />
                break;
            case 2:
                priorityList = <PriorityTaskList priority="2" currentGroup={this.state.currentGroup} />
                break;
            default:
                priorityList = <PriorityTaskList priority="1" currentGroup={this.state.currentGroup} />
        }

        var _this = this;
        var newTaskList = this.state.newTasks.map(function(event,key){
            return <NewTask
                        key={key}
                        task={event}
                        loadNewTasks={() => _this.loadNewTasks()}
                        loadPriorityTask={_this.changePriorityTab}/>
        });

        return (
            <section className="group-tasks-content group-content">
                <section className="new-task-holder">
                    <div className="section-header">
                        <h3 className="section-title">New tasks ({this.state.newTasksCount})</h3>
                    </div>
                    { this.state.newTasks.length > 0 ?
                        newTaskList
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
        let user =  Session.getSession('prg_lg');
        this.state = {
            user : user,
            task : this.props.task
        };

        this.acceptTask = this.acceptTask.bind(this);
        this.declineTask = this.declineTask.bind(this);
    }

    declineTask(taskId) {

        var postData = {
            event_id:taskId,
            status : 'REQUEST_REJECTED', // REQUEST_PENDING: 1, REQUEST_REJECTED: 2, REQUEST_ACCEPTED: 3
        };

        $.ajax({
            url : '/calendar/task/respond',
            method : "POST",
            data : postData,
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    this.props.loadNewTasks();
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }

    acceptTask(taskId, taskPriority) {

        var postData = {
            event_id : taskId,
            status : 'REQUEST_ACCEPTED', // REQUEST_PENDING: 1, REQUEST_REJECTED: 2, REQUEST_ACCEPTED: 3
        };

        $.ajax({
            url : '/calendar/task/respond',
            method : "POST",
            data : postData,
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {

                    this.props.loadNewTasks();
                    this.props.loadPriorityTask(taskPriority);
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
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
                    <button className="btn btn-decline" onClick={() => this.declineTask(this.state.task._id)}>Decline</button>
                    <button className="btn btn-accept" onClick={() => this.acceptTask(this.state.task._id, this.state.task.priority)}>Accept</button>
                </div>
            </div>
        );
    }
}

/**
 * Priority tasks list element
 */
export class PriorityTaskList extends React.Component{

    constructor(props) {
        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        this.state = {
            user : user,
            tasks : [],
            tasksCount : 0,
            currentGroup : this.props.currentGroup,
            priority : this.props.priority
        };

        this.priority = this.props.priority;
        this.calendarOrigin = 2; // PERSONAL_CALENDAR || GROUP_CALENDAR
        this.loadEvents = this.loadEvents.bind(this);
    }

    componentWillMount() {
        this.loadEvents();
    }

    componentWillReceiveProps(nextProps) {

        if(nextProps.currentGroup != this.state.currentGroup) {
            this.setState({currentGroup : nextProps.currentGroup});
            this.loadEvents();
        }

        if(nextProps.priority != this.state.priority) {
            this.setState({priority : nextProps.priority});
            this.priority = nextProps.priority;
            this.loadEvents();
        }
    }

    loadEvents() {

        let _month = moment().startOf("day").format("MM");
        let _year = moment().startOf("day").format("YYYY");
        let postData = {
            month : _month,
            year : _year,
            events_type : 3, // 1 - event | 2 - todo | 3 - task
            group_id : this.state.currentGroup._id,
            calendar_origin : this.calendarOrigin,
            priority : this.priority
        };

        $.ajax({
            url : '/calendar/task/priority-list',
            method : "GET",
            data : postData,
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    this.setState({tasks: data.events, tasksCount: data.event_count});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }

    render() {

        var _this = this;
        var taskList = this.state.tasks.map(function(task,key){
            return <PriorityTask task={task} />
        });


        return (
            <div className="priority-task-list">
                <p className="text-right">({this.state.tasksCount}) tasks</p>
                {this.state.tasks.length > 0 ?
                    taskList
                :
                    <p>There are no tasks under priority {this.props.priority}</p>
                }
            </div>
        );
    }
}


/**
 * Priority task element
 */
export class PriorityTask extends React.Component{

    constructor(props) {
        let user =  Session.getSession('prg_lg');
        super(props);
        this.state = {
            task : this.props.task,
            user : user
        };
    }

    componentWillReceiveProps(nextProps) {

        if(nextProps.task != this.state.task) {
            this.setState({task : nextProps.task});
        }
    }

    render() {

        var _this = this;
        var memberList = <span>Only me</span>;
        if(this.state.task.shared_users.length > 0) {
            memberList = this.state.task.shared_users.map(function(member,key){
                return <span className="mem-name">{this.state.task.shared_users.length > key+ ? member.name+',' : member.name}</span>
            });
        }
        return (
            <div className="task-wrapper clearfix">
                <div className="task-info ticked pull-left">
                    <p className="task-title">{this.state.task.plain_text}</p>
                    <p className="task-members clearfix">People on this task : {memberList}</p>
                </div>
                <div className="task-time pull-right">
                    <p className="time">{moment(this.state.task.start_date_time).format('dddd, h.mma')}</p>
                </div>
            </div>
        );
    }
}
