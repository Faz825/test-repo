import React from 'react'
import Header from '../components/header/Header'
import SignupIndex from '../pages/signup/Index';

import Session  from '../middleware/Session';


class Main extends React.Component {

	constructor(props) {
		super(props);
		

	}


  render() {
  	
    return (
      <div>	
      	<Header />
        		
          {this.props.children || <SignupIndex />}
       
      </div>
    )
  }
}

module.exports = Main