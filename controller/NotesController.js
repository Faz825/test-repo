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
            NoteBook = require('mongoose').model('NoteBook');

        var user_id = Util.getCurrentSession(req).id;
        var criteria = {user_id:Util.toObjectId(user_id)};

        _async.waterfall([
            function getNotebooks(callBack){
                NoteBook.getNotebooks(criteria,function(resultSet){
                    callBack(null,resultSet.notebooks);
                });
            },
            function getNotes(notebooks,callBack){
                Note.getNotes(criteria,function(resultSet){
                    var notes = resultSet.notes;
                    var _notes = [];
                    var _notebook_ids = [];

                    for(var a = 0; a<notebooks.length; a++){
                        var _notebook = {
                            notebook_id:notebooks[a]._id,
                            notebook_name:notebooks[a].name,
                            notebook_color:notebooks[a].color,
                            notes:[]
                        };
                        _notebook_ids.push(notebooks[a]._id.toString());
                        _notes.push(_notebook);
                    }

                    for(var b = 0; b<notes.length; b++){

                        if(notes[b].notebook_id != null) {
                            var _index = _notebook_ids.indexOf(notes[b].notebook_id.toString());//console.log(_index)
                            if (_index != -1) {
                                var _note = {
                                    note_id: notes[b]._id,
                                    note_name: notes[b].name,
                                    note_content: notes[b].content,
                                    updated_at: DateTime.noteCreatedDate(notes[b].updated_at)
                                };
                                _notes[_index].notes.push(_note)
                            }
                        }

                    }

                    callBack(null,_notes);
                });
            }

        ],function(err,resultSet){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                notes:resultSet
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

        var NoteBook = require('mongoose').model('NoteBook');

        var criteria = {
            _id:req.body.noteBookId
        };

        var updateData = {
            shared_users:req.body.sharedUsers,
        };

        NoteBook.shareNoteBook(criteria,updateData,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });
    }

};

module.exports = NotesController;
