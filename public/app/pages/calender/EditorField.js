/**
 * Day view of the calender
 */
import React, { Component } from 'react';
import Session from '../../middleware/Session';

import { EditorState, RichUtils} from 'draft-js';
import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor'; // eslint-disable-line import/no-unresolved

import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin'; // eslint-disable-line import/no-unresolved
import createEmojiPlugin from 'draft-js-emoji-plugin';

import createHashtagPlugin from 'draft-js-priority-plugin';

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
const hashtagPlugin = createHashtagPlugin();
const { EmojiSuggestions } = emojiPlugin;
const plugins = [mentionPlugin, emojiPlugin, mentionPlugin2, hashtagPlugin];



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
                    url : '/connection/get/'+str,
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

        var contentState = this.state.editorState.getCurrentContent();
        var currentContent = editorState.getCurrentContent();
        var currentPlainText = currentContent.getPlainText();
        var plainText = contentState.getPlainText();
        var diff = this.getDifference(currentPlainText, plainText);

        if(currentContent != plainText && plainText.length > currentPlainText.length && diff.includes("#")) {

            var splited = diff.split("#");
            splited = splited.filter(function(v){return v!==''});
            var arrNames = [];
            for (var i = 0; i <= splited.length - 1; i++) {

                var splitedBySpace = splited[i].split(" ");
                var aName = "";

                for (var j = 0; j <= splitedBySpace.length - 1; j++) {
                    aName = splitedBySpace[0]+" "+splitedBySpace[1];
                }
                arrNames.push(aName);
            }

            this.props.removeUsersByName(arrNames);
        }
        this.setState({editorState});
    }

    getDifference(str1, str2) {
        var i = 0;
        var j = 0;
        var result = "";
        while (j < str2.length) {
            if (str1[i] != str2[j] || i == str1.length)
                result += str2[j];
            else
                i++;
            j++;
        }
        return result;
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
                    placeholder="enter an event description"
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
