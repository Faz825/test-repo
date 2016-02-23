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
                <EducationalInfo uname={this.state.uname} />
            </div>
        )
    }

}
export default  Index;