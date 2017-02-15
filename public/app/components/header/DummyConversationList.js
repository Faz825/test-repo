import React from 'react';
import moment from 'moment';

export default class DummyConversationList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(id) {
        this.props.onMessaging(id);
    }

    render() {
        return (
            <div className="chat-notification-header" id="unread_chat_list">
                <div className="tab msg-holder">
                    <a href="javascript:void(0)" onClick={()=>this.handleClick(1)}>
                        <div className="chat-pro-img">
                            <img src="https://s3.amazonaws.com/proglobe/dev/5875ed67bd26a065077c000a/57de8bc0-dbcd-11e6-94a2-b9b4609c047e_profile_image.png"/>
                        </div>
                        <div className="chat-body">
                            <span className="connection-name">Gihan Jaya</span>
                            <p className="msg">Hey jaya</p>
                            <span className="chat-date">{moment().format('YY MM dd')}</span>
                        </div>
                    </a>
                </div>
            </div>
        );
    }
}
