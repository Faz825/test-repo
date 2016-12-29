import React from 'react';
import User from "./User";

export default class ContactList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}
    }

    onCalling(user,callType) {
        this.props.onUserCall(user,callType);
    }

    render() {
        let _this = this;
        let usersList = this.props.userList.map(function (user, key) {
            return (
                <div className="contact-group" key={key}>
                    <p className="group-name">{user.letter}</p>
                    <div className="contact-wrapper">
                        <User users={user.users} type="contact" onCalling={_this.onCalling.bind(_this)}/>
                    </div>
                </div>
            ) 
        })
        return (
            <div className="contacts-list">
                {usersList}
            </div>
        );
    }
}