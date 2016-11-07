/**
 * Suggestions Block
 */
import React from 'react';

export default class SuggestionsList extends React.Component {

    constructor(props) {
        super(props);
        this.state ={}; 
    }

    render() {

        let _this = this;
        let suggestions = this.props.suggestions;
        let selectSuggestions = this.props.selectSuggestions;
        let items = this.props.suggestions.map(function(user,key){
            return (
                <li key={key} onClick={() => _this.props.selectSuggestions(user)} >
                    <div className="img-div">
                        <img src={user.images.profile_image.http_url} />
                    </div>
                    <p>{user.first_name} {user.last_name}</p>
                </li>
            );
        });

        return (
            <div className="suggestions-holder users">
                <ul>
                    {items}
                </ul>
            </div>
        )
    }
}
