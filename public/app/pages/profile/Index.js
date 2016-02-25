/**
 * This is profile index component
 */
import React from 'react'
import Header from './Header';
import EducationalInfo from './EducationalInfo'
export default class Index extends React.Component{


    constructor(props) {
        super(props);
        this.state={
            uname:this.getUrl()
        }
        console.log()
    }

    getUrl(){
        return  this.props.params.uname;
    }

    render(){
        return (
            <div id="pg-profile-page" className="pg-page">
                <Header uname={this.state.uname}/>
                <div className="row row-clr">
                    <div className="container-fluid">
                        <div className="col-xs-10 col-xs-offset-1" id="middle-content-wrapper">
                            <div className="col-xs-6" id="profile-middle-container-left-col">
                                <div id="pg-profile-middle-container-left-col-details">

                                        <EducationalInfo uname={this.state.uname} />

                                </div>
                            </div>
                            <div className="col-xs-6"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}
export default  Index;
