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
        this.state={
            isNew:this.getUrl(),
            notebook_id:this.getNoteBookId(),
            note_id:this.getNoteId()
        }
    }

    getUrl(){
        let _url = window.location.href;
        if(_url.indexOf('new-note') != -1){
            return true;
        } else{
            return false;
        }
    }

    getNoteBookId(){
        let _url = window.location.href;
        if(_url.indexOf('new-note') != -1){
            return this.props.params.notebook_id;
        } else{
            return null;
        }
    }

    getNoteId(){
        let _url = window.location.href;
        if(_url.indexOf('new-note') != -1){
            return null;
        } else{
            return this.props.params.note_id;
        }
    }



    render() {
        return (
            <div id="pg-newsfeed-page" className="pg-page">
                {
                    this.state.isNew?<Texteditor notebook_id={this.state.notebook_id}/>:<Texteditor note_id={this.state.note_id}/>
                }

            </div>
        );
    }
}
