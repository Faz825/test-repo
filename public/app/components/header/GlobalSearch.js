/**
 * Search Component
 */
import React from 'react';
export default class GlobalSearch extends React.Component{
    constructor(props) {
        super(props);


    }
    render(){
        return(
            <div classNamr="col-xs-7">
                <div className="row row-clr pg-header-search">
                    <input type="text" placeholder="Search..."/>
                    <a href="#"><img src="images/pg-home-v6_17.png" alt="search" className="img-responsive"/></a>
                </div>
            </div>

        );
    }
}