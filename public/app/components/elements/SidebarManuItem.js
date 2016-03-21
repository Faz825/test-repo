import React from 'react'
import Session  from '../../middleware/Session';

export default class SidebarManuItem extends React.Component{
	onLinkClick(e){
		//e.preventDefault();
		//console.log(this.props.item.link);
		//$.ajax({
		//	url: this.props.item.link+"/",
		//	method: "GET",
		//	dataType: "JSON",
		//	headers: { 'prg-auth-header':Session.getSession('prg_lg').token },
		//	success: function (data, text) {
        //
		//	},
		//	error: function (request, status, error) {
        //
		//	}
		//});
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
