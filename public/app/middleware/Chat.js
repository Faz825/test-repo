/**
 * This class Will Handle Chat
 */

import Session  from './Session';

 class Chat{

	constructor() {

        var opts = {
            'apikey': '18j5x-sRBAbzhTW1ZD'
        };

        this.b6 = new bit6.Client(opts);

        this.initChat(this.b6);

    }


     initChat(b6){

         this.bit6Auth = function (isNewUser) {
             console.log("bit6Auth from CHAT.JS")
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
                     if (b6.session.authenticated) {
                         console.log('User is logged in');
                     }
                     else {
                         console.log('User is not logged in');
                     }
                     return true;
                 }
             });
         };

         // Incoming call from another user
         b6.on('incomingCall', function(c) {
             console.log('Incoming call', c);
             //attachCallEvents(c);
             //$('#incomingCallFrom').text(b6.getNameFromIdentity(c.other) + ' is connecting...');
             //$('#incomingCall')
             //    .data({'dialog': c})
             //    .show();
         });

         // Got a real-time notification
         b6.on('notification', function(m) {
             console.log('demo got rt notification', m);
         });

         // A message has changed
         b6.on('message', function (m, op) {
             //console.log('onMsg', m);
             onMessageChange(m, op);
         });

         // Get jQuery selector for a Message
         var domIdForMessage = function (m) {
             return '#msg__' + m.domId();
         };

         var getRelativeTime = function (stamp) {
             var now = Date.now();
             // 24 hours in milliseconds
             var t24h = 24 * 60 * 60 * 1000;
             var d = new Date(stamp);
             var s = (now - stamp > t24h) ? d.toLocaleDateString() : d.toLocaleTimeString();
             return s;
         };

         // Get Messages Container jQuery selector for a Conversation
         var msgsDomIdForConversation = function (c) {
             return '#msgs__' + c.domId();
         };

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
             var t = document.getElementById("msgListRow");
             //var t = $('#msgListRow');
             t.scrollTop = t.scrollHeight;
         }

         // Update Message View
         var onMessageChange = function (m, op) {
             //$("#pageLoadDiv").show();
             var divId = domIdForMessage(m);
             var div3 = $(divId);
             var div1 = '';
             var div = $(divId);
//console.log(div3.html());
             // Message deleted
             if (op < 0) {

                 if (!m.deleted) {

                 }
                 if (div3.length == 0) {

                 }
                 div3.remove();
                 return;
             }

             // Message added
             if (op > 0) {
                 if (m.deleted) {

                     return;
                 }
                 if (div1.length > 0) {

                 }

                 // This message has an attachment
                 if (m.data && m.data.type) {
                     var attachType = m.data.type;
                     var href = m.data.attach;
                     // We have a thumbnail and this is not an audio file
                     if (m.data.thumb && attachType.indexOf('audio/') < 0) {
                         var thumbImg = m.data.thumb;
                         div1 += '<a class="thumb" href="' + href + '" target="_new" style="margin-right:10px;"><img' +
                             ' src="' + thumbImg + '" style="max-height:50px;" /></a>';
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
                         div1 += btn;
                     }
                 }
                 // Message content to show
                 var text = m.content;
                 var textTime = '';

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
                         r.push('Data');
                     }
                     text = r.join(' + ') + ' Call'
                     if (m.data && m.data.duration) {
                         var dur = m.data.duration;
                         var mins = Math.floor(dur / 60);
                         var secs = dur % 60;
                         text += ' - ' + (mins ? mins + 'm ' : '') + secs + 's';
                     }
                 }

                 // Latest updated stamp
                 var stamp = getRelativeTime(m.updated);

                 // Text content
                 if (text) {
                     if (m.incoming()) {
                         div1 += '<img src="/public/images/chat_right.png" class="chat_right"><p style="color:#000;">' + text + '</p><h6>' + stamp + '</h6>';
                     } else {
                         div1 += '<img src="/public/images/chat_left.png" class="chat_left"><p style="color:#fff;">' + text + '</p><h6>' + stamp + '</h6>';
                     }
                 }

                 var div2 = '';

                 if (m.incoming()) {
                     div2 = '<div id="' + divId.substring(1) + '" class="messages_right messages_common"><div class="chat_inner_img chat_inner_img_right"> <img src="" alt="" class="img-circle img-responsive img-custom-extra-small"> </div> <div class="chat_inner_text chat_inner_text_right" style="margin-bottom:10px;">' + div1 + '</div></div>';
                 } else {
                     div2 = '<div id="' + divId.substring(1) + '" class="messages_left messages_common"><div class="chat_inner_img chat_inner_img_left"> <img src="" alt=""' +
                         ' class="img-circle img-responsive img-custom-extra-small"> </div> <div class="chat_inner_text chat_inner_text_left" style="margin-bottom:10px;" >' + div1 + '</div></div>';
                 }
                 div = $(div2);

                 // Timestamp
                 //div.append('h6');
                 // Message status
                 //div1 += '<em></em>';


                 // Find the container for this message
                 var convId = m.getConversationId();
                 var c = b6.getConversation(convId);
                 var msgsDiv = $(msgsDomIdForConversation(c));
                 msgsDiv.append(div);

                 // If the conversation for this message is visible
                 if (msgsDiv.is(':visible')) {
                     // Scroll to the bottom of the conversation
                     //$scope.scrollToLastMessage();
                     // Mark this new message as read since it is on the screen
                     if (m.incoming()) {
                         b6.markMessageAsRead(m);
                     }
                     // If we had user 'typing' indicator - clear it
                     showUserTyping(false);
                 }

             }

             // Update Message data


             // Apply data to DOM
             //div.children('h6').text(stamp);
             //div.children('em').text(status);
             //$("#pageLoadDiv").hide();
             scrollToLastMessage();
         }

     }



 }

export default new Chat;