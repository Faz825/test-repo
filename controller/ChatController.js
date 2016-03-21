'use strict';

var ChatController ={

    chatAuth:function(req,res){

        var Pusher = require('pusher');

        var pusher = new Pusher({
            appId: '187448',
            key: '8bb62f245b33bc1c7d65',
            secret: '480402a89c5dda6e32a5',
            encrypted: true
        });

        var socketId = req.body.socket_id;
        var channel = req.body.channel_name;
        var auth = pusher.authenticate(socketId, channel);
        res.send(auth);

    },

    startOneToOneChat:function(req,res){

        var Pusher = require('pusher');

        var pusher = new Pusher({
            appId: '187448',
            key: '8bb62f245b33bc1c7d65',
            secret: '480402a89c5dda6e32a5',
            encrypted: true
        });

        var chatWith = req.body.chatWith;console.log("chatWith - "+chatWith)
        var initiatedBy = CurrentSession.id;console.log("initiatedBy - "+initiatedBy)

        var channels = [ 'private-notifications-'+initiatedBy, 'private-notifications-'+chatWith ];

        var eventData = {
            'what':'initiated',
            'channel_name': 'private-chat-'+initiatedBy+'-'+chatWith,
            'initiated_by': initiatedBy,
            'chat_with'   : chatWith
        };
        pusher.trigger( channels, 'one-to-one-chat-request', eventData );
        var _out_put = {};
        _out_put['pusher'] = pusher;
        _out_put['eventData'] = eventData
        res.send(_out_put);
        return 0;

    },

    sendMessage:function(req,res){

        var Pusher = require('pusher');

        var pusher = new Pusher({
            appId: '187448',
            key: '8bb62f245b33bc1c7d65',
            secret: '480402a89c5dda6e32a5',
            encrypted: true
        });

        console.log(CurrentSession)
        var message = req.body.msg;
        var sendBy = CurrentSession.id;
        var chatWith = req.params.chatWith;
        var channels = ['private-notifications-'+chatWith, 'private-notifications-'+sendBy];

        //var res_message = "<strong>&lt;"+CurrentSession.user_name+"&gt;</strong> "+ message;

        var eventData = {
            'what':'text_sent',
            'sentBy':sendBy,
            'sentByName':CurrentSession.first_name+" "+CurrentSession.last_name,
            'chat_with':chatWith,
            'message':message
        };

        pusher.trigger(channels, 'one-to-one-chat-request', eventData);

        res.status(200).json(eventData);
        return 0

    }

};

module.exports =  ChatController;