import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import Lib from '../../../middleware/Lib';
import Session from '../../../middleware/Session';

export default class SharedUsers extends Component {

    constructor(props) {
        super(props);

        this.state = {
            user : Session.getSession('prg_lg'),
            value : '',
            suggestions : [],
            suggestionsList : {},
            sharedWithNames : [],
            sharedWithIds : [],
            isAlreadySelected : false
        };

        this.users = [];
        this.sharedWithIds = (this.state.sharedWithIds ? this.state.sharedWithIds : [] );
        this.sharedWithNames = (this.state.sharedWithNames ? this.state.sharedWithNames : []);

        this.onChange = this.onChange.bind(this);
        this.onSuggestionsUpdateRequested = this.onSuggestionsUpdateRequested.bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.renderSuggestion = this.renderSuggestion.bind(this);
        this.removeUser = this.removeUser.bind(this);
        this.getSuggestions = this.getSuggestions.bind(this);
    }

    removeUser(key){
        this.sharedWithIds.splice(key,1);
        this.sharedWithNames.splice(key,1);
        this.setState({sharedWithIds : this.sharedWithIds, sharedWithNames : this.sharedWithNames});
        this.props.removeUser(key);
    }

    renderToken(token) {
        return {
            facet: token.field,
            description: token.name,
            dropdownMenu: token.dropdownOptions
        };
    }

    getSuggestions(value, data) {

        const escapedValue = Lib.escapeRegexCharacters(value.trim());
        if (escapedValue === '') {
            return [];
        }
        const regex = new RegExp('^' + escapedValue, 'i');
        return data.filter(data => regex.test(data.first_name+" "+data.last_name));
    }

    onChange(event, { newValue }) {
        this.setState({ value: newValue, isAlreadySelected:false });

        if(newValue.length == 1){
            $.ajax({
                url: '/connection/search/'+newValue,
                method: "GET",
                dataType: "JSON",
                headers : { "prg-auth-header" : this.state.user.token },
                success: function (data, text) {
                    if(data.status.code == 200){
                        this.users = data.suggested_users;
                        this.setState({
                            suggestions: this.getSuggestions(newValue, this.users),
                            suggestionsList : this.getSuggestions(newValue, this.users)
                        });
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(request.responseText);
                    console.log(status);
                    console.log(error);
                }.bind(this)
            });
        } else if(newValue.length > 1 && this.users.length < 10){
            $.ajax({
                url: '/connection/search/'+newValue,
                method: "GET",
                dataType: "JSON",
                success: function (data, text) {
                    if(data.status.code == 200){
                        this.users = data.suggested_users;
                        this.setState({
                            suggestions: this.getSuggestions(newValue, this.users),
                            suggestionsList : this.getSuggestions(newValue, this.users)
                        });
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(request.responseText);
                    console.log(status);
                    console.log(error);
                }.bind(this)
            });
        }
    }

    getSuggestionValue(suggestion) {

        if(this.sharedWithIds.indexOf(suggestion.user_id)==-1){
            this.sharedWithIds.push(suggestion.user_id);
            this.sharedWithNames.push(suggestion.first_name+" "+suggestion.last_name);
            this.setState({sharedWithIds:this.sharedWithIds, sharedWithNames:this.sharedWithNames, isAlreadySelected:false});
            this.props.setSharedUsersFromDropDown(suggestion);
        } else{
            this.setState({isAlreadySelected:true});
            console.log("already selected: " + this.state.isAlreadySelected)
        }

        return "";
    }

    onSuggestionsUpdateRequested({ value }) {
        this.setState({
            suggestions: this.getSuggestions(value, this.users),
            suggestionsList : this.getSuggestions(value, this.users)
        });
    }

    renderSuggestion(suggestion) {
        return (
            <div id={suggestion.user_id} className="suggestion-item">
                <img className="suggestion-img" src={suggestion.images.profile_image.http_url} alt={suggestion.first_name} />
                <span>{suggestion.first_name+" "+suggestion.last_name}</span>
            </div>
        );
    }

    render() {

        const { value, suggestions, suggestionsList } = this.state;
        const inputProps = {
            placeholder: 'Type a name...',
            value,
            onChange: this.onChange,
            className: 'form-control',
        };

        // let shared_with_list = [];

        // if(this.state.sharedWithNames.length > 0){
        //     shared_with_list = this.state.sharedWithNames.map((name,key)=>{
        //         return <span key={key} className="user selected-users">{name}<i className="fa fa-times" aria-hidden="true" onClick={(event)=>{this.removeUser(key)}}></i></span>
        //     });
        // }

        return (
            <div className={this.props.showPanel + " panel user-panel"}>
                <Autosuggest suggestions={suggestions}
                    onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested}
                    getSuggestionValue={this.getSuggestionValue}
                    renderSuggestion={this.renderSuggestion}
                    inputProps={inputProps}
                />
            </div>
        )
    }
}
