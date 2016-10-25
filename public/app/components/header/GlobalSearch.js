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
        const regex = new RegExp(escapedValue, 'i');
        return data.filter(data => regex.test(data.first_name+" "+data.last_name));
    }

    onChange(event, { newValue }) {

        this.setState({ value: newValue });

        if(newValue.length == 1){
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
        } else if(newValue.length > 1 && this.users.length < 10){
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
        let img = suggestion.images.profile_image.http_url;

        if (typeof img == 'undefined'){
            img = "/images/default-profile-pic.png";
        }

        return (
            <a href="javascript:void(0)" onClick={()=>this.loadProfile(suggestion.user_name)}>
                <div className="suggestion" id={suggestion.user_id}>
                    <div className="img-holder">
                        <img src={img} alt={suggestion.first_name} className="img-responsive" />
                    </div>
                    <span>{suggestion.first_name+" "+suggestion.last_name}</span>
                </div>
            </a>
        );
    }

    loadProfile(user_name){
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
            <div className="search-holder">
                {
                    /** <input type="text" className="form-control" placeholder="Search..." /> 
                    <div className="col-xs-7">
                <div className="row row-clr pg-header-search">
                    <Autosuggest suggestions={suggestions}
                                 onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested}
                                 getSuggestionValue={this.getSuggestionValue}
                                 renderSuggestion={this.renderSuggestion}
                                 inputProps={inputProps} />
                    <a href="#"><img className="img-responsive search-icon" alt="search" src="/images/pg-home-v6_17.png" /></a>
                </div>
            </div>
                    **/
                }
                <Autosuggest suggestions={suggestions}
                                 onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested}
                                 getSuggestionValue={this.getSuggestionValue}
                                 renderSuggestion={this.renderSuggestion}
                                 inputProps={inputProps} />
                <i className="fa fa-search" aria-hidden="true"></i>
            </div>
        );
    }
}
