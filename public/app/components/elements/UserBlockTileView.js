/**
 * User tile view block
 */

import React from 'react';

const UserBlockTileView =({user,onAccept,onAdd,onSkip})=>{


    const user_profile_image = (typeof user.images.profile_image.http_url != 'undefined' )? user.images.profile_image.http_url : "images/"+user.images.profile_image.file_name,
          full_name             = user.first_name +" "+ user.last_name;
    return (

        <div className="col-sm-12 col-md-4 pg-connections-friend-request-item">
            <div className="row row-clr pg-friend-box">
                <div className="row row-clr pg-friend-box-top">
                    <div className="row">
                        <div className="col-xs-5 pg-friend-box-top-left">
                            <img src={user_profile_image}
                                 alt="" className="img-responsive" />
                        </div>
                        <div className="col-xs-7 pg-friend-box-top-right">
                            <h3 className="pg-connections-friend-name">{full_name}</h3>

                            <p className="pg-connections-friend-details">
                                <span className="pg-connections-friend-details-icon">
                                    <img src="images/connections/pg-connections-icon2.png"
                                         alt="" className="/img-responsive center-block"/>
                                </span>
                                {user.cur_working_at}
                            </p>
                                {
                                    (typeof user.country != 'undefined')?
                                        <p className="pg-connections-friend-details">
                                            <span className="pg-connections-friend-details-icon">
                                                <img src="images/connections/pg-connections-icon3.png"
                                                     alt=""
                                                     className="img-responsive center-block"/>
                                            </span>
                                            {user.country}
                                        </p>
                                    :null
                                }
                        </div>
                    </div>
                </div>
                <div className="row row-clr pg-friend-box-bottom">
                    {

                        (typeof onAccept != "undefined") ?
                            <a href="javascript:void(0)"
                               onClick={ () => onAccept(user) }
                               className="pg-fr-bot-btn pg-accept-btn">accept</a>
                            : null
                    }
                    {
                        (typeof onAdd != "undefined")?
                            <a href="javascript:void(0)"
                               className="pg-fr-bot-btn pg-accept-btn"
                               onClick={ () => onAdd(user)} >add</a>
                            :null

                    }

                    <a href="javascript:void(0)"
                       className="pg-fr-bot-btn pg-skip-btn"
                       onClick={()=>onSkip(user)}>Skip</a>

                </div>
            </div>
        </div>
    )

}

export default UserBlockTileView;
