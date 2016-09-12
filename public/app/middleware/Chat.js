/**
 * This class Will Handle Chat
 */

import Session  from './Session.js';
import Lib from './Lib.js';

class Chat{

    constructor() {

        var opts = {
            'apikey': '18j5x-sRBAbzhTW1ZD'
        };

        this.b6 = new bit6.Client(opts);

    }

    initChat(b6){

        bit6Auth(false);

        var audioCall = true;
        var screenCall = false;
        var convUsers = [];
        var unreadCount = 0;
        var incomingCallUser = [];
        var outGoingCallUser = [];
        var unreadConversationCount = [];
        var callTimer = null;
        var my_connections = [];
        var conv_ids = [];

        var me = Session.getSession('prg_lg');
        loadMyConnections(me.token);

        /**
         * below change has been moved to SignupHeader Component
         */
        // A conversation has changed
        b6.on('conversation', function(c, op) {
        //    onConversationChange(c, op);
        });

        // Incoming call from another user
        b6.on('incomingCall', function(c) {

            console.log("======incomingCall======");
            console.log(c);



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
                            incomingCallProfilePicture = data.profile_data['images']['profile_image']['http_url'];
                        }
                        $("#incoming_call_alert_other_profile_image").attr('src', incomingCallProfilePicture);

                        $('#incomingCall')
                            .data({'dialog': c})
                            .show();

                        $('#incomingCallAlert').modal('show');

                    }

                }
            });

        });

        // Changes in video elements
        // v - video element to add or remove
        // c - Dialog - call controller. null for a local video feed
        // op - operation. 1 - add, 0 - update, -1 - remove
        b6.on('video', function(v, c, op) {
            console.log("Video");
            var vc = $('#videoContainer');
            if (op < 0) {
                vc[0].removeChild(v);
            }
            else if (op > 0) {
                v.setAttribute('class', c ? 'remote' : 'local');
                vc.append(v);
            }
            // Total number of video elements (local and remote)
            var n = vc[0].children.length;
            if (op !== 0) {
                vc.toggle(n > 0);
            }
            // Use number of video elems to determine the layout using CSS
            var kl = n > 2 ? 'grid' : 'simple';
            vc.attr('class', kl);

        });

        function loadMyConnections(token){
            $.ajax({
                url: '/connection/me',
                method: "GET",
                dataType: "JSON",
                headers: { 'prg-auth-header':token }
            }).done(function(data){
                if(data.status.code == 200){
                    my_connections = data.my_con;
                }
            }.bind(this));
        }

        function bit6Auth(isNewUser) {
            if(Session.getSession('prg_lg') != null){
                // Convert username to an identity URI
                var ident = 'usr:proglobe_' + Session.getSession('prg_lg').user_name;
                var pass = 'proglobe_'+Session.getSession('prg_lg').id;
                // Call either login or signup function
                var fn = isNewUser ? 'signup' : 'login';
                b6.session[fn]({'identity': ident, 'password': pass}, function (err) {
                    if (err) {
                        bit6Auth(true);
                    }
                    else {
                        return true;
                    }
                });
            }
        }

        // Update Conversation View
        function onConversationChange(c, op) {
            var notificationId = notificationDomIdForConversation(c);
            var notificationWrapperDiv = $("#unread_chat_list");
            var notificationDiv = $(notificationId);

            // Conversation deleted
            if (op < 0) {
                notificationDiv.remove();
                return
            }

            var proglobe_title = b6.getNameFromIdentity(c.id);
            var proglobe_title_array = proglobe_title.split('proglobe');
            var title = proglobe_title_array[1];

            var notificationListADiv = $('<a href=""><div class="chat-pro-img"><img src="" alt="" width="40" height="40"/></div><div class="chat-body"><span class="connection-name"></span><p class="msg"></p><span class="chat-date"></span></div></a>');

            // New conversation
            if (op > 0) {

                if (c.deleted) {
                    return;
                }

                if(title != 'undefined' && typeof convUsers[title] == 'undefined'){

                    for(let my_con in my_connections){

                        if(title === my_connections[my_con].user_name){

                            convUsers[title] = my_connections[my_con];

                            //TODO::Show only 5 and if more display 'see all'
                            notificationDiv = $('<div class="tab msg-holder" />')
                                .attr('id', notificationId.substring(1))
                                .append(notificationListADiv);

                            if(conv_ids.indexOf(c.id) == -1){

                                notificationWrapperDiv.append(notificationDiv)
                                conv_ids.push(c.id);
                            }

                            //Update Conversation data
                            var stamp = Lib.getRelativeTime(c.updated);
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

                            notificationDiv.find('a').attr('href', '/chat/'+title);
                            notificationDiv.find('.chat-pro-img').find('img').attr('src', connection_prof_img);
                            notificationDiv.find('.chat-body').find('.connection-name').html(connection_name);
                            notificationDiv.find('.chat-body').find('.msg').html(latestText);
                            notificationDiv.find('.chat-body').find('.chat-date').html(stamp);

                            // If the updated conversation is newer than the top one -
                            // move this conversation to the top
                            var notificationTop = notificationWrapperDiv.children(':first');
                            if (notificationTop.length > 0 && title != 'undefined') {
                                var notificationTopTabId = notificationTop.attr('id');
                                var notificationTopConvId = domIdToConversationId(notificationTopTabId);
                                var notificationTopConv = b6.getConversation(notificationTopConvId);

                                if (notificationTopConv && notificationTopConv.id != c.id && c.updated > notificationTopConv.updated) {
                                    notificationTop.before(notificationDiv);
                                }
                            }

                            if (c.unread > 0 && unreadConversationCount.indexOf(c.id) == -1) {
                                unreadCount += 1;
                                unreadConversationCount.push(c.id);
                            }

                            if(unreadCount > 0){
                                $("#unread_chat_count_header").html('<span class="total">'+unreadCount+'</span>');
                            } else{
                                $("#unread_chat_count_header").html('');
                            }

                        }
                    }

                }
            }
            if(op >= 0 && title != 'undefined'){

                //Update Conversation data
                var stamp = Lib.getRelativeTime(c.updated);
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

                notificationDiv.find('.chat-body').find('.msg').html(latestText);
                notificationDiv.find('.chat-body').find('.chat-date').html(stamp);

                // If the updated conversation is newer than the top one -
                // move this conversation to the top
                var notificationTop = notificationWrapperDiv.children(':first');
                if (notificationTop.length > 0 && title != 'undefined') {
                    var notificationTopTabId = notificationTop.attr('id');
                    var notificationTopConvId = domIdToConversationId(notificationTopTabId);
                    var notificationTopConv = b6.getConversation(notificationTopConvId);

                    if (notificationTopConv && notificationTopConv.id != c.id && c.updated > notificationTopConv.updated) {
                        notificationTop.before(notificationDiv);
                    }
                }

                if (c.unread > 0 && unreadConversationCount.indexOf(c.id) == -1) {
                    unreadCount += 1;
                    unreadConversationCount.push(c.id);
                }

                if(unreadCount > 0){
                    $("#unread_chat_count_header").html('<span class="total">'+unreadCount+'</span>');
                } else{
                    $("#unread_chat_count_header").html('');
                }
            }

        }

        function notificationDomIdForConversation(c){
            return '#notification__' + c.domId();
        }

        // Convert element id to a Conversation id
        function domIdToConversationId(id) {
            var r = id.split('__');
            id = r.length > 0 ? r[1] : id
            return bit6.Conversation.fromDomId(id);
        }

        this.startOutgoingCall = function(to, video){

            console.log("startOutgoingCall")

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

            console.log("startOutgoingCall")
            // Call progress
            c.on('progress', function() {
                console.log("progress")
                showInCallName();
            });
            // Number of video feeds/elements changed
            c.on('videos', function () {
                console.log("videos")
                var container = $('#videoContainer');
                var elems = container.children();
                $('#incomingCallAlert').modal('hide');
                container.attr('class', elems.length > 2 ? 'grid' : 'simple');
            });
            // Call answered
            c.on('answer', function() {
                console.log("answer")
                $('#incomingCallAlert').modal('hide');
                $('#onCall').text("on call")
                $('#clock').show();
                callTimer = window.setInterval(function(){
                    updateTime();
                },1000);

            });
            // Error during the call
            c.on('error', function() {
                console.log("error")
                $('#incomingCallAlert').modal('hide');
                $('#detailPane').addClass('hidden');
            });
            // Call ended
            c.on('end', function() {
                console.log("end")
                showInCallName();
                // No more dialogs?
                if (b6.dialogs.length === 0) {
                    // Hide InCall UI
                    $('#detailPane').addClass('hidden');
                }
                // Hide Incoming Call dialog
                // TODO: check that it was for this dialog
                $('#incomingCall')
                    .data({'dialog': null})
                    .hide();

                $("#videoContainer").html("");
                $('#incomingCallAlert').modal('hide');
                $('#detailPane').addClass('hidden');
                $('#clock').hide();
                window.clearInterval(callTimer);
                $("#hour").html("00");
                $("#min").html("00");
                $("#sec").html("00");
            });
        }

        function updateInCallUI(c, opts) {
            console.log("updateInCallUI")
            showInCallName();
            $('#detailPane').removeClass('hidden');
            // Do not show video feeds area for audio-only call
            var div = $('#videoContainer').toggle(c.options.video);
            // Start/update the call
            c.connect(opts);
        }

        // Show all the call participants
        function showInCallName() {
            console.log("showInCallName")
            var s = '';
            for(var i in b6.dialogs) {
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
                            $('#onCall').text("ringing")
                        }
                    }
                });
            }

        }

        // 'Answer Incoming Call' click
        this.answerCall = function(opts){
            console.log("answerCall")
            $('#incomingCallAlert').modal('hide');
            var d = $('#incomingCall').data();
            // Call controller
            if (d && d.dialog) {
                var c = d.dialog;
                // Accept the call, send local audio only
                updateInCallUI(c, opts);
            }
        };

        // 'Reject Incoming Call' click
        this.rejectCall = function(){
            console.log("rejectCall")
            var d = $('#incomingCall').data();
            // Call controller
            if (d && d.dialog) {
                // Reject call
                d.dialog.hangup();
            }
        };

        // 'Call Hangup' click
        this.hangupCall = function(){
            console.log("hangupCall")
            // Hangup all active calls
            var x = b6.dialogs.slice();
            for (var i in x) {
                x[i].hangup();
            }
        };

        function updateTime() {

            var hours = parseInt($('#hour').html());
            var minutes = parseInt($('#min').html());
            var seconds = parseInt($('#sec').html());

            var currentTotalTime = (hours*60*60) + (minutes*60) + seconds;

            currentTotalTime = currentTotalTime + 1;

            var newHours = 0;
            var newMinutes = 0;
            var newSeconds = 0;

            if (currentTotalTime > 3599) {
                var newHours = (currentTotalTime - (currentTotalTime % (60 * 60))) / (60 * 60);

                var newMins1 = currentTotalTime - (currentTotalTime % (60 * 60));

                var newMinutes = (newMins1 - (newMins1 % 60)) / 60;

                var newSeconds = (currentTotalTime % 60);

            } else if (currentTotalTime > 59) {
                var newMinutes = (currentTotalTime - (currentTotalTime % 60)) / 60;
                var newSeconds = (currentTotalTime % 60);
            } else {
                var newSeconds = currentTotalTime;
            }

            $('#hour').html(String(newHours).length==1?'0'+String(newHours):newHours);
            $('#min').html(String(newMinutes).length==1?'0'+String(newMinutes):newMinutes);
            $('#sec').html(String(newSeconds).length==1?'0'+String(newSeconds):newSeconds);

        }

        this.updateHeaderUnreadCount = function(conv_id){

            if(unreadConversationCount.indexOf(conv_id) != -1){
                unreadCount -= 1;
                unreadConversationCount.splice(unreadConversationCount.indexOf(conv_id),1);
            }
            if(unreadCount > 0){
                $("#unread_chat_count_header").html('<span class="total">'+unreadCount+'</span>');
            } else{
                $("#unread_chat_count_header").html('');
            }

        }

    }

}

export default new Chat;