/**
 * Day Name Component 
 */
import React from 'react';
import DayEventListItem from './DayEventListItem';

export default class DayEventsList extends React.Component {

	constructor(props) {
        super(props);
        this.state ={
            day: this.props.day
        }; 
    }

    loadEvents(){
        let _this = this;
        let day = this.props.day;
        $.ajax({
            url: '/get-events-for-specific-day/'+this.state.uname,
            method: "POST",
            data : { day : day }, 
            dataType: "JSON",
            success: function (data, text) {
            	console.log(data);
            	console.log(text);
            	console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
                if (data.status.code == 200) {
                    // this.setState({user:data.profile_data}, function () {
                    //    _this.loadMutualConnection(this.state.user.user_id);
                    // });
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });

    }

    render() {

        var rows = [];
        const { events } = this.props;
        // events.forEach(function(event) {
        //     rows.push(<DayEventListItem description={event.start_date_time} />);
        // });

        return(
            <ul className="list-unstyled events-list-area-content-list">
                // {rows}
            </ul>
        );
    }
}





