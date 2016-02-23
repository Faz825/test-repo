/**
 * This is profile index component
 */
import React from 'react'
import Header from './Header';
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
        return (<Header uname={this.state.uname}/> )
    }

}
export default  Index;