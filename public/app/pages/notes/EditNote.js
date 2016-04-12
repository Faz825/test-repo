/**
 * This is notes index class that handle all
 */
import React from 'react';
import Texteditor from '../../components/elements/Texteditor';
import Session from '../../middleware/Session';

export default class EditNote extends React.Component {
    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
        this.state={}
    }

    render() {
        return (
            <div id="pg-newsfeed-page" className="pg-page">
                <Texteditor />
            </div>
        );
    }
}
