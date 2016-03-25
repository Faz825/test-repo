import React from 'react';
import Session  from '../../middleware/Session';

export default class ChatHistory extends React.Component{
    constructor(props) {
        super(props);
        this.state= {};
    };

    render() {
        return (
            <div className="row row-clr pgs-middle-sign-wrapper changedPassword">
                <div className="container">
                    <div className="containerHolder">
                        History
                        <div class="chats" id="chatList"></div>
                    </div>
                </div>
            </div>
        );
    }
}
