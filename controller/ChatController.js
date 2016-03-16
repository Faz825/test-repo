'use strict'

var ChatController ={

    sendMessage:function(req,res){

        var Pusher = require('pusher');

        var pusher = new Pusher({
            appId: '187448',
            key: '8bb62f245b33bc1c7d65',
            secret: '480402a89c5dda6e32a5',
            encrypted: true
        });

        //get the message posted by our ajax call
        var message = req.body.msg;console.log(message)

//wrap it with the user's name when we display
        var res_message = "<strong>&lt;"+CurrentSession.user_name+"&gt;</strong> "+ message;

//trigger the 'new_message' event in our channel, 'presence-nettuts'
        pusher.trigger('test_channel', 'my_event', {
            "message": res_message
        });


//echo the success array for the ajax call

        var _out_put = {
            message:res_message
        }
        res.status(200).json(_out_put);
        return 0
    }

};

module.exports =  ChatController;