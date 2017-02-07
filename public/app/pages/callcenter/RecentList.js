import React from 'react';
import Recent from "./Recent";

export default class RecentList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onCalling(user, callType) {
        this.props.onUserCall(user, callType);
    }

    render() {
        let _this = this;

        let recentList = '';
        

        if (typeof this.props.userContacts !== 'undefined' && this.props.userContacts.length > 0) {
            recentList = this.props.userContacts.map(function (oGroupedContacts, key) {
                return (
                    <div className="contact-group" key={key}>
                        <p className="group-name">{oGroupedContacts.letter}</p>

                        <div className="list-wrapper">
                            {oGroupedContacts.users.map(function (oContact) {
                                return (
                                    <Recent key={oContact.user_id} contact={oContact} type="recent"
                                            onCalling={_this.onCalling.bind(_this)}/>
                                )
                            })}
                        </div>
                    </div>
                )
            });
        } else {
            usersList = (<h3 className="no-data">No contacts.</h3>);
        }

        return (
            <div className="recent-list contacts-list">
                {recentList}
            </div>
        );
    }
}