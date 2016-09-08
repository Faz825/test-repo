'use strict';

/**
 * Handle note related operation in the class
 */

var NotesController ={

    addNoteBook:function(req,res){

        var NoteBook = require('mongoose').model('NoteBook');

        var _notebook = {
            name:req.body.notebookName,
            color:req.body.notebookColor,
            isDefault:req.body.isDefault,
            user_id:Util.getCurrentSession(req).id
        };

        NoteBook.addNewNoteBook(_notebook,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    addNote:function(req,res) {

        var Note = require('mongoose').model('Notes');

        var _note = {
            name:req.body.noteName,
            content:req.body.noteContent,
            user_id:Util.getCurrentSession(req).id,
            notebook_id:req.body.notebookId
        };

        Note.addNewNote(_note,function(resultSet){
            if(resultSet.status == 200){
                var outPut ={
                    status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    note:resultSet.note
                }
                res.status(200).json(outPut);
                //res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    getNotes:function(req,res){

        var Note = require('mongoose').model('Notes'),
            _async = require('async'),
            grep = require('grep-from-array'),
            NoteBook = require('mongoose').model('NoteBook'),
            CurrentSession = Util.getCurrentSession(req),
            _this = this;

        var user_id = CurrentSession.id;
        var criteria = {user_id:Util.toObjectId(user_id)};
        var my_note;

        _async.waterfall([
            function getNotebooks(callBack){
                NoteBook.getNotebooks(criteria,function(resultSet){
                    callBack(null,resultSet.notebooks);
                });
            },
            function getNotesDB(notebooks,callBack){
                var _notes = [];
                _async.eachSeries(notebooks, function(notebook, callBack){
                    var _notebook = {
                        notebook_id:notebook._id,
                        notebook_name:notebook.name,
                        notebook_color:notebook.color,
                        notebook_user:notebook.user_id,
                        notebook_shared_users:notebook.shared_users,
                        notebook_updated_at:notebook.updated_at,
                        is_shared: false,
                        shared_privacy: NoteBookSharedMode.READ_WRITE,
                        notes:[]
                    }, notes_criteria = {
                        notebook_id: Util.toObjectId(notebook._id)
                    };

                    Note.getNotes(notes_criteria,function(resultSet){
                        var notes_set = resultSet.notes;
                        for(var inc = 0; inc < notes_set.length; inc++){
                            var _note = {
                                note_id: notes_set[inc]._id,
                                note_name: notes_set[inc].name,
                                note_content: notes_set[inc].content,
                                updated_at: DateTime.noteCreatedDate(notes_set[inc].updated_at)
                            };
                            _notebook.notes[inc] = _note;
                        }
                        if(_notebook.notebook_name == 'My Notes'){
                            my_note = _notebook;
                        }else {
                            _notes.push(_notebook);
                        }

                        callBack(null);
                    });
                },function(err){
                    callBack(null,_notes);
                });

                // Note.getNotes(criteria,function(resultSet){
                //     var notes = resultSet.notes;
                //     var _notes = [];
                //     var _notebook_ids = [];
                //
                //     for(var a = 0; a<notebooks.length; a++){
                //         var _notebook = {
                //             notebook_id:notebooks[a]._id,
                //             notebook_name:notebooks[a].name,
                //             notebook_color:notebooks[a].color,
                //             notebook_user:notebooks[a].user_id,
                //             notes:[]
                //         };
                //         _notebook_ids.push(notebooks[a]._id.toString());
                //         _notes.push(_notebook);
                //     }
                //
                //     for(var b = 0; b<notes.length; b++){
                //
                //         if(notes[b].notebook_id != null) {
                //             var _index = _notebook_ids.indexOf(notes[b].notebook_id.toString());//console.log(_index)
                //             if (_index != -1) {
                //                 var _note = {
                //                     note_id: notes[b]._id,
                //                     note_name: notes[b].name,
                //                     note_content: notes[b].content,
                //                     updated_at: DateTime.noteCreatedDate(notes[b].updated_at)
                //                 };
                //                 _notes[_index].notes.push(_note)
                //             }
                //         }
                //
                //     }
                //
                //     callBack(null,_notes);
                // });
            },
            function getSharedNoteBooks(resultSet, callBack){
                var user_id = CurrentSession.id;

                var query={
                    q:"_id:"+user_id.toString()
                };
                NoteBook.ch_getSharedNoteBooks(user_id, query, function (esResultSet){
                    callBack(null, {
                        user_notes: resultSet,
                        shared_notes: esResultSet
                    });
                });

            },
            function getSharedNotes(resultSet, callBack){

                if(resultSet.shared_notes != null){
                    var sharedNoteList = resultSet.shared_notes.result[0].notebooks;
                    var _notes = (resultSet.user_notes != null)? resultSet.user_notes: [];
                    _async.eachSeries(sharedNoteList, function(notebook, callBack){
                        console.log(notebook);
                        _async.waterfall([
                            function getNotebooks(callBack){
                                NoteBook.getNotebookById(notebook,function(resultSet){
                                    callBack(null,resultSet);
                                });
                            },
                            function getNotesDB(notebook,callBack){
                                var _notebook = {
                                    notebook_id:notebook._id,
                                    notebook_name:notebook.name,
                                    notebook_color:notebook.color,
                                    notebook_user:notebook.user_id,
                                    notebook_shared_users:notebook.shared_users,
                                    notebook_updated_at:notebook.updated_at,
                                    is_shared: true,
                                    shared_privacy: NoteBookSharedMode.READ_ONLY,
                                    notes:[]
                                }, notes_criteria = {
                                    notebook_id: Util.toObjectId(notebook._id)
                                };

                                var notebook_sharedUser = grep(_notebook.notebook_shared_users, function(e){ return e.user_id == user_id; });

                                _notebook.shared_privacy = notebook_sharedUser[0].shared_type;

                                if(notebook_sharedUser.length > 0 && notebook_sharedUser[0].status == NoteBookSharedRequest.REQUEST_ACCEPTED){
                                    Note.getNotes(notes_criteria,function(resultSet){
                                        var notes_set = resultSet.notes;
                                        for(var inc = 0; inc < notes_set.length; inc++){
                                            var _note = {
                                                note_id: notes_set[inc]._id,
                                                note_name: notes_set[inc].name,
                                                note_content: notes_set[inc].content,
                                                updated_at: DateTime.noteCreatedDate(notes_set[inc].updated_at)
                                            };
                                            _notebook.notes[inc] = _note;
                                        }
                                        _notes.push(_notebook);
                                        callBack(null);
                                    });
                                }else{
                                    callBack(null);
                                }
                            }
                        ],function(err){
                            callBack(null);
                        });

                    },function(err){
                        callBack(null, _notes);
                    });

                }else {
                    callBack(null, resultSet.user_notes);
                }
            }

        ],function(err,resultSet){

            var sorted_resultSet  = Util.sortByKeyDES(resultSet, 'notebook_updated_at');
            sorted_resultSet.unshift(my_note);

            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                notes:sorted_resultSet
            }
            res.status(200).json(outPut);
        });

    },

    getNote:function(req,res){

        var Note = require('mongoose').model('Notes');

        var note_id = req.params.note_id;
        var criteria = {_id:Util.toObjectId(note_id)};

        Note.getNote(criteria, function(resultSet){
            if(resultSet.status == 200){
                var outPut ={
                    status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    note:resultSet.note
                }
                res.status(200).json(outPut);
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    updateNote:function(req,res){

        var Note = require('mongoose').model('Notes');

        var criteria = {
            _id:req.body.noteId
        };

        var updateData = {
            name:req.body.noteName,
            content:req.body.noteContent
        };

        Note.updateNote(criteria,updateData,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    deleteNote:function(req,res){

        var Note = require('mongoose').model('Notes');

        var criteria = {
            _id:req.body.noteId
        };

        Note.deleteNote(criteria,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    shareNoteBook:function(req,res){

        var _async = require('async'),
            NoteBook = require('mongoose').model('NoteBook'),
            CurrentSession = Util.getCurrentSession(req),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');

        var noteBookId = req.body.noteBookId;

        var notifyUsers = [];

        _async.waterfall([

            function getNoteBook(callBack) {
                var noteBook = NoteBook.getNotebookById(noteBookId, function (resultSet) {
                    callBack(null, resultSet);
                });
            },
            function shareNoteBook(resultSet, callBack) {
                var sharedUsers = resultSet.shared_users;
                notifyUsers = resultSet.shared_users;
                _async.waterfall([
                    function isESIndexExists(callBack){
                        var _cache_key = "idx_notebook:"+NoteBookConfig.CACHE_PREFIX+req.body.userId.toString();
                        var query={
                            q:"_id:" + req.body.userId.toString(),
                            index:_cache_key
                        };
                        ES.isIndexExists(query, function (esResultSet){
                            callBack(null, esResultSet);
                        });
                    },
                    function getSharedNoteBooks(resultSet, callBack){
                        if(resultSet) {
                            var query = {
                                q: "_id:" + req.body.userId.toString()
                            };
                            NoteBook.ch_getSharedNoteBooks(req.body.userId, query, function (esResultSet) {
                                callBack(null, esResultSet);
                            });
                        }else{
                            callBack(null, null);
                        }
                    },
                    function ch_shareNoteBook(resultSet, callBack) {
                        if(resultSet != null){
                            var notebook_list = resultSet.result[0].notebooks;

                            notebook_list.push(noteBookId);
                            var query={
                                    q:"user_id:"+req.body.userId.toString()
                                },
                                data = {
                                    user_id: req.body.userId,
                                    notebooks: notebook_list
                                };

                            NoteBook.ch_shareNoteBookUpdateIndex(req.body.userId,data, function(esResultSet){
                                callBack(null);
                            });
                        }else{
                            var query={
                                q:"user_id:"+req.body.userId.toString()
                            },
                            data = {
                                user_id: req.body.userId,
                                notebooks: [noteBookId]
                            };
                            NoteBook.ch_shareNoteBookCreateIndex(req.body.userId,data, function(esResultSet){
                               callBack(null);
                            });
                        }
                    },
                    function saveInDB(callBack){
                        var _sharingUser = {
                            user_id: req.body.userId,
                            shared_type: NoteBookSharedMode.READ_WRITE,
                            status: NoteBookSharedRequest.REQUEST_PENDING
                        };
                        sharedUsers.push(_sharingUser);

                        var _sharedUsers = {
                            shared_users: sharedUsers
                        }

                        NoteBook.shareNoteBook(noteBookId,_sharedUsers,function(resultSet){
                            callBack(null);
                        });
                    }
                ], function (err, resultSet) {
                    callBack(null);
                });

            },
            function addNotification(callBack){

                if(notifyUsers.length > 0){

                    var _data = {
                        sender:CurrentSession.id,
                        notification_type:Notifications.SHARE_NOTEBOOK,
                        notified_notebook:noteBookId
                    }
                    Notification.saveNotification(_data, function(res){
                        if(res.status == 200){
                            //_commentData['notification_id'] = res.result._id;
                            callBack(null,res.result._id);
                        }

                    });

                } else{
                    callBack(null);
                }
            },
            function notifyingUsers(notification_id, callBack){
                var userList = [];
                for(var i = 0; notifyUsers.length > i; i++) {
                    userList.push(notifyUsers[i].user_id);
                }
                console.log(userList);
                if(typeof notification_id != 'undefined' && userList.length > 0){

                    var _data = {
                        notification_id:notification_id,
                        recipients:userList
                    };
                    NotificationRecipient.saveRecipients(_data, function(res){
                        callBack(null);
                    })

                } else{
                    callBack(null);
                }
            }

        ], function (err, resultSet) {
            if (err) {
                console.log(err);
                return;
            }
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                notes: resultSet
            }
            res.status(200).json(outPut);
        });

    }

};

module.exports = NotesController;
