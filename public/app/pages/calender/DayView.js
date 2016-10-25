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
            <section className="calender-body">
                <div className="row">
                    <div className="col-sm-9">
                        <div className="calender-view">
                            <div className="row view-header">
                                <div className="col-sm-6">
                                    <div className="date-wrapper">
                                        <div className="date-nav">
                                            <i className="fa fa-angle-left" aria-hidden="true"></i>
                                        </div>
                                        <div className="date">
                                            <p>Tuesday, 16</p>
                                        </div>
                                        <div className="date-nav">
                                            <i className="fa fa-angle-right" aria-hidden="true"></i>
                                        </div>
                                    </div>
                                    <div className="day-wrapper">
                                        <p>Today</p>
                                    </div>
                                </div>
                                <div className="col-sm-6 calender-date">
                                    <p>December 16, 2016</p>
                                </div>
                            </div>
                            <div className="row calender-input">
                                <div className="col-sm-12">
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
                                    <div className="input" contenteditable="true" placeholder="Type in an Event or a To-do here use # to tag people, @ to set time of the event"></div>
                                    <div className="calender-input-type">
                                        <p>Event</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row input-menu">
                                <div className="col-sm-12">
                                    <div className="items-wrapper">
                                        <div className="menu-ico">
                                            <p><i className="fa fa-smile-o" aria-hidden="true"></i></p>
                                        </div>
                                        <div className="menu-ico">
                                            <p>A</p>
                                        </div>
                                        <div className="menu-ico">
                                            <p><i className="fa fa-hashtag" aria-hidden="true"></i></p>
                                        </div>
                                        <div className="menu-ico">
                                            <p><i className="fa fa-at" aria-hidden="true"></i></p>
                                        </div>
                                        <div className="toggle-wrapper">
                                            <div className="btn-toggle active">
                                                <i className="fa fa-calendar" aria-hidden="true"></i> Event
                                            </div>
                                            <div className="btn-toggle">
                                                <i className="fa fa-wpforms" aria-hidden="true"></i> To-do
                                            </div>
                                        </div>
                                        <div className="btn-enter">
                                            <i className="fa fa-paper-plane" aria-hidden="true"></i> Enter
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row events-list-area">
                                <div className="col-sm-12">
                                    <div className="events-list-area-content">
                                        <div className="events-list-area-content-title">
                                            <img src="/images/calender/icon-events.png" />
                                            <span>events</span>
                                        </div>
                                        <div className="events-list-area-content-title-hr"></div>
                                        <ul className="list-unstyled events-list-area-content-list">
                                            <li>
                                                <i className="fa fa-circle" aria-hidden="true"></i>
                                                <span>Custom event #1</span>
                                                <i className="fa fa-trash-o pull-right" aria-hidden="true"></i>
                                            </li>
                                            <li>
                                                <i className="fa fa-circle" aria-hidden="true"></i>
                                                <span>Custom event #2</span>
                                                <i className="fa fa-trash-o pull-right" aria-hidden="true"></i>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="row to-do-list-area">
                                <div className="col-sm-12">
                                    <div className="to-do-list-area-content">
                                        <div className="to-do-list-area-content-title">
                                            <img src="/images/calender/icon-to-do.png" /><span>To-Do's</span>
                                        </div>
                                        <div className="to-do-list-area-content-title-hr"></div>
                                        <ul className="list-unstyled to-do-list-area-content-list">
                                            <li className="active">
                                                <div className="checkbox-area">
                                                    <input id="check1" name="check" value="check1" type="checkbox" />
                                                    <label for="check1">
                                                        <p>Meeting with web design team</p>
                                                        <p>People in the event</p>
                                                    </label>
                                                </div>
                                                <div className="time-wrapper pull-right">
                                                    9.30 PM
                                                </div>
                                            </li>
                                            <li className="active">
                                                <input type="checkbox" id="checkbox-lbl-0" />
                                                <label for="checkbox-lbl-0">
                                                    <p>Meeting with web design team</p>
                                                    <p>People in the event</p>
                                                </label>
                                                <div className="time-wrapper pull-right">
                                                    9.30 PM
                                                </div>
                                            </li>
                                            <li className="active">
                                                <input type="checkbox" id="checkbox-lbl-1" />
                                                <label for="checkbox-lbl-1">
                                                    <p>Meeting with web design team</p>
                                                    <p>People in the To-do: <span>Saad Ei Yamani, Ghali El Mouhandiz</span></p>
                                                </label>
                                                <div className="time-wrapper pull-right">
                                                    9.30 PM
                                                </div>
                                            </li>
                                            <li>
                                                <input type="checkbox" id="checkbox-lbl-2" />
                                                <label for="checkbox-lbl-2">
                                                    <p>Meeting with web design team</p>
                                                    <p>People in the To-do: <span>Saad Ei Yamani, Ghali El Mouhandiz</span></p>
                                                </label>
                                                <div className="time-wrapper pull-right">
                                                    9.30 PM
                                                </div>
                                            </li>
                                            <li>
                                                <input type="checkbox" id="checkbox-lbl-3" />
                                                <label for="checkbox-lbl-3">
                                                    <p>Meeting with web design team</p>
                                                    <p>People in the To-do: <span>Saad Ei Yamani, Ghali El Mouhandiz</span></p>
                                                </label>
                                                <div className="time-wrapper pull-right">
                                                    9.30 PM
                                                </div>
                                            </li>
                                            <li className="active">
                                                <input type="checkbox" id="checkbox-lbl-4" />
                                                <label for="checkbox-lbl-4">
                                                    <p>Meeting with web design team</p>
                                                    <p>People in the To-do: <span>Saad Ei Yamani, Ghali El Mouhandiz</span></p>
                                                </label>
                                                <div className="time-wrapper pull-right">
                                                    9.30 PM
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3">
                        <MiniCalender selected={moment().startOf("day")} />
                    </div>
                </div>
            </section>
        );
    }
}
