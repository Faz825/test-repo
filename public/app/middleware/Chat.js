/**
 * This class Will Handle Chat
 */

import Session  from './Session';

 class Chat{

	constructor() {
    }

     /**
      * create user in bit6
      */
	 doChatSubscription(){


	 }

     /**
      * start new chat with a user
      * @param chatWith
      */
     startNewChat(chatWith){

         $.ajax({
             url: '/chat/startOneToOneChat',
             method: "POST",
             data: {chatWith:chatWith},
             dataType: "JSON",
             headers: { 'prg-auth-header':Session.getSession('prg_lg').token },
             success: function (data, text) {
                 console.log(data);

             },
             error: function (request, status, error) {
                 console.log("Error")
             }
         });

     }


 }

export default new Chat;