import React from "react"
import SidebarManuItem from "../elements/SidebarManuItem"

export default class SidebarNav extends React.Component{
	constructor(props){
		super(props);

		}
	render(){
		let menuItemList = this.props.menuItems;
		let menuItems = menuItemList.items.map((menuobject,key)=>{
				return (	<SidebarManuItem item={menuobject} key={key} />)

		});
		return(
				<div className={"row row-clr pg-"+this.props.side+"-nav-wrapper"}>
					<div className="bx-wrapper">
						<div className="bx-viewport">
									{menuItems}
          	</div>
          </div>
        </div>
		);
	}
}
