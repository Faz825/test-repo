import React from 'react'

export default class SidebarManuItem extends React.Component{
	onLinkClick(e){
		//e.preventDefault();
	}
	render(){
		let item = this.props.item;

		return(
			<div className="row row-clr pg-nav-item-wrapper">
                <a href={item.link} onClick={this.onLinkClick.bind(this)}>
                    <img className="img-responsive" alt="navigation links" src={"/images/" + item.imgName + ".png"} />
                    <p>{item.name}</p>
                </a>
            </div>
		);
	}
}
