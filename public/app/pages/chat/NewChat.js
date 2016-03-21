import React from 'react';
import Session  from '../../middleware/Session';
import Button from '../../components/elements/Button';
import TextField from '../../components/elements/TextField';
import {Alert} from '../../config/Alert';

export default class NewChat extends React.Component{
    constructor(props) {
        super(props);
        this.state= {
            formData:{},
            error:{},
            sendURL:'/chat/send/',
            validateAlert: "",
            invalidElements :{},
            fieldValue : "",
            chatWith:this.getUrl(),
            userLogedIn : Session.getSession('prg_lg')
        };
        this.elementChangeHandler = this.elementChangeHandler.bind(this);
        this.clearValidations     = this.clearValidations.bind(this);
        this.validateSchema = {
            msg: ""
        };
        this.isValid = true;
        this.formData = {};
    };

    getUrl(){
        return  this.props.chatWith;
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

    sendChat(e){
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

            var opts = {
                'apikey': '18j5x-sRBAbzhTW1ZD',
                'env':'development'
            };

            var b6 = new bit6.Client(opts);



            var dest = 'usr:proglobe_'+this.state.chatWith;
            var msg = this.formData.msg

            console.log(b6);

            b6.compose(dest).text(msg).send(function(err) {
                if (err) {
                    console.log('error', err);
                }
                else {
                    console.log('message sent');
                }
            });
        }
    }

    render() {
        return (
            <div className="row row-clr pgs-middle-sign-wrapper changedPassword">

                    <div className="containerHolder">

                            <div id="chat_widget_messages_container">
                                <div id="chat_widget_messages">

                                </div>
                            </div>

                            <div className="clear"></div>
                            <div id="chat_widget_input_container">
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
                                    <Button type="submit" size="6" classes="pgs-sign-submit" value="Send" id="chat_widget_button" onButtonClick={()=>this.sendChat()}/>
                            </div>


                    </div>

            </div>
        );
    }
}
