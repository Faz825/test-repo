/**
 * The Index view of the caleder section
 */
import React from 'react';
import {Alert} from '../../config/Alert';
import Session  from '../../middleware/Session';
import GroupChat  from './GroupChat';

export default class Index extends React.Component{

    constructor(props) {

        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        this.state = {};
    }

    render() {

        return (
            <section className="groups-container">
                <div className="container">
                    <section className="groups-header">
                        <div className="row">
                            <div className="col-sm-3">
                                <h2>Groups</h2>
                            </div>
                            <GroupChat />
                        </div>
                    </section>
                </div>
            </section>
        );
    }
}
