/**
 * User Thumbnail view
 */
import React from 'react';
import ReactTooltip from  'react-tooltip';

const UserBlockThumbView =({user,onClick})=> {

    const user_profile_image = (typeof user.images.profile_image.http_url != 'undefined' )? user.images.profile_image.http_url : "images/"+user.images.profile_image.file_name,
        full_name = user.first_name + " " + user.last_name;

    return (
        <div className="box">
            <div className="boxInner">
                <a href="javascript:void(0)"
                    onClick={()=>onClick(user)}
                    data-tip
                    data-for={user.user_id}
                    ><img src={user_profile_image} />
                </a>
            </div>
            <ReactTooltip id={user.user_id} >
                <span>{full_name}</span>
            </ReactTooltip>
        </div>
    );
};

export default UserBlockThumbView;
