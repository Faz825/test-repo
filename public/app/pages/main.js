import React from 'react'
import Header from '../components/header/Header'

class Main extends React.Component {
  render() {
    
    return (
      <div>	
      	<Header />
        <div style={{ padding: 20 }}>
          This is main app
        </div>
      </div>
    )
  }
}

module.exports = Main