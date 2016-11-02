/**
 * Day view of the calender
 */
import React, { Component } from 'react';
import moment from 'moment';
import Session from '../../middleware/Session';
import MiniCalender from './MiniCalender';
import DayEventsList from './DayEventsList';
import DayTodosList from './DayTodosList';

import editorStyles from './editorStyles.css';

import {EditorState, RichUtils} from 'draft-js';
import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor'; // eslint-disable-line import/no-unresolved

import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin'; // eslint-disable-line import/no-unresolved
import createEmojiPlugin from 'draft-js-emoji-plugin'; 

import {convertFromRaw, convertToRaw} from 'draft-js';


// import editorStyles from './editorStyles.css';
import mentions from './mentions';

const mentionPlugin = createMentionPlugin();
const { MentionSuggestions } = mentionPlugin;
// const plugins = [mentionPlugin];

const emojiPlugin = createEmojiPlugin();
const { EmojiSuggestions } = emojiPlugin;
const plugins = [mentionPlugin, emojiPlugin];
const text = ``;


export default class DayView extends Component {

    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
        this.state = {
            currentDay : moment().format('YYYY-MM-DD'),
            defaultType : 'event',
            events : [],
            user : user,
            suggestions: mentions,
            editorState: EditorState.createEmpty(),
        };

        this.currentDay = this.state.currentDay;
        this.addEvent = this.addEvent.bind(this);
        this.nextDay = this.nextDay.bind(this);
        this.changeType = this.changeType.bind(this);


        // this.onChange = (editorState) => this.setState({editorState});
        this.handleKeyCommand = this.handleKeyCommand.bind(this);
        this.focus = this.focus.bind(this);
        // this.onSearchChange = this.onSearchChange.bind(this);
        this.onChange = this.onChange.bind(this);

        this.onSearchChange = ({ value }) => {

            // $.ajax({
            //     url : '/user/get-user-suggestions/'+filter.replace("#", ""),
            //     method : "GET",
            //     dataType : "JSON",
            //     headers : { "prg-auth-header" : this.state.user.token },
            //     success : function (data, text) {
            //         if (data.status.code == 200) {
            //             this.setState({ suggestions: defaultSuggestionsFilter(value, data.suggested_users)});
            //         }
            //     }.bind(this),
            //     error: function (request, status, error) {
            //         console.log(error);
            //     }
            // });

            console.log(" WHAT IS THIS VALUE :::: "+ value);



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

    handleKeyCommand(command) {
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
        if (newState) {
            this.onChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    _onBoldClick() {
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
    }

    _onItalicClick() {
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'));
    }

    _onUnderLineClick() {
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'UNDERLINE'));
    }

    componentDidMount() {
        this.loadEvents();
    }

    loadEvents() {

        $.ajax({
            url : '/calender/get-events-for-specific-day/',
            method : "POST",
            data : { day : this.currentDay }, 
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                console.log(data);
                if (data.status.code == 200) {
                    this.setState({events: data.events});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });

    }

    addEvent(event) {

        const Editor = this.state.editorState;
        const contentState = this.state.editorState.getCurrentContent();
        const editorContentRaw = convertToRaw(contentState);

        var split = moment().toString().split(" ");
        const timeZoneFormatted = split[split.length - 2] + " " + split[split.length - 1];

        const postData = {
            description : editorContentRaw,
            type : (this.state.defaultType == 'todo' ? 2 : 1),
            apply_date : moment(this.state.currentDay).format('MM DD YYYY HH:MM'),
            event_time : moment().format('HH:MM'),
            event_timezone : timeZoneFormatted,
            sharedUserd : []
        };

        $.ajax({
            url: '/calender/add-event',
            method: "POST",
            dataType: "JSON",
            data: postData,
            headers : { "prg-auth-header" : this.state.user.token },
        }).done(function (data, text) {
            if(data.status.code == 200){
                this.loadEvents();
            }
        }.bind(this));
    }

    nextDay() {
        let nextDay = moment(this.state.currentDay).add(1,'days').format('YYYY-MM-DD');
        this.currentDay = nextDay;
        this.setState({currentDay : nextDay});
        this.loadEvents();
    }

    previousDay() {
        let prevDay = moment(this.state.currentDay).add(-1, 'days').format('YYYY-MM-DD');
        this.currentDay = prevDay;
        this.setState({currentDay : prevDay});
        this.loadEvents();
    }

    changeType(eventType) {
        this.setState({defaultType : eventType});
    }

    calenderClick(day) {

        console.log(day);
        let clickedDay =  moment(day.date).format('YYYY-MM-DD');
        this.currentDay = clickedDay;
        this.setState({currentDay : clickedDay});
        this.loadEvents();
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
                                    <p>{moment(this.state.currentDay).format('dddd D, YYYY')}</p>
                                </div>
                            </div>
                            <div className="form-holder">
                                <div className="row calender-input">
                                    <div className="col-sm-12">
                                        <div className="input" >
                                            <div className={editorStyles.editor} onClick={this.focus}>
                                                <Editor
                                                    editorState={this.state.editorState}
                                                    handleKeyCommand={this.handleKeyCommand}
                                                    onChange={this.onChange}
                                                    plugins={plugins}
                                                    ref={(element) => { this.editor = element; }}
                                                    placeholder="Type in an Event or a To-do here use # to tag people, @ to set time of the event"
                                                  />
                                                <EmojiSuggestions 
                                                    onSearchChange={this.onSearchChange}
                                                />
                                                <MentionSuggestions
                                                    onSearchChange={this.onSearchChange}
                                                    suggestions={this.state.suggestions}
                                                />
                                            </div>
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
                                                <p>
                                                    <button onClick={this._onBoldClick.bind(this)}>B</button>
                                                </p>
                                            </div>
                                            <div className="menu-ico">
                                                <p>
                                                    <button onClick={this._onItalicClick.bind(this)}>I</button>
                                                </p>
                                            </div>
                                            <div className="menu-ico">
                                                <p>
                                                    <button onClick={this._onUnderLineClick.bind(this)}>U</button>
                                                </p>
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
                                        <DayTodosList events={this.state.events} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3">
                        <MiniCalender selected={moment(this.currentDay)} changeDay={this.calenderClick.bind(this)} />
                    </div>
                </div>
            </section>
        );
    }
}
