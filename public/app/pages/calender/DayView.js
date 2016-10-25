/**
 * Day view of the calender
 */
import React, { Component } from 'react';
import moment from 'moment';
import Session from '../../middleware/Session';
import MiniCalender from './MiniCalender';
import Button from '../../components/elements/Button';

import { EditorState } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createEmojiPlugin from 'draft-js-emoji-plugin';
import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin';
import mentions from './mentions';


// emoji plugin
const emojiPlugin = createEmojiPlugin();
const { EmojiSuggestions } = emojiPlugin;

// mention plugin
const mentionPlugin = createMentionPlugin({ mentionTrigger: '#'});
const { MentionSuggestions } = mentionPlugin;

const plugins = [emojiPlugin,mentionPlugin];

export default class DayView extends Component {

    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
  
        this.state = {
            editorState: EditorState.createEmpty(),
            suggestions: mentions,
            isActive: false,
        };

        this.onChange = (editorState) => {
            this.setState({
                editorState,
            });
        };

        this.focus = () => {
            this.editor.focus();
        };

        this.onSearchChange = ({ value }) => {
            this.setState({
              suggestions: defaultSuggestionsFilter(value, mentions),
            });
        };
    }

    render() {
        return (
            <div id="pg-day-view-page" className="pg-page">
                <div className="row">
                    <div className="col-md-8 editor-holder-event">
                        <form>
                            <div>
                                <Editor
                                    editorState={this.state.editorState}
                                    onChange={this.onChange}
                                    plugins={plugins}
                                    ref={(element) => { this.editor = element; }}
                                  />
                                <EmojiSuggestions />
                                <MentionSuggestions
                                  onSearchChange={this.onSearchChange}
                                  suggestions={this.state.suggestions}
                                  mentionTrigger="#"
                                />
                            </div>
                            <div>
                                <Button type="submit" size="2" classes="event-submit" value="Event" />
                                <Button type="submit" size="2" classes="todo-submit" value="Todo" />
                            </div>
                        </form>
                    </div>
                    <div className="col-md-4">
                        <MiniCalender selected={moment().startOf("day")} />
                    </div>
                </div>
            </div>
        );
    }
}
