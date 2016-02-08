/**
 * Logo Component
 */
import React from 'react'
export default class Logo extends React.Component {

    constructor(props) {
        super(props);
    }

    render (){
        return (
            <div className="col-xs-3 pgs-main-logo-area">
                <img src={this.props.url} alt="Logo" />
            </div>
        );
    }
}