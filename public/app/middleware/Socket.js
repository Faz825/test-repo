/**
 * This class Will Handle socket.io
 */

import Session  from './Session.js';

class Socket{


    constructor() {
        this.loggedUser = Session.getSession('prg_lg');
        //this.socket = io.connect("//notification.proglobe.loc/");
         this.socket = io.connect("https://dev-notification.proglobe.us/");//dev
        //this.socket = io.connect("//notification.proglobe.us/");//prod
    }

    connect(){
        this.socket.emit('new user', this.loggedUser.user_name);
    }

    subscribe(data){
        console.log("subscribe");console.log(data)
        var _data = {
            user:this.loggedUser.user_name,
            data:data
        }
        this.socket.emit('subscribe channel', _data);
    }

    sendNotification(data){
        console.log("sendNotification");console.log(data)
        var _data = {
            user:this.loggedUser.user_name,
            data:data
        }
        this.socket.emit('send notification', _data);
    }

    listenToNotification(callback){

        this.socket.on('notification',function(data){
            console.log("notification"); console.log(data);
            callback(data);
        })

        this.socket.on('birthday notification',function(data){
            console.log("birthday notification")
            console.log(data)
            callback(data);
        })
    }




}

export default new Socket;