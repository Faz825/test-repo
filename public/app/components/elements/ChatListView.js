/**
 * User Thumbnail view
 */
import React from 'react';

const ChatListView =({chat,onClick})=> {

    const user_profile_image = chat.user.images.profile_image.http_url,
        full_name = chat.user.first_name + " " + chat.user.last_name,
        title = chat.title,
        latest_msg = chat.latestMsg,
        msgDate = chat.date;

    return (
        <div className="tab msg-holder">
            <a href="javascript:void(0)"
               onClick={()=>onClick(title)}>
                <div className="chat-pro-img">
                    <img src={user_profile_image}/>
                </div>
                <div class="chat-body">
                    <span class="connection-name">{full_name}</span>
                    <p class="msg">{latest_msg}</p>
                    <span class="chat-date">{msgDate}</span>
                </div>
            </a>
        </div>
    );
};

export default ChatListView;