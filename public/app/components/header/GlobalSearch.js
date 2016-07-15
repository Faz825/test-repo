/**
 * Search Component
 */
import React from 'react';
import Autosuggest from 'react-autosuggest';
import Lib from '../../middleware/Lib'

export default class GlobalSearch extends React.Component{
    constructor(props) {
        super(props);

        this.state={
            value: '',
            suggestions: [],
            suggestionsList : {}
        };

        this.users = [];
        this.onChange = this.onChange.bind(this);
        this.onSuggestionsUpdateRequested = this.onSuggestionsUpdateRequested.bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.renderSuggestion = this.renderSuggestion.bind(this);
        this.loadProfile = this.loadProfile.bind(this);
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

        this.setState({ value: newValue });

        if(newValue.length > 0 && this.users.length < 10){
            $.ajax({
                url: '/get-users/'+newValue,
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

    onSuggestionsUpdateRequested({ value }) {
        this.setState({
            suggestions: this.getSuggestions(value, this.users),
            suggestionsList : this.getSuggestions(value, this.users)
        });
    }

    getSuggestionValue(suggestion) {
        return suggestion.first_name+" "+suggestion.last_name;
    }

    renderSuggestion(suggestion) {
        return (
            <a href="javascript:void(0)" onClick={()=>this.loadProfile(suggestion.user_name)}><span id={suggestion.user_id}>{suggestion.first_name+" "+suggestion.last_name}</span></a>
        );
    }

    loadProfile(user_name){
        console.log("loadProfile" + user_name)
        window.location.href ='/profile/'+user_name
    }

    render(){
        const { value, suggestions, suggestionsList } = this.state;

        const inputProps = {
            placeholder: 'Search...',
            value,
            onChange: this.onChange
        };

        return(
            <div className="col-xs-7">
                <div className="row row-clr pg-header-search">
                    <Autosuggest suggestions={suggestions}
                                 onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested}
                                 getSuggestionValue={this.getSuggestionValue}
                                 renderSuggestion={this.renderSuggestion}
                                 inputProps={inputProps} />
                    <a href="#"><img className="img-responsive" alt="search" src="/images/pg-home-v6_17.png" /></a>
                </div>
            </div>

        );
    }
}