/*
* Rich text editor component
*/
import React from 'react';
import ReactQuill from 'react-quill-editor';

export default class RichTextEditor extends React.Component{
    constructor(props){
        super(props);

        this.state={
            text : (this.props.note)? this.props.note : null
        };

        this.onTextChange = this.onTextChange.bind(this);
    }

    onTextChange(value) {
        this.props.noteText(value.target.value);
        this.setState({text : value.target.value});
    }

    render() {
        return (
            <div className="rich-editor-holder">
                <ReactQuill theme='snow' value={this.state.text} onChange={this.onTextChange} defaultValue =""/>
            </div>
        );
    }
}
