/**
 * Day view of the calender
 */
import React, { Component } from 'react';
import moment from 'moment';
import Session from '../../middleware/Session';
import MiniCalender from './MiniCalender';
import DayEventsList from './DayEventsList';
import DayTodosList from './DayTodosList';

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
                                    <div className="input" >
                                        <Editor
                                            editorState={this.state.editorState}
                                            onChange={this.onChange}
                                            plugins={plugins}
                                            ref={(element) => { this.editor = element; }}
                                            placeholder="Type in an Event or a To-do here use # to tag people, @ to set time of the event"
                                          />
                                        <EmojiSuggestions />
                                        <MentionSuggestions
                                            onSearchChange={this.onSearchChange}
                                            suggestions={this.state.suggestions}
                                            mentionTrigger="#"
                                        />
                                    </div>
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
                                        <DayEventsList day={moment().startOf("day")} />
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
                                        <DayTodosList />
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
