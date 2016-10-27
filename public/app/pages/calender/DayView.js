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

import {convertFromRaw, convertToRaw} from 'draft-js';

// emoji plugin
const emojiPlugin = createEmojiPlugin();
const { EmojiSuggestions } = emojiPlugin;

// mention plugin
const mentionPlugin = createMentionPlugin({mentionTrigger: '#', mentionPrefix: '#',entityMutability: 'IMMUTABLE'});
const { MentionSuggestions } = mentionPlugin;

const plugins = [emojiPlugin,mentionPlugin];

export default class DayView extends Component {

    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
  
        this.state = {
            editorState : EditorState.createEmpty(),
            suggestions : mentions,
            currentDay : moment().format('L'),
            defaultType : 'event',
            events : "DEFAULT EVENTSSSSSSSSSSS"
        };

        this.addEvent = this.addEvent.bind(this);
        this.onChange = this.onChange.bind(this);
        this.nextDay = this.nextDay.bind(this);
        this.focus = this.focus.bind(this);
        this.changeType = this.changeType.bind(this);

        this.onSearchChange = ({ value }) => {
            this.setState({
              suggestions: defaultSuggestionsFilter(value, mentions),
            });
        };
    }

    focus() {
        this.editor.focus();
    }

    onChange(editorState) {
        this.setState({editorState});
    }

    addEvent(event) {
        
        const Editor = this.state.editorState;
        const contentState = this.state.editorState.getCurrentContent();
        const editorContentRaw = convertToRaw(contentState);
        
        var split = new Date().toString().split(" ");
        const timeZoneFormatted = split[split.length - 2] + " " + split[split.length - 1];

        const postData = {
            description : editorContentRaw,
            type : 'TODO',
            apply_date : moment().format('MM DD YYYY HH:MM'),
            event_time : moment().format('HH:MM'),
            event_timezone : timeZoneFormatted,
            sharedUserd : []
        };

        $.ajax({
            url: '/calender/add-event',
            method: "POST",
            dataType: "JSON",
            data: postData
        }).done(function (data, text) {
            if(data.status.code == 200){
                this.setState({events: "Events AFTER AJAX"});
                // this.refreshInterval = setInterval(function(){_this.getRandomNewsArticles()}, 60000);
            }
        }.bind(this));
    }

    componentDidMount() {
        this.loadEvents();
    }

    loadEvents() {

        let _this = this;
        let day = this.props.day;
        $.ajax({
            url: '/calender/get-events-for-specific-day/',
            method: "POST",
            data : { day : day }, 
            dataType: "JSON",
            success: function (data, text) {
                console.log(data);
                if (data.status.code == 200) {
                    this.setState({events: data.events});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });

    }

    nextDay() {
        this.setState({currentDay : moment(this.state.currentDay).add(1,'days').format('L')});
    }

    previousDay() {
        this.setState({currentDay : moment(this.state.currentDay).add(-1, 'days').format('L')});
    }

    changeType(eventType) {
        this.setState({defaultType : eventType});
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
                                        <div className="date-nav" onClick={() => this.previousDay()}>
                                            <i className="fa fa-angle-left" aria-hidden="true"></i>
                                        </div>
                                        <div className="date">
                                            <p>{moment(this.state.currentDay).format('dddd, D')}</p>
                                        </div>
                                        <div className="date-nav" onClick={() => this.nextDay()}>
                                            <i className="fa fa-angle-right" aria-hidden="true"></i>
                                        </div>
                                    </div>
                                    <div className="day-wrapper">
                                        <p>Today</p>
                                    </div>
                                </div>
                                <div className="col-sm-6 calender-date">
                                    <p>{moment().format('dddd D, YYYY')}</p>
                                </div>
                            </div>
                            <div className="form-holder">
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
                                            />
                                        </div>
                                        <div className="calender-input-type">
                                            <p>{this.state.defaultType}</p>
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
                                                <div className={this.state.defaultType == 'event' ? 'btn-toggle active' : 'btn-toggle'} eventType="event" onClick={() => this.changeType('event')} >
                                                    <i className="fa fa-calendar" aria-hidden="true"></i> Event
                                                </div>
                                                <div className={this.state.defaultType == 'todo' ? 'btn-toggle active' : 'btn-toggle'} eventType="todo" onClick={() => this.changeType('todo')} >
                                                    <i className="fa fa-wpforms" aria-hidden="true"></i> To-do
                                                </div>
                                            </div>
                                            <div className="btn-enter" onClick={this.addEvent}>
                                                <i className="fa fa-paper-plane" aria-hidden="true"></i> Enter
                                            </div>
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
                                        <DayEventsList events={this.state.events} day={moment().startOf("day")} />
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
