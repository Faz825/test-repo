import React from 'react';
import User from "./User";

export default class StatusList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}

    }

    onCalling(user,callType) {
        this.props.onUserCall(user,callType);
    }

    render() {
        let _this = this;
        let statusList = this.props.userList.map(function (user, key) {
            return (
                <div className="contact-group" key={key}>
                    <p className="group-name">{user.letter}</p>
                    <div className="contact-wrapper">
                        <User users={user.users} type="status" onCalling={_this.onCalling.bind(_this)}/>
                    </div>
                </div>
            )
        })
        return (
            <div className="contacts-list">
                {statusList}
            </div>
        );
    }
}