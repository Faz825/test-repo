import React from 'react'
import Session  from '../../middleware/Session'

export default class ProfileImg extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      userLogedIn : Session.getSession('prg_lg'),
      imgSrc : "images/default-profile-pic.png"
    }
  }

  componentDidMount(){
    if(this.state.userLogedIn.profile_image){
      this.setState({imgSrc : this.state.userLogedIn.profile_image});
    }
  }

  render() {

    return (
      <div className="pg-top-profile-pic-box">
        <div className="proImgholder">
          <img src={this.state.imgSrc} alt="Profile-Pic" className="img-responsive"/>
        </div>
        <div className="pg-top-profile-pic-options">
            <a href="#"><img src="images/pg-home-v6_06.png" alt="" className="img-responsive"/></a>
            <a href="#"><img src="images/pg-home-v6_20.png" alt="" className="img-responsive"/></a>
        </div>
      </div>
    );
  }
}
