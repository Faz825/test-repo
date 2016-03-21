import React from 'react';
import Button from '../../components/elements/Button';
import Session  from '../../middleware/Session';
import Chat  from '../../middleware/Chat';

export default class DetailChat extends React.Component{
    constructor(props) {
        super(props);
        this.state= {
            userLogedIn : Session.getSession('prg_lg')
        };
    };

    newChat(chatWith){
        window.location.href = '/chat/new-message/'+chatWith;
    }



    render() {
        return (
            <div className="row row-clr pgs-middle-sign-wrapper changedPassword">
                <div className="container">
                    <div className="containerHolder">
                        {
                            (this.state.userLogedIn.id == '56dfba771cd40a414eea9982')?
                                null:<Button type="button" size="20" classes="pgs-sign-submit-cancel" value="asdasdasdas" onButtonClick={()=>this.newChat('asdasdasdas')} />
                        }
                        {
                            (this.state.userLogedIn.id == '56d5867d9f1e39a03f932a34')?
                                null:<Button type="button" size="20" classes="pgs-sign-submit-cancel" value="anuthiga" onButtonClick={()=>this.newChat('anuthiga')} />
                        }
                        {
                            (this.state.userLogedIn.id == '56dff6313b203808572ddb8c')?
                                null:<Button type="button" size="20" classes="pgs-sign-submit-cancel" value="qwqw" onButtonClick={()=>this.newChat('qwqw')} />
                        }



                    </div>
                </div>
            </div>
        );
    }
}
