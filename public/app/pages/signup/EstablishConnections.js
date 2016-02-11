import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars'
import InputField from '../../components/elements/InputField'
import SelectDateDropdown from '../../components/elements/SelectDateDropdown'
import CountryList from '../../components/elements/CountryList'
import Button from '../../components/elements/Button'
import {Alert} from '../../config/Alert'
import EstablishConnectionBlock from '../../components/elements/EstablishConnectionBlock'
import Session  from '../../middleware/Session';
export default class EstablishConnections extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            connections: [],
            resultHeader:[]

        }
        this.onNextStep = this.onNextStep.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.elementsList = [];
        this.currentPage = 1;
        this.connectedUsers =[];
    }
	componentDidMount() {
        this.loadData(this.currentPage);
	}

    loadData(page){
        let user = Session.getSession('prg_lg');
        let _this =  this;
        $.ajax({
            url: '/connections',
            method: "GET",
            dataType: "JSON",
            data:{pg:page},
            headers: { 'prg-auth-header':user.token },
            success: function (data, text) {
                if(data.status.code == 200){

                    this.setState({connections:data.connections,resultHeader:data.header})
                    //this.currentPage = data.header.current_page;
                }

            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }.bind(this)
        });
    }

	handleScroll(event, values) {

        if  (values.scrollTop == (values.scrollHeight - values.clientHeight) - 4){

            if (this.currentPage > this.state.resultHeader.total_pages){
                //return false;
            }else{
                console.log(this.currentPage)
                this.loadData(this.currentPage)
            }
            this.currentPage = this.currentPage+1;
            console.log(this.currentPage)
        }



    }
    onNextStep(){
        let user = Session.getSession('prg_lg');
        let _this = this;
        $.ajax({
            url: '/connect-people',
            method: "POST",
            dataType: "JSON",
            data:{ connected_users: JSON.stringify(this.connectedUsers)},
            headers: { 'prg-auth-header':user.token },
            success: function (data, text) {
                if(data.status.code == 200){
                    Session.createSession("prg_lg", data.user);
                    _this.props.onNextStep();
                }

            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }.bind(this)
        });
    }

    onConnectionSelect(connection,isConnected){
        if(isConnected){
            this.connectedUsers.push(connection._id);
        }else{
            let index = this.connectedUsers.indexOf(connection._id,1)
            this.connectedUsers.splice(index);
        }

    }


	render() {
        let connection_list = [];



        if(this.state.connections.length > 0){
            connection_list = this.state.connections.map((connection)=>{
                return <EstablishConnectionBlock key={connection._id} connection={connection} onConnectionSelect={(connection,isConnected)=>this.onConnectionSelect(connection,isConnected)}/>
            });
        }
        this.elementsList.push(connection_list);

		return (
			<div className="row row-clr pgs-middle-sign-wrapper pgs-middle-about-wrapper">
            	<div className="container">
                
                    <div className="col-xs-10 pgs-middle-sign-wrapper-inner">
                    
                    	<div className="row">
                        
                        	<div className="col-xs-2 pgs-secratery-img">
                                <img src="images/secretary-pic.png" alt="" className="img-responsive"/>
                        	</div>
                            
                            <div className="col-xs-10">
                                <div className="row row-clr pgs-middle-sign-wrapper-inner-cover pgs-middle-sign-wrapper-inner-cover-secretary pgs-middle-sign-wrapper-about">
                                	<img src="images/sign-left-arrow-1.png" alt="" className="img-responsive pgs-sign-left-arrow"/>
                                	
                                    <div className="row row-clr pgs-middle-sign-wrapper-about-inner pgs-middle-sign-wrapper-about-inner-establish-conn">
                                        <h1>Hello Soham,</h1>
                                        <h2>Welcome to Proglobe</h2> 
                                    </div>
                                    
                                    <div className="row row-clr pgs-middle-sign-wrapper-inner-form pgs-middle-sign-wrapper-about-inner-form">
                                    
                                    	<h6>Establish your connections</h6>
                                        
                                        <div className="row row-clr pgs-establish-connection-cover"> 
                                        
                                        	<div className="row row-clr pgs-establish-connection-cover-inner">

                                                <Scrollbars style={{ height: 310 }} onScroll={this.handleScroll}>
                                                    {this.elementsList}
                                                </Scrollbars>
                                            </div>
                                            
                                        </div> 
                                        
                                        <div className="row">
	                                        <Button type="button" size="6" classes="pgs-sign-submit-cancel" value="cancel" />
                                            <input type="button" className="pgs-sign-submit" value="next" onClick={this.onNextStep}/>
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