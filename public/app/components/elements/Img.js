import React from 'react';
export default class Img extends React.Component{
	render(){
		return (
		    <div className="row row-clr wv-content-image-section" >
                  <img src={this.props.src} alt={this.props.alt} className={this.props.cls}/>
           	</div>
		);
	}
}