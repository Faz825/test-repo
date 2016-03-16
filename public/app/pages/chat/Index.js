/**
 * This is chat index component
 */
import React from 'react';
import Button from '../../components/elements/Button';
import TextField from '../../components/elements/TextField'
import Session  from '../../middleware/Session';
import {Alert} from '../../config/Alert';
import _ from 'lodash';
export default class Index extends React.Component{

    constructor(props) {
        super(props);
        this.state= {
            userLogedIn : Session.getSession('prg_lg'),
            formData:{},
            error:{},
            sendURL:'/chat/send',
            validateAlert: "",
            invalidElements :{},
            fieldValue : ""
        };
        this.elementChangeHandler = this.elementChangeHandler.bind(this);
        this.clearValidations     = this.clearValidations.bind(this);
        this.validateSchema = {
            msg: ""
        };
        this.isValid = true;
        this.formData = {};

        var pusher = new Pusher('8bb62f245b33bc1c7d65', {
            encrypted: true
        });

        var channel = pusher.subscribe('test_channel');
        channel.bind('my_event', function(data) {
            $("#chat_widget_messages").append(data.message);
            $("#chat_widget_messages").append("<br/>");
        });

        console.log(this.state.userLogedIn.token)

    }

    traversObject(){
        let _error = {};
        for(let elm in this.formData){

            if(elm == "msg" && this.formData[elm]==""){
                _error[elm] = Alert.EMPTY_MESSAGE;
            }
        }
        return _error;
    }

    elementChangeHandler(key,data,status){

        this.formData[key] = data;

        let er = this.traversObject();
        this.setState({error:er})

    }

    clearValidations(){
        this.formData = {};
        this.setState({invalidElements:{}, fieldValue : ""});
    }

    submitData(e){
        e.preventDefault();
        let _this = this;
        let _invalid_frm = this.formData;
        for (let err_elm in this.validateSchema){
            if(!this.formData.hasOwnProperty(err_elm))
                this.formData[err_elm] = this.validateSchema[err_elm];
        }

        let er = this.traversObject();
        this.setState({error:er})

        if(Object.keys(er).length == 0) {
            this.formData['status'] = 1;

            console.log(this.formData);

            $.ajax({
                url: this.state.sendURL,
                method: "POST",
                data: this.formData,
                dataType: "JSON",
                headers: { 'prg-auth-header':this.state.userLogedIn.token },
                success: function (data, text) {

                    //console.log(data);
                    //$("#chat_widget_messages").append(data.message);
                    //console.log(text);


                },
                error: function (request, status, error) {


                }
            });
        }


    }




    render(){

        return (

            <div id="pg-profile-page" className="loggedUserView pg-page">

                <div className="row row-clr">

                    <div id="chat_widget_main_container">
                        <div id="chat_widget_messages_container">
                            <div id="chat_widget_messages">

                            </div>
                        </div>

                        <div className="clear"></div>
                        <div id="chat_widget_input_container">
                            <form method="get" onSubmit={this.submitData.bind(this)} onReset={this.clearValidations.bind(this)} id="chat_widget_form">
                                <TextField  name="msg"
                                            size="6"
                                            value={this.formData.msg}
                                            label="Message"
                                            placeholder=""
                                            classes="pgs-sign-inputs"
                                            required={true}
                                            onInputChange={this.elementChangeHandler}
                                            validate={this.state.invalidElements.msg}
                                            error_message={this.state.error.msg}
                                    />
                                <Button type="submit" size="6" classes="pgs-sign-submit" value="Chat" id="chat_widget_button"/>

                            </form>
                        </div>
                    </div>
                </div>

            </div>


        )
    }

}
export default  Index;
