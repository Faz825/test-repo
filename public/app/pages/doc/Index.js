/**
 * This is folders index class that handle all
 */
import React from 'react';

export default class Index extends React.Component{
    constructor(props){
        super(props);

        this.state={}
    }

    render(){
        return(
            <div id="pg-doc-page" className="pg-page">
                <div className="row row-clr">
                    <div className="container-fluid">
                        <h2 className="section-text">Doc</h2>
                    </div>
                </div>
            </div>
        );
    }

}
