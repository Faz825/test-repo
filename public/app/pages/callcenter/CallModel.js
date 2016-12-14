/**
 * This is call center call model component
 */

import React from "react";
import { Popover, OverlayTrigger } from 'react-bootstrap';
import Session from '../../middleware/Session';

export default class CallModel extends React.Component{
	constructor(props){
		super(props);

		this.state={}
	}

	render(){
		let i = (
            <Popover id="popover-contained" className="share-popover-contained callpopup popup-holder" style={{maxWidth: "265px", width: "265px", zIndex: 9999}}>
                <div className="call-center-new-participant">
	                <i className="fa fa-search" aria-hidden="true"></i>
	                <input type="text" className="form-control" placeholder="Type name" />
	            </div>
            </Popover>
        );
		return(
			<div className="popup-holder">
			    <div className="row">
			        <div className="col-sm-12">
			            <div className="active-call-container">
			                <div className="top-nav">
			                    <span className="close-ico" onClick={(e) => this.props.closePopup(e)}></span>
			                    <OverlayTrigger rootClose trigger="click" placement="right" overlay={i}>
			                    	<span className="add-new-ico"></span>
                                </OverlayTrigger>
			                    <span className="minus-ico"></span>
			                    <span className="expand-ico"></span>
			                </div>
			                <div className="active-user-block">
			                    <img src="images/call-center/cc-active-user.png" />
			                    <div className="active-call-nav">
			                        <span className="video"></span>
			                        <span className="mute"></span>
			                        <span className="speaker"></span>
			                        <span className="hang-up"></span>
			                    </div>
			                </div>
			                <div className="participants">
			                    <div className="user-block active">
			                        <img src="images/call-center/participants-1.png" />
			                        <div className="actions-wrapper">
			                            <span className="mute"></span>
			                            <span className="video"></span>
			                        </div>
			                        <span className="active-user"></span>
			                    </div>
			                    <div className="user-block">
			                        <img src="images/call-center/participants-2.png" />
			                        <div className="actions-wrapper">
			                            <span className="mute"></span>
			                            <span className="video"></span>
			                        </div>
			                        <span className="active-user"></span>
			                    </div>
			                    <div className="user-block">
			                        <img src="images/call-center/participants-3.png" />
			                        <div className="actions-wrapper">
			                            <span className="mute"></span>
			                            <span className="video"></span>
			                        </div>
			                        <span className="active-user"></span>
			                    </div>
			                    <div className="user-block">
			                        <img src="images/call-center/participants-4.png" />
			                        <div className="actions-wrapper">
			                            <span className="mute"></span>
			                            <span className="video"></span>
			                        </div>
			                        <span className="active-user"></span>
			                    </div>
			                </div>
			                <div className="call-timer">
			                    <p className="call-status">On Call -</p>
			                    <p className="call-time">00 : 00 : 10</p>
			                </div>
			            </div>
			        </div>
			    </div>
			</div>
		)
	}
}