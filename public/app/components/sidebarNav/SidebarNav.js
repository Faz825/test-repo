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
				<div className={"row row-clr pg-"+this.props.side+"-nav-wrapper"} style={{height: "710px"}}>
					<div className="bx-wrapper" style={{maxWidth: "100%", margin: "0px auto"}}>
						<div className="bx-viewport" style={{width: "100%", overflow: "hidden", position: "relative"}}>
									{menuItems}
          	</div>
          </div>
        </div>
		);
	}
}
