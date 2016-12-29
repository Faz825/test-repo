import React from 'react';
import User from "./User";

export default class RecentList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}

    }

    onCalling(user,callType) {
        this.props.onUserCall(user,callType);
    }

    render() {
        let _this = this;
        let recentList = this.props.userList.map(function (user, key) {
            return (
                <User users={user.users} type="recent" key={key} onCalling={_this.onCalling.bind(_this)}/>
            )
        })
        return (
            <div className="recent-list">
                <div className="list-wrapper">
                    {recentList}
                </div>
            </div>
        );
    }
}