/**
 * This class Will Handle socket.io
 */

import Session  from './Session.js';

class Socket{


    constructor() {
        this.loggedUser = Session.getSession('prg_lg');
        //this.socket = io.connect("//notification.proglobe.loc/");
    }

    connect(){
        //this.socket.emit('new user', this.loggedUser.user_name);
    }

    subscribe(data){
        var _data = {
            user:this.loggedUser.user_name,
            data:data
        }
        this.socket.emit('subscribe channel', data);
    }




}

export default new Socket;