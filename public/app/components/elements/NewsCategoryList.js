import React from 'react'

import NewsCategoryListItem from './NewsCategoryListItem'
import Session  from '../../middleware/Session';
let data = {
	catName: "Business",
	fields:{
		backgroundImgCode: "03",
		catImgCode: "031",
	}
}

export default class NewsCategoryList extends React.Component{
	constructor(props){
		super(props);
		
		this.state = {selected : "" ,categories : "",status:false};
		this.categoryIsSelected = this.categoryIsSelected.bind(this);
		this.selectedNewsCategories =[];
	}

	categoryIsSelected(category,status){
        if(status){
            this.selectedNewsCategories.push(category)

        }else{
            let index = this.selectedNewsCategories.indexOf(category._id,1)
            this.selectedNewsCategories.splice(index);
        }
        this.props.onCategorySelect(this.selectedNewsCategories);

    }


	render() {


        return (
			<div className="row row-clr pgs-news-read-cover">
            	<div className="row row-clr pgs-news-read-cover-inner">


                    <NewsCategoryListItem catName="Business" backgroundImgCode="03" catImgCode="031" isSelected={this.categoryIsSelected} />
                    <NewsCategoryListItem catName="Sports" backgroundImgCode="09" catImgCode="091" isSelected={this.categoryIsSelected} />
                    <NewsCategoryListItem catName="Technology" backgroundImgCode="05" catImgCode="051" isSelected={this.categoryIsSelected}/>
                    <NewsCategoryListItem catName="Health" backgroundImgCode="07" catImgCode="071" isSelected={this.categoryIsSelected}/>
                    <NewsCategoryListItem catName="Entertainment" backgroundImgCode="11" catImgCode="111" isSelected={this.categoryIsSelected}/>
                
                </div>
            </div>
		);
	}
}