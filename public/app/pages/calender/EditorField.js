/**
 * Day view of the calender
 */
import React, { Component } from 'react';
import Session from '../../middleware/Session';

import { EditorState, RichUtils} from 'draft-js';
import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor'; // eslint-disable-line import/no-unresolved

import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin'; // eslint-disable-line import/no-unresolved
import createEmojiPlugin from 'draft-js-emoji-plugin';

import {convertFromRaw, convertToRaw} from 'draft-js';
import { fromJS } from 'immutable';
import timeSuggestions from './timeSuggestions';

// plugins for mentioning the person
const mentionPlugin = createMentionPlugin({
    entityMutability: 'IMMUTABLE',
    mentionPrefix: '#',
    mentionTrigger: '#',
    mentionComponent: (props) => (
        <span data-offset-key={props.entityKey} className={props.className} > {props.decoratedText}</span>
    )
});

// plugins for mentioning the time
const mentionPlugin2 = createMentionPlugin({
    timeSuggestions,
    entityMutability: 'IMMUTABLE',
    mentionPrefix: '@'
});

// mentions for persons
const MentionSuggestions = mentionPlugin.MentionSuggestions;
// mentions for time
const MentionSuggestions2 = mentionPlugin2.MentionSuggestions;

const emojiPlugin = createEmojiPlugin();
const { EmojiSuggestions } = emojiPlugin;
const plugins = [mentionPlugin, emojiPlugin, mentionPlugin2];

export default class EditorField extends Component {

    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
        this.state = {
            user : user,
            suggestions : fromJS([]),
            suggestions2 : timeSuggestions,
            editorState : EditorState.createEmpty(),
        };

        this.focus = this.focus.bind(this);
        this.handleKeyCommand = this.handleKeyCommand.bind(this);
        this.onChange = this.onChange.bind(this);

        this.onSearchChange = ({ value }) => {
            var str = value.replace("#", "");
            if(str.length > 0) {
                $.ajax({
                    url : '/user/get-user-suggestions/'+str,
                    method : "GET",
                    dataType : "JSON",
                    headers : { "prg-auth-header" : this.state.user.token },
                    success : function (data, text) {
                        if (data.status.code == 200) {
                            this.setState({ suggestions: defaultSuggestionsFilter(value, fromJS(data.suggested_users))});
                        }
                    }.bind(this),
                    error: function (request, status, error) {
                        console.log(error);
                    }
                });
            } else {
                this.setState({
                    suggestions: defaultSuggestionsFilter(value, this.state.suggestions),
                });
            }
        };

        this.onSearchChange2 = ({ value }) => {
            this.setState({
                suggestions2: defaultSuggestionsFilter(value, timeSuggestions),
            });
        };
    }

    focus() {
        this.editor.focus();
    }

    onChange(editorState) {
        this.setState({editorState});
    }

    onEventAdd() {
        this.setState({editorState : EditorState.createEmpty()});
    }

    handleKeyCommand(command) {
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
        if (newState) {
            this.onChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    render() {
        const showSecond = false;
        return (
            <div onClick={this.focus}>
                <Editor
                    editorState={this.state.editorState}
                    handleKeyCommand={this.handleKeyCommand}
                    onChange={this.onChange}
                    plugins={plugins}
                    ref={(element) => { this.editor = element; }}
                    placeholder="Type in an Event or a To-do here use # to tag people, @ to set time of the event"
                />
                <EmojiSuggestions />
                <MentionSuggestions
                    onSearchChange={this.onSearchChange}
                    suggestions={this.state.suggestions}
                    onAddMention={this.props.setSharedUsers.bind(this)}
                />
                <MentionSuggestions2
                    onSearchChange={this.onSearchChange2}
                    suggestions={this.state.suggestions2}
                    onAddMention={this.props.setTime.bind(this)}
                />
            </div>
        );
    }
}
