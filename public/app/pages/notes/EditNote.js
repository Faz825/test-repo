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
            note_id:this.getNoteId(),
            note:this.getNote()
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

    getNote(){
        let _url = window.location.href;
        if(_url.indexOf('new-note') != -1){
            return null;
        } else{
            let _note_id = this.props.params.note_id;
            let loggedUser = Session.getSession('prg_lg');

            $.ajax({
                url: '/notes/get-note/'+_note_id,
                method: "GET",
                dataType: "JSON",
                headers: { 'prg-auth-header':loggedUser.token }
            }).done( function (data, text) {
                console.log(data);
                if(data.status.code == 200){
                    this.setState({note:data.note});
                }
            }.bind(this));
        }

    }

    render() {
        return (
            <div id="pg-newsfeed-page" className="pg-page">
                {
                    this.state.isNew?<Texteditor notebook_id={this.state.notebook_id}/>:<Texteditor content={this.state.note} note_id={this.state.note_id}/>
                }

            </div>
        );
    }
}
