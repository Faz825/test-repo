import React from 'react'
import Header from '../components/header/Header'
import Signup from '../pages/signup/Signup';
class Main extends React.Component {
  render() {
    console.log(logged_user);
    return (
      <div>	
      	<Header />
        
          {this.props.children || <Signup />}
       
      </div>
    )
  }
}

module.exports = Main