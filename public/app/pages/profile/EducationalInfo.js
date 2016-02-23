/**
 * This component is to store education information
 */
import React from 'react';

export default class EducationalInfo extends React.Component{
    constructor(props){
        super(props);

    }
    componentDidMount(){

    }
    render(){
        return (
            <div className="row row-clr">
                <div className="container-fluid">
                    <div className="col-xs-10 col-xs-offset-1" id="middle-content-wrapper">
                        <div className="col-xs-6" id="profile-middle-container-left-col">
                            <div id="pg-profile-middle-container-left-col-details">
                                <div className="row row-clr pg-profile-heading">
                                    <h1>Soham Khaitan Resume</h1>


                                </div>


                            </div>
                        </div>
                        <div className="col-xs-6"></div>
                    </div>
                </div>
            </div>

        );
    }
}


class Education extends React.Component{
    constructor(props){
        super(props);

    }
    componentDidMount(){

    }


}