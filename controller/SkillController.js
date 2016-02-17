'use strict'

var SkillController ={


    /**
     * add new skill / skills
     * @param req
     * @param res
     * @returns {number}
     */
    addSkills:function(req,res){

        //var req_skills = JSON.parse(req.body.skills);

        var req_skills = ["HTML", "CSS", "Javascript"];

        if(req_skills.length >= 1 ) {

            var new_skills = [],
                now = new Date(),
                Skill = require('mongoose').model('Skill');

            for (var i = 0; req_skills.length > i; i++) {
                new_skills.push({
                    name: req_skills[i],
                    created_at: now
                });
            }

            Skill.create(new_skills, function(resultSet){
                res.status(resultSet.status).json(resultSet);
            });

        }else{
            res.status(200);
            return 0;
        }

    },

    /**
     * get all the skills in the collection
     * @param req
     * @param res
     */
    getSkills:function(req,res){
        var Skill = require('mongoose').model('Skill');

        Skill.getSkills(function(dataSet){

            if(dataSet.status !== 400){
                res.status(200).send(dataSet.result);
                return 0;
            }else{
                res.status(400).send(dataSet);
                return 0;
            }

        })
    },

    /**
     * get a skill by id
     * @param req
     * @param res
     */
    getSkillById:function(req,res){
        var Skill = require('mongoose').model('Skill');

        var skill_id = req.params.id;console.log(skill_id)

        Skill.getSkillById(skill_id, function(dataSet){

            if(dataSet.status !== 400){
                res.status(200).send(dataSet.result);
                return 0;
            }else{
                res.status(400).send(dataSet);
                return 0;
            }

        })
    },

    /**
     * update a skill by id
     * @param req
     * @param res
     */
    updateSkill:function(req,res){

        var Skill = require('mongoose').model('Skill');

        var skill_id = "56c43351f468ba8913f3d128"; //req.body.id

        var data = {
            name:"HTML5"
        }

        Skill.updateSkill(skill_id,data,function(dataSet){
            res.status(dataSet.status).json(dataSet);
        })

    },


    /**
     * delete a skill by id
     * @param req
     * @param res
     */
    deleteSkill:function(req,res){

        var Skill = require('mongoose').model('Skill');

        var skill_id = "56c43351f468ba8913f3d128";//req.body.id

        Skill.deleteSkill(skill_id, function(dataSet){
            res.status(dataSet.status).json(dataSet);
        })

    }

}
module.exports = SkillController;