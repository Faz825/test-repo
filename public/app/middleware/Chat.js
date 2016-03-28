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

         // Disable all audio in this demo
         var disableAudio = false;
         var currentChatUri = null;
         var typingLabelTimer = 0;

         // A conversation has changed
         b6.on('conversation', function(c, op) {
             console.log('onConv', c);
             onConversationChange(c, op);
         });

         // A message has changed
         b6.on('message', function(m, op) {
             console.log('onMsg', m);
             onMessageChange(m, op);
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
                     if (b6.session.authenticated) {
                         console.log('User is logged in');
                     }
                     else {
                         console.log('User is not logged in');
                     }
                     loginDone();
                     return true;
                 }
             });
         };

         // User has completed the login procedure
         var loginDone = function() {
             this.selectFirstChat();
         };

         // Show the first chat
         this.selectFirstChat = function() {
             // Do we have more chats?
             var chats = $('#chatList').children();
             if (chats.length > 0) {
                 // Simulate a click on the first chat
                 console.log('Selecting first chat');
                 chats.first().click();
             }
             // No more chats
             else {
                 // Clear message lists etc
                 console.log('No more chats to select');
                 this.showMessages(null);
             }
         };

         // Update Conversation View
         function onConversationChange(c, op) {
             var chatList = $('#chatList');
             var tabId = tabDomIdForConversation(c);
             var msgsId = msgsDomIdForConversation(c);
             var tabDiv = $(tabId);
             var msgsDiv = $(msgsId);

             // Conversation deleted
             if (op < 0) {
                 if (!c.deleted) {
                     console.log('Warning: Deleting a conversation with no deleted property!', c);
                 }
                 if (tabDiv.length == 0 || msgsDiv.length == 0) {
                     console.log('Warning: Deleting a conversation with no DOM element!', c);
                 }
                 tabDiv.remove();
                 msgsDiv.remove();
                 return
             }

             // New conversation
             if (op > 0) {
                 if (c.deleted) {
                     console.log('Error: Adding a deleted conversation', c);
                     return;
                 }
                 if (tabDiv.length > 0 || msgsDiv.length > 0) {
                     console.log('Error: Adding a conversation that has DOM elements!', c);
                 }

                 // Entry in the Chat List
                 tabDiv = $('<div class="tab" />')
                     .attr('id', tabId.substring(1))
                     .append('<strong />')
                     .append('<span />')
                     .append('<em />');
                 chatList.append(tabDiv);
                 // Create a container for message list for this conversation
                 msgsDiv = $('<div class="msgs" />')
                     .attr('id', msgsId.substring(1))
                     .hide();
                 $('#msgList').append(msgsDiv);
             }


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
             var title = b6.getNameFromIdentity(c.id);
             if (c.unread > 0) {
                 title += ' (' + c.unread + ')';
             }

             // Apply data to DOM
             tabDiv.children('strong').html(title);
             tabDiv.children('span').html(latestText);
             tabDiv.children('em').html(stamp);

             // If the updated conversation is newer than the top one -
             // move this conversation to the top
             var top = chatList.children(':first');
             if (top.length > 0) {
                 var topTabId = top.attr('id');
                 var topConvId = domIdToConversationId(topTabId);
                 var topConv = b6.getConversation(topConvId);
                 if (topConv && topConv.id != c.id && c.updated > topConv.updated) {
                     top.before(tabDiv);
                 }
             }
         }

         // Get Chat Tab jQuery selector for a Conversation
         function tabDomIdForConversation(c) {
             return '#tab__' + c.domId();
         }


         this.showMessages = function(uri) {
             console.log('Show messages for', uri);

             // Hide 'user typing' if switching to a different chat
             if (uri != currentChatUri) {
                 showUserTyping(false);
             }

             // Current conversation identity
             currentChatUri = uri;

             // Nothing to show
             if (!uri) {
                 $('body').removeClass('detail');
                 return;
             }

             $('body').addClass('detail');

             var conv = b6.getConversation(uri);
             // Mark all messages as read
             if (b6.markConversationAsRead(conv) > 0) {
                 // Some messages have been marked as read
                 // update chat list
                 console.log('Messages marked as read');
             }


             var msgsDiv = $( msgsDomIdForConversation(conv) );
             // Show only message container for this conversation
             // Hide all the other message containers
             msgsDiv.show().siblings().hide();
             // Scroll to the bottom of the conversation
             scrollToLastMessage();

             // Request focus for the compose message text field
             //$('#msgText').focus();
         }

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
             var t = document.getElementById("msgListRow");
             var t = $('#msgListRow');
             t.scrollTop = t.scrollHeight;
         }

         // Update Message View
         var onMessageChange = function (m, op) {
             console.log("onMessageChange")
             //$("#pageLoadDiv").show();
             var divId = domIdForMessage(m);console.log("divId = "+divId)
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
                         div1 += '<a class="thumb" href="' + href + '" target="_new" style="margin-right:10px;"><img src="' + thumbImg + '" style="max-height:50px;" /></a>';
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
                         div1 += '<div className="chat-block receiver"><img src="/images/pg-home-chats_06.png" alt=""/><div className="chat-msg-body"><span className="user-name">Prasad</span><p className="chat-msg">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi tempore rem eaque nemo fugiat autem optio sed est veniam sapiente dolore culpa, enim, eligendi. Sed atque culpa esse dolore itaque?</p></div></div>';
                     } else {
                         div1 += '<div className="chat-block sender"><img src="/images/pg-home-chats_06.png" alt=""/><div className="chat-msg-body"><span className="user-name">Prasad</span><p className="chat-msg">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi tempore rem eaque nemo fugiat autem optio sed est veniam sapiente dolore culpa, enim, eligendi. Sed atque culpa esse dolore itaque?</p></div></div>';
                     }
                 }

                 console.log("div1 - "+div1)

                 //var div2 = '';
                 //
                 //if (m.incoming()) {
                 //    div2 = '<div id="' + divId.substring(1) + '" class="messages_right messages_common"><div class="chat_inner_img chat_inner_img_right"> <img src="' + $scope.arr_allUsers[m.other.split(':')[1]].profileimage + '" alt="" class="img-circle img-responsive img-custom-extra-small"> </div> <div class="chat_inner_text chat_inner_text_right" style="margin-bottom:10px;">' + div1 + '</div></div>';
                 //} else {
                 //    div2 = '<div id="' + divId.substring(1) + '" class="messages_left messages_common"><div class="chat_inner_img chat_inner_img_left"> <img src="' + $scope.user.profileimage + '" alt=""' +
                 //        ' class="img-circle img-responsive img-custom-extra-small"> </div> <div class="chat_inner_text chat_inner_text_left" style="margin-bottom:10px;" >' + div1 + '</div></div>';
                 //}
                 div = $(div1);

                 // Timestamp
                 //div.append('h6');
                 // Message status
                 //div1 += '<em></em>';

                 // Find the container for this message
                 var convId = m.getConversationId();console.log("convId - "+convId)
                 var c = b6.getConversation(convId);console.log("c - ");console.log(c)
                 var msgsDiv = $(msgsDomIdForConversation(c));console.log("msgsDiv - ");console.log(msgsDiv);
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