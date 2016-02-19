import React from 'react'
import Button from '../../components/elements/Button'
import NewsCategoryList from '../../components/elements/NewsCategoryList'
import Session  from '../../middleware/Session';
import SecretaryThumbnail from '../../components/elements/SecretaryThumbnail'

export default class NewsType extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            sesData:{},
            selected : "" ,
            categories : "",
            status:false,
            btn_name:"Skip"
        };

        this.selectedNewsCategories =[];
    }

    componentDidMount() {

        let _sesData = Session.getSession('prg_lg')
        this.setState({sesData:_sesData});
    }

    onCategorySelect(categories){
        this.selectedNewsCategories = categories;

        if(this.selectedNewsCategories.length >=1){
            this.setState({"btn_name":"Next"});
        }else{
            this.setState({"btn_name":"Skip"});
        }
    }

    onNextStep(){
        let user = Session.getSession('prg_lg');
        let _this =  this;
        $.ajax({
            url: '/addNewsCategory',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':user.token },
            data:{ news_categories: JSON.stringify(this.selectedNewsCategories)},
            success: function (data, text) {
                if (data.status.code == 200) {
                    Session.createSession("prg_lg", data.user);
                    _this.props.onNextStep();
                }
            },
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });
    }

    onBack(){
        this.props.onPreviousStep()
    }

	render() {
        let _secretary_image = this.state.sesData.secretary_image_url;
        let session = Session.getSession('prg_lg');

		return (
			<div className="row row-clr pgs-middle-sign-wrapper pgs-middle-about-wrapper">
            	<div className="container">
                    <div className="col-xs-8 pgs-middle-sign-wrapper-inner">
                    	<div className="row">
                        	<SecretaryThumbnail url={_secretary_image} />
                            <div className="col-xs-10">
                                <div className="row row-clr pgs-middle-sign-wrapper-inner-cover pgs-middle-sign-wrapper-inner-cover-secretary pgs-middle-sign-wrapper-about">
                                <img src="images/sign-left-arrow-1.png" alt="" className="img-responsive pgs-sign-left-arrow"/>
                                    <div className="row row-clr pgs-middle-sign-wrapper-about-inner pgs-middle-sign-wrapper-about-inner-establish-conn">
                                        <h1>Hello {session.first_name},</h1>
                                        <h2>Welcome to Proglobe</h2>
                                    </div>
                                    <div className="row row-clr pgs-middle-sign-wrapper-inner-form pgs-middle-sign-wrapper-about-inner-form pgs-middle-sign-wrapper-news-inner-form">
                                    	<h6>Tell me about what type of news you would like to read</h6>
                                        <NewsCategoryList onCategorySelect={(categories)=>this.onCategorySelect(categories)}/>
                                            <div className="row">
		                                        <Button type="button"
                                                        size="6"
                                                        classes="pgs-sign-submit-cancel"
                                                        value="Back"
                                                        onButtonClick = {()=>this.onBack()}/>
		                                        <Button type="button"
                                                        size="6"
                                                        classes="pgs-sign-submit"
                                                        value={this.state.btn_name}
                                                        onButtonClick ={()=>this.onNextStep()}  />
		                                    </div>
                                    </div>
                                </div>
                        	</div>
                        </div>
                    </div>
                </div>
            </div>
		);
	}
}
