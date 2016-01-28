import React from 'react'
import Header from '../components/header/Header'
import Signup from '../pages/Signup/Signup';
class Main extends React.Component {
  render() {
    
    return (
      <div>	
      	<Header />
        
          {this.props.children || <Signup />}
       
      </div>
    )
  }
}

module.exports = Main