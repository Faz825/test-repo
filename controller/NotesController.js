'use strict';

/**
 * Handle note related operation in the class
 */

var NotesController ={

    addNoteBook:function(req,res){

        var NoteBook = require('mongoose').model('NoteBook');

        //var CurrentSession = Util.getCurrentSession(req);
        //var notebookName = req.body.notebookName;
        //var notebookColor = req.body.notebookColor;
        //var userId = CurrentSession.id;

        var _notebook = {
            name:req.body.notebookName,
            color:req.body.notebookColor,
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

        //var CurrentSession = Util.getCurrentSession(req);
        //var noteName = req.body.noteName;
        //var noteContent = req.body.noteContent;
        //var userId = CurrentSession.id;
        //var notebookId = req.body.notebookId;

        var _note = {
            name:req.body.noteName,
            content:req.body.noteContent,
            user_id:Util.getCurrentSession(req).id,
            notebook_id:req.body.notebookId
        };

        Note.addNewNote(_note,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    getNotes:function(req,res){

        var Note = require('mongoose').model('Notes');

        //var criteria = {user_id:Util.getCurrentSession(req).id};

        Note.getNotes({user_id:Util.toObjectId("5702078a79409fc607b61699")},function(resultSet){
            if(resultSet.status == 200){
                var outPut ={
                    status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    notes:resultSet.notes
                };
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

    }

};

module.exports = NotesController;
