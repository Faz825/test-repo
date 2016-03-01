import React from 'react';
import Session  from '../../middleware/Session';
import Autosuggest from 'react-autosuggest';

export default class SkillsAndInterests extends React.Component{
    constructor(props){
        super(props);
        this.state={
            loggedUser:Session.getSession('prg_lg'),
            editFormVisible : false,
            data : {}
        };

        this.editForm = this.editForm.bind(this);
        this.closeForm = this.closeForm.bind(this);
        this.loadSkills();

        this.tempdata = {
            day_to_day_comforts:[
                {skillID: 1, skill: "CSS"},
                {skillID: 2, skill: "JSON"},
                {skillID: 3, skill: "JS"},
                {skillID: 4, skill: "HTML"},
                {skillID: 5, skill: "jQuery"},
                {skillID: 6, skill: "React"},
                {skillID: 7, skill: "Angular"},
                {skillID: 8, skill: "nodeJs"}
            ],
            experienced:[
                {skillID: 1, skill: "CSS"},
                {skillID: 2, skill: "JSON"},
                {skillID: 3, skill: "JS"},
                {skillID: 4, skill: "jQuery"},
                {skillID: 5, skill: "HTML"}
            ]
        }

    }

    loadSkills(){
        $.ajax({
            url: '/work-experiences/'+this.props.uname,
            method: "GET",
            dataType: "JSON",
            data:{uname:this.props.uname},
            success: function (data, text) {

                if (data.status.code == 200) {

                    this.setState({data:data.user});

                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });
    };

    editForm(data){
        let formIsVisible = this.state.editFormVisible;
        this.setState({editFormVisible : !formIsVisible});

        console.log(data);
    }

    closeForm(){
        let formIsVisible = this.state.editFormVisible;
        this.setState({editFormVisible : !formIsVisible});
    }

    render() {
        let read_only = (this.state.loggedUser.id == this.state.data.user_id)?false:true;
        return (
            <div id="background-skills-container" className="pg-section-container">
                <div className="pg-section" id="skill-interest">
                    <div className="pg-header">
                        <h3 className="pg-header-main-title">SKILLS AND INTERESTS</h3>
                        {
                            (!read_only)?
                            <div className="pg-edit-tools">
                                <button className="pg-edit-btn" onClick={this.editForm}>
                                    <i className="fa fa-plus edit-add" /> Add Skill
                                    </button>
                                </div>
                            : null
                        }
                    </div>
                    {this.state.editFormVisible? <SkillsForm data={this.tempdata} onFormSave={this.editForm} onFormClose={this.closeForm} /> : null}
                    <div className="pg-body-item pg-entity">
                        <div className="pg-edit-action-area">
                            <div className="row-clr col-xs-6 row-clr-pad">
                                <h3 className="pg-header-sub-title">Day-to-day comforts</h3>
                                <SkillTagList skills={this.tempdata.day_to_day_comforts} editable=""/>
                            </div>
                            <div className="row-clr col-xs-6">
                                <h3 className="pg-header-sub-title">Experience with</h3>
                                <SkillTagList skills={this.tempdata.experienced} editable=""/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const skills = [
    {skillID: 1, skill: "CSS"},
    {skillID: 2, skill: "JSON"},
    {skillID: 3, skill: "JS"},
    {skillID: 4, skill: "HTML"},
    {skillID: 5, skill: "jQuery"},
    {skillID: 6, skill: "React"},
    {skillID: 7, skill: "Angular"},
    {skillID: 8, skill: "nodeJs"}
];

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestions(value) {
  const escapedValue = escapeRegexCharacters(value.trim());

  if (escapedValue === '') {
    return [];
  }

  const regex = new RegExp('^' + escapedValue, 'i');

  return skills.filter(skills => regex.test(skills.skill));
}

function getSuggestionValue(suggestion) {
  return suggestion.skill;
}

function renderSuggestion(suggestion) {
  return (
    <span>{suggestion.skill}</span>
  );
}

export class SkillsForm extends React.Component{
    constructor(props){
        super(props);

        this.state={
            formData : this.props.data,
            updatedData : "",
            value: '',
            suggestions: getSuggestions(''),
            checked : false
        };

        this.skills = {
            day_to_day_comforts:{
                add : [],
                remove : []
            },
            experienced:{
                add : [],
                remove : []
            }
        }

        this.skillId = [];
        this.removeSkill = this.removeSkill.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSkillAdd = this.onSkillAdd.bind(this);
        this.onSuggestionsUpdateRequested = this.onSuggestionsUpdateRequested.bind(this);
    }

    removeSkill(id,type){
        let skillData = this.state.formData;
        let removeData = this.skills;

        removeData[type].remove.push(id);
        this.skills = removeData;

        for (var key in skillData[type]) {
            if (skillData[type][key].skillID == id) delete skillData[type][key];
        }

        this.setState({formData : skillData, updatedData : removeData});
    }

    onFormSave(e){
        e.preventDefault();
        this.props.onFormSave(this.state.updatedData);
    }

    onChange(event, { newValue }) {
        this.setState({
          value: newValue
        });
    }

    onSuggestionsUpdateRequested({ value }) {
        this.setState({
          suggestions: getSuggestions(value)
        });
    }

    onSkillAdd(){
        let skillName = this.state.value;
        let addData = this.skills;
        let formSkillData = this.state.formData;

        let typeSelected = (this.state.checked)? 'day_to_day_comforts' : 'experienced';

        for (var key in skills) {
            if(skills[key].skill == skillName){
                let id = skills[key].skillID;
                addData[typeSelected].add.push(id)
            }
        }

        for (var key in formSkillData[typeSelected]) {
            formSkillData[typeSelected][{
                "skill": skillName
            }]
        }

        this.skills = addData;

        this.setState({formData : formSkillData});
    }

    onCheck(){
        let checked = this.state.checked;

        this.setState({checked : !checked});
    }

    render() {
        const { value, suggestions } = this.state;
        const inputProps = {
          placeholder: 'What are your areas of expertise?',
          value,
          onChange: this.onChange
        };
        console.log(this.state.formData);
        return (
            <div className="form-area" id="skills-form">
                <div className="form-group inline-content">
                    <label className="pg-itel-lbl">Add Skills & interests</label>
                    <Autosuggest suggestions={suggestions}
                        onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested}
                        getSuggestionValue={getSuggestionValue}
                        renderSuggestion={renderSuggestion}
                        inputProps={inputProps} />
                    <div className="checkbox">
                        <label>
                            <input className="pg-experience-current-option" type="checkbox" name="day_to_day_comforts" checked={this.state.checked} onChange={this.onCheck.bind(this)} />Is this Skill a Day today Comfort?
                        </label>
                    </div>
                    <button type="button" className="btn btn-primary pg-inline-item-btn" onClick={this.onSkillAdd}>Add</button>
                </div>
                <form onSubmit={this.onFormSave.bind(this)}>
                    <div className="form-group">
                        <label>Day-to-day comforts</label>
                        <div className="pg-edit-skills-area">
                            <SkillTagList skills={this.state.formData.day_to_day_comforts} type="day_to_day_comforts" editable="true" removeSkill={this.removeSkill} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Experience with</label>
                        <div className="pg-edit-skills-area">
                            <SkillTagList skills={this.state.formData.experienced} type="experienced" editable="true" removeSkill={this.removeSkill} />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary pg-btn-custom">Save</button>
                    <button type="button" className="btn btn-default pg-btn-custom" onClick={this.props.onFormClose}>Cancel</button>
                </form>
            </div>
        );
    }
}

const SkillTagList = ({skills,editable,type,removeSkill}) => {

    let _this = this;

    return (
        <ul className="skills-edit-section">
            {
                skills.map(function(skill,index){
                    return(
                        <li className="pg-endrose-item" key={index}>
                            <span className="pg-endorse-item-name" >{skill.skill}</span>
                            {(editable)? <i className="fa fa-times pg-skill-delete-icon" onClick={(event)=>removeSkill(skill.skillID, type)}/> : null}
                        </li>
                    )
                })
            }
        </ul>
    );
}
