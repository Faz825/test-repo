import React from 'react'

export default class NewsCategoryListItem extends React.Component{
	constructor(props){
		super(props);
		this.state={selected : ""};

		this.onCategorySelect = this.onCategorySelect.bind(this);
	}

	onCategorySelect(e){
		let isSelected = true;

		if(this.state.selected){
				isSelected = false
		}
		
		this.setState({selected: isSelected});
		this.props.isSelected(e.target.id, isSelected);
	}

	render() {
		let classes = "row row-clr pgs-news-read-box";
		return (
			<div className={(this.state.selected) ? classes + " current-check" : classes}>
            	<img src={"images/pg-signup-6_" + this.props.backgroundImgCode + ".png"} alt="" className="img-responsive pgs-news-main-cover-img"/>
                    <div className="pgs-news-read-select">
                        <input id={this.props.catName} type="checkbox" className="compaire-check" onClick={this.onCategorySelect} />
                        <label htmlFor={this.props.catName}></label>
                    </div>
                   <div className="pgs-news-read-box-content">                   
                   		<img src={"images/pg-signup-6_" + this.props.catImgCode + ".png"} alt="" className="img-responsive"/>
                        <p>{this.props.catName}</p>
                   </div>
            </div>
		);
	}
}
