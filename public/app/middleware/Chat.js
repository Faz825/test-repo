/**
 * This class Will Handle Chat
 */

import Session  from './Session.js';

 class Chat{

	constructor() {

        var opts = {
            'apikey': '18j5x-sRBAbzhTW1ZD'
        };

        this.b6 = new bit6.Client(opts);

        this.initChat(this.b6);

    }

     initChat(b6){

         var audioCall = true;
         var screenCall = false;
         var currentChatUri = null;
         var typingLabelTimer = 0;
         var latestChatUser = null;
         var me = null;
         var currentChatUserName = null;
         var currentChatUser = null;
         var convUsers = [];
         var unreadCount = 0;
         var incomingCallUser = [];
         var outGoingCallUser = [];

         // A conversation has changed
         b6.on('conversation', function(c, op) {
             onConversationChange(c, op);
         });

         // A message has changed
         b6.on('message', function(m, op) {
             onMessageChange(m, op);
         });

         // Incoming call from another user
         b6.on('incomingCall', function(c) {
             attachCallEvents(c);
             var cf = b6.getNameFromIdentity(c.other);

             var title_array = cf.split('proglobe');
             var title = title_array[1];

             $.ajax({
                 url: '/get-profile/'+title,
                 method: "GET",
                 dataType: "JSON",
                 success: function (data, text) {

                     if (data.status.code == 200 && data.profile_data != null) {

                         incomingCallUser[title] = data.profile_data;

                         var incomingCallUserName = data.profile_data['first_name']+" "+data.profile_data['last_name'] + ' is ' + (c.options.video ? 'video ' : '') + 'calling...';
                         $('#incomingCallFrom').text(incomingCallUserName);

                         var incomingCallProfilePicture = "/images/default-profile-pic.png";
                         if (data.profile_data['images'] != null && data.profile_data['images']['profile_image'] != null) {
                             $("#incoming_call_alert_other_profile_image").attr('src', incomingCallProfilePicture);
                         }

                         $('#incomingCall')
                             .data({'dialog': c})
                             .show();

                         $('#incomingCallAlert').modal('show');

                     }
                 }});


         });

         this.bit6Auth = function (isNewUser) {
             // Convert username to an identity URI
             var ident = 'usr:proglobe_' + Session.getSession('prg_lg').user_name;
             var pass = 'proglobe_'+Session.getSession('prg_lg').id;
             // Call either login or signup function
             var fn = isNewUser ? 'signup' : 'login';
             b6.session[fn]({'identity': ident, 'password': pass}, function (err) {
                 if (err) {
                     this.bit6Auth(true);
                 }
                 else {
                     me = Session.getSession('prg_lg');
                     return true;
                 }
             });
         };

         // Update Conversation View
         function onConversationChange(c, op) {
             var chatList = $('#chatList');
             var tabId = tabDomIdForConversation(c);
             var msgsId = msgsDomIdForConversation(c);
             var tabDiv = $(tabId);
             var msgsDiv = $(msgsId);

             var chatListADiv = $('<a href=""><div class="chat-pro-img"><img src="" alt="" width="40" height="40"/></div><div class="chat-body"><span class="connection-name"></span><p class="msg"></p><span class="chat-date"></span></div></a>');

             // Conversation deleted
             if (op < 0) {
                 tabDiv.remove();
                 msgsDiv.remove();
                 return
             }

             var proglobe_title = b6.getNameFromIdentity(c.id);
             var proglobe_title_array = proglobe_title.split('proglobe');
             var title = proglobe_title_array[1];

             // New conversation
             if (op > 0) {

                 if (c.deleted) {
                     return;
                 }

                 if(title != 'undefined'){
                     // Create a container for message list for this conversation
                     msgsDiv = $('<div class="msgs" />')
                         .attr('id', msgsId.substring(1))
                         .hide();
                     $('#msgList').append(msgsDiv);

                     $.ajax({
                         url: '/get-profile/'+title,
                         method: "GET",
                         dataType: "JSON",
                         success: function (data, text) {

                             if (data.status.code == 200 && data.profile_data != null) {

                                 convUsers[title] = data.profile_data;
                                 latestChatUser = title;

                                 // Entry in the Chat List
                                 if(currentChatUserName == proglobe_title){
                                     currentChatUser = data.profile_data;
                                     tabDiv = $('<div class="tab msg-holder msg-holder-selected" />')
                                         .attr('id', tabId.substring(1))
                                         .append(chatListADiv);
                                     $("#chat_with").html(currentChatUser['first_name']+" "+currentChatUser['last_name']);
                                 } else{
                                     tabDiv = $('<div class="tab msg-holder" />')
                                         .attr('id', tabId.substring(1))
                                         .append(chatListADiv);
                                 }

                                 chatList.append(tabDiv);

                                 // Update Conversation data
                                 var stamp = getRelativeTime(c.updated);
                                 var latestText = '';
                                 var lastMsg = c.getLastMessage();
                                 if (lastMsg) {
                                     // Show the text from the latest conversation
                                     if (lastMsg.content)
                                         latestText = lastMsg.content;
                                     // If no text, but has an attachment, show the mime type
                                     else if (lastMsg.data && lastMsg.data.type) {
                                         latestText = lastMsg.data.type;
                                     }
                                 }

                                 var connection_name = convUsers[title]['first_name']+" "+convUsers[title]['last_name'];
                                 var connection_prof_img = '/images/default-profile-pic.png';

                                 if (convUsers[title]['images'] != null && convUsers[title]['images']['profile_image'] != null) {
                                     connection_prof_img = convUsers[title]['images']['profile_image']['http_url']
                                 }

                                 // Apply data to DOM
                                 tabDiv.find('a').attr('href', '/chat/'+title);
                                 tabDiv.find('.chat-pro-img').find('img').attr('src', connection_prof_img);
                                 tabDiv.find('.chat-body').find('.connection-name').html(connection_name);
                                 tabDiv.find('.chat-body').find('.msg').html(latestText);
                                 tabDiv.find('.chat-body').find('.chat-date').html(stamp);

                                 // If the updated conversation is newer than the top one -
                                 // move this conversation to the top
                                 var top = chatList.children(':first');
                                 if (top.length > 0 && title != 'undefined') {
                                     var topTabId = top.attr('id');
                                     var topConvId = domIdToConversationId(topTabId);
                                     var topConv = b6.getConversation(topConvId);

                                     if (topConv && topConv.id != c.id && c.updated > topConv.updated) {
                                         top.before(tabDiv);
                                     }
                                 }

                                 if (c.unread > 0) {
                                     unreadCount += 1;
                                 }

                                 if(currentChatUri != null){

                                     var conv = b6.getConversation(currentChatUri);

                                     if(conv != null){

                                         // Mark all messages as read
                                         if (b6.markConversationAsRead(conv) > 0) {
                                             // Some messages have been marked as read
                                             // update chat list
                                             unreadCount -= 1;
                                         }


                                         var msgsDiv = $( msgsDomIdForConversation(conv) );
                                         // Show only message container for this conversation
                                         // Hide all the other message containers
                                         msgsDiv.show().siblings().hide();
                                         // Scroll to the bottom of the conversation
                                         //scrollToLastMessage();

                                         // Request focus for the compose message text field
                                         $('#msgText').focus();

                                     }

                                 }

                                 for(var i = 0; i < c.messages.length; i++){
                                     onMessageChange(c.messages[i], op)
                                 }

                                 if(unreadCount > 0){
                                     $("#inbox_count").html('<span class="total">'+unreadCount+'</span>');
                                     $("#unread_chat_count_header").html('<span class="total">'+unreadCount+'</span>');
                                 }

                             }
                         }.bind(this),
                         error: function (request, status, error) {
                             console.log(request.responseText);
                             console.log(status);
                             console.log(error);
                         }
                     });

                 }
             }

         }

         // Get Chat Tab jQuery selector for a Conversation
         function tabDomIdForConversation(c) {
             return '#tab__' + c.domId();
         }


         this.showMessages = function(uri) {

             var proglobe_title_array = uri.split('proglobe');

             if(proglobe_title_array[1] != 'undefined'){

                 // Current conversation identity
                 currentChatUri = uri;
                 currentChatUserName = 'proglobe'+proglobe_title_array[1];

             }
         };

         // Convert element id to a Conversation id
         function domIdToConversationId(id) {
             var r = id.split('__');
             id = r.length > 0 ? r[1] : id
             return bit6.Conversation.fromDomId(id);
         }

         // Get jQuery selector for a Message
         var domIdForMessage = function (m) {
             return '#msg__' + m.domId();
         };

         function getRelativeTime(stamp) {
             var now = Date.now();
             // 24 hours in milliseconds
             var t24h = 24 * 60 * 60 * 1000;
             var d = new Date(stamp);
             var s = (now - stamp > t24h) ? d.toLocaleDateString() : d.toLocaleTimeString();
             return s;
         }

         // Get Messages Container jQuery selector for a Conversation
         function msgsDomIdForConversation(c) {
             return '#msgs__' + c.domId();
         }

         var showUserTyping = function (ident) {
             clearInterval(typingLabelTimer);
             if (ident) {
                 typingLabelTimer = setTimeout(function () {
                     $('#msgOtherTyping').toggle(false);
                 }, 1000);
                 ident = b6.getNameFromIdentity(ident);
                 var txt = ident + ' is typing...';
                 $('#msgOtherTyping').html(txt);
             }
             $('#msgOtherTyping').toggle(ident ? true : false);
         };

         // Scroll to the last message in the messages list
         var scrollToLastMessage = function () {
             var t = document.getElementById("msgListRow").scrollHeight;
             if(typeof t == 'undefined'){
                 t = $('#msgListRow')[0].scrollHeight;
                 $('#msgListRow')[0].scrollTop = t;
             } else{
                 document.getElementById("msgListRow").scrollTop = t;
             }
         };

         // Update Message View
         var onMessageChange = function (m, op) {

             var divId = domIdForMessage(m);
             var div = $(divId);

             // Message deleted
             if (op < 0) {
                 div.remove();
                 return;
             }

             // Message added
             if (op > 0) {

                 if (m.deleted) {
                     return;
                 }
                 if (div.length > 0) {
                     div.remove();
                 }

                 var cssClass = m.incoming() ? 'receiver' : 'sender';

                 div = $('<div class="chat-block ' + cssClass + '" />').attr('id', divId.substring(1));

                 // This message has an attachment
                 if (m.data && m.data.type) {
                     var attachType = m.data.type;
                     var href = m.data.attach;
                     // We have a thumbnail and this is not an audio file
                     if (m.data.thumb && attachType.indexOf('audio/') < 0) {
                         var thumbImg = m.data.thumb;
                         div.append('<a class="thumb" href="' + href + '" target="_new"><img src="' + thumbImg + '" /></a>');
                     }
                     // Show Play button
                     else {
                         var btn = $('<button class="btn btn-info"/>')
                             .text('Play')
                             .data('src', href)
                             .click(function () {
                                 var src = $(this).data('src');
                                 var audio = new Audio(src);
                                 audio.play();
                             });
                         div.append(btn);
                     }
                 }

                 // Message content to show
                 var text = m.content;

                 // This is a call history item
                 if (m.isCall()) {
                     var ch = m.channel();
                     var r = [];
                     if (ch & bit6.Message.AUDIO) {
                         r.push('Audio');
                     }
                     if (ch & bit6.Message.VIDEO) {
                         r.push('Video');
                     }
                     if (ch & bit6.Message.DATA) {
                         if (r.length === 0) {
                             r.push('Data');
                         }
                     }
                     text = r.join(' + ') + ' Call';
                     if (m.data && m.data.duration) {
                         var dur = m.data.duration;
                         var mins = Math.floor(dur / 60);
                         var secs = dur % 60;
                         text += ' - ' + (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
                     }
                 }

                 var my_name = '';
                 var my_prof_img = '';
                 var other_name = '';
                 var other_prof_img = '/images/default-profile-pic.png';

                 if (me != null) {
                     my_name = me['first_name'] + " " + me['last_name'];
                     if (me['images'] != null && me['images']['profile_image'] != null) {
                         my_prof_img = me['images']['profile_image']['http_url'];
                     }
                 }

                 var other_array = m.other.split('proglobe');
                 var other = other_array[1];

                 if (convUsers != null && convUsers[other] != null) {
                     other_name = convUsers[other]['first_name'] + ' ' + convUsers[other]['last_name'];
                     if (convUsers[other]['images'] != null && convUsers[other]['images']['profile_image'] != null) {
                         other_prof_img = convUsers[other]['images']['profile_image']['http_url']
                     }
                 }

                 var display_name = m.incoming() ? other_name : my_name;
                 var display_prof_img = m.incoming() ? other_prof_img : my_prof_img;

                 // Text content
                 if (text) {
                     div.append('<img src="' + display_prof_img + '" alt="' + display_name + '" width="40px" height="40px"/>');
                     div.append('<div class="chat-msg-body"><span class="user-name">'+display_name+'</span><p class="chat-msg">'+text+'</p></div>');
                 }

                 // Find the container for this message
                 var convId = m.getConversationId();
                 var c = b6.getConversation(convId);
                 var msgsDiv = $( msgsDomIdForConversation(c) );
                 msgsDiv.append(div);

                 // If the conversation for this message is visible
                 if (msgsDiv.is(':visible')) {
                     // Scroll to the bottom of the conversation
                     scrollToLastMessage();
                     // Mark this new message as read since it is on the screen
                     if (m.incoming()) {
                         b6.markMessageAsRead(m);
                     }
                     // If we had user 'typing' indicator - clear it
                     showUserTyping(false);
                 }

             }
         };

         this.startOutgoingCall = function(to, video){

             console.log("this.startOutgoingCall")//detailPane

             // Outgoing call params
             var opts = {
                 audio: audioCall,
                 video: video,
                 screen: screenCall
             };
             // Start the outgoing call
             var c = b6.startCall(to, opts);
             attachCallEvents(c);
             updateInCallUI(c);

         };

         // Attach call state events to a RtcDialog
         function attachCallEvents(c) {
             console.log("attachCallEvents");
             // Call progress
             c.on('progress', function() {
                 console.log("PROGRESS")
                 showInCallName();
                 //console.log('CALL progress', c);
             });
             // Call answered
             c.on('answer', function() {
                 console.log("ANSWER")
                 //console.log('CALL answered', c);
             });
             // Error during the call
             c.on('error', function() {
                 console.log("ERROR")
                 //console.log('CALL error', c);
             });
             // Call ended
             c.on('end', function() {
                 console.log("END")
                 showInCallName();
                 //console.log('CALL ended', c);
                 // No more dialogs?
                 if (b6.dialogs.length === 0) {
                     // Hide InCall UI
                     //$('#detailPane').removeClass('hidden');
                     $('#detailPane').addClass('hidden');
                 }
                 // Hide Incoming Call dialog
                 // TODO: check that it was for this dialog
                 $('#incomingCall')
                     .data({'dialog': null})
                     .hide();
             });
         }

         function updateInCallUI(c, opts) {

             //console.log("updateInCallUI")
             showInCallName();

             //$('#detailPane').addClass('hidden');
             $('#detailPane').removeClass('hidden');

             // Start/update the call
             c.connect(opts);
         }

         // Show all the call participants
         function showInCallName() {
             //console.log("showInCallName")
             var s = '';
             for(var i in b6.dialogs) {
                 //console.log(i, b6.dialogs[i])
                 var d = b6.dialogs[i];
                 if (i > 0) {
                     s += ', ';
                 }

                 var title_array = d.other.split('proglobe');
                 var title = title_array[1];

                 $.ajax({
                     url: '/get-profile/'+title,
                     method: "GET",
                     dataType: "JSON",
                     success: function (data, text) {

                         if (data.status.code == 200 && data.profile_data != null) {

                             outGoingCallUser[title] = data.profile_data;

                             var outGoingCallUserName = data.profile_data['first_name']+" "+data.profile_data['last_name'];
                             s += b6.getNameFromIdentity(outGoingCallUserName);
                             $('#inCallOther').text(s);
                         }
                     }});

             }

         }

         // 'Answer Incoming Call' click
         this.answerCall = function(opts){
             console.log("answer clicked")
             console.log(opts)
             //var e = $('#incomingCall').hide();
             var d = $('#incomingCall').data();
             // Call controller
             if (d && d.dialog) {
                 var c = d.dialog;
                 // Accept the call, send local audio only
                 updateInCallUI(c, opts);
                 $('#incomingCall').data({'dialog': null}).hide();
             }
         };

         // 'Reject Incoming Call' click
         this.rejectCall = function(){
             console.log("reject clicked")
             var e = $('#incomingCall').hide();
             var d = e.data();
             // Call controller
             if (d && d.dialog) {
                 // Reject call
                 d.dialog.hangup();
                 e.data({'dialog': null});
             }
         };

         // 'Call Hangup' click
         this.hangupCall = function(){
             console.log("Hangup clicked")
             $('#detailPane').removeClass('hidden');
             $('#inCallPane').addClass('hidden');
             // Hangup all active calls
             var x = b6.dialogs.slice();
             for (var i in x) {
                 //console.log('multi-hangup: ', x[i]);
                 x[i].hangup();
             }
         };

     }

 }

export default new Chat;