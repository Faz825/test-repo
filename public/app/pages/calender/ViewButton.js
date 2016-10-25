/**
 * ViewButton Component
 */
import React from 'react';

export default class ViewButton extends React.Component {

    constructor(props) {

        super(props);
        this.state = { 
            view : this.props.view,
            value : this.props.value
        };
    }

    goToView() {
        this.setState({ defaultView: this.state.view });
    }

    isActive() {
        return false; // TODO: compleat tbis function
    }
    
    render() {

        return(
            <div className={this.isActive ? 'calender-type active' : 'calender-type'} onClick={this.goToView.bind(this)} >
                <h4>{this.state.value}</h4>
            </div>
        )
    }
}
