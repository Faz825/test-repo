import React from 'react';
import Contact from "./Contact";

export default class ContactList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        this.contacts = [];
    }

    onCalling(user, callMode) {
        this.props.onUserCall(user, callMode);
    }

    render() {
        let _this = this;

        let usersList = this.props.userContacts.map(function (oGroupedContacts, key) {
            return (
                <div className="contact-group" key={key}>
                    <p className="group-name">{oGroupedContacts.letter}</p>

                    <div className="contact-wrapper">
                        {oGroupedContacts.users.map(function (oContact) {
                            return (
                                <Contact key={oContact.user_id} contact={oContact} type="contact"
                                         onCalling={_this.onCalling.bind(_this)}/>
                            )
                        })}
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