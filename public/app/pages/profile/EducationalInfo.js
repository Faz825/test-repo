/**
 * This component is to store education information
 */
import React from 'react';
import Session  from '../../middleware/Session';

export default class EducationalInfo extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            loggedUser:Session.getSession('prg_lg'),
            user:{}
        };

        let _this = this;
        $.ajax({
            url: '/get-profile/'+this.props.uname,
            method: "GET",
            dataType: "JSON",
            success: function (data, text) {

                if (data.status.code == 200) {

                    this.setState({user:data.profile_data});

                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });
    }

    componentDidMount(){

    }
    render(){
        let profileName = this.state.user.first_name + " " + this.state.user.last_name;
        let read_only = (this.state.loggedUser.id == this.state.user.user_id)?false:true;

        return (
            <div className="row row-clr">
                <div className="container-fluid">
                    <div className="col-xs-10 col-xs-offset-1" id="middle-content-wrapper">
                        <div className="col-xs-6" id="profile-middle-container-left-col">
                            <div id="pg-profile-middle-container-left-col-details">
                                <div className="row row-clr pg-profile-heading">
                                    <h1>{profileName + "'s"} Resume</h1>

                                    <Education readOnly={read_only} />
                                </div>


                            </div>
                        </div>
                        <div className="col-xs-6"></div>
                    </div>
                </div>
            </div>

        );
    }
}


class Education extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            editFormVisible: false
        }
    }

    componentDidMount(){

    }

    editForm(field){
        let visibility = this.state.editFormVisible;

        console.log(field)

        this.setState({editFormVisible : !visibility});
    }

    render() {
        let readOnly = this.props.readOnly;

        return (
            <div className="row row-clr pg-profile-content">
                <div id="background-education-container" className="pg-section-container">
                    <div className="pg-section">
                         <div className="pg-header">
                            <h3>Education</h3>
                            {
                                (!readOnly)?
                                <div className="pg-edit-tools">
                                    <button className="pg-edit-btn"  onClick={this.editForm.bind(this)}>
                                        <i className="fa fa-plus edit-add"></i> Add education
                                    </button>
                                </div>
                                : null
                            }
                         </div>
                        <div className="pg-body-item">
                            {
                                (this.state.editFormVisible)?
                                <div className="form-area" id="education-form">
                                    <form>
                                        <div className="form-group">
                                            <label>School</label>
                                            <input type="text" className="form-control pg-custom-input" name="pg-form-school" id="pg-form-school" placeholder="School" />
                                        </div>
                                        <div className="form-group">
                                            <label className="display-block">Dates Attend</label>
                                            <select className="form-control pg-custom-input pg-dropdown">
                                                <option>1</option>
                                                <option>2</option>
                                                <option>3</option>
                                                <option>4</option>
                                                <option>5</option>
                                            </select>
                                            <span className="to">&nbsp;–&nbsp;</span>
                                            <select className="form-control pg-custom-input pg-dropdown">
                                                <option>1</option>
                                                <option>2</option>
                                                <option>3</option>
                                                <option>4</option>
                                                <option>5</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Degree</label>
                                            <input type="text" className="form-control pg-custom-input" name="pg-form-degree" id="pg-form-degree" placeholder="Degree" />
                                        </div>
                                        <div className="form-group">
                                            <label>Activities and Societies</label>
                                            <textarea className="form-control" rows="3"></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea className="form-control" rows="3"></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-primary pg-btn-custom">Save</button>
                                        <button type="button" className="btn btn-default pg-btn-custom" onclick="toggle_visibility('education-form');">Cancel</button>
                                    </form>
                                </div>
                                : null
                            }
                            <header>
                                <University fieldName="university" readOnly={readOnly} editing={this.editForm.bind(this)} />
                                <Degree fieldName="degree" readOnly={readOnly} editing={this.editForm.bind(this)} />
                            </header>
                            <Duration fieldName="duration" readOnly={readOnly} editing={this.editForm.bind(this)} />
                            <Description fieldName="desc" readOnly={readOnly} editing={this.editForm.bind(this)} />
                            <Activities fieldName="activities" readOnly={readOnly} editing={this.editForm.bind(this)} />
                        </div>

                        <div className="pg-body-item">
                            <header>
                                <h4 className="pg-entity-control-field">
                                    <div className="pg-main-header-field  pg-field" title="Click to edit this education">
                                        <span className="pg-field-text">NSBM</span>
                                        <button className="pg-edit-field pg-edit-field-button"  onclick="toggle_visibility('education-form');">
                                            <i className="fa fa-pencil"></i>
                                        </button>
                                    </div>
                                </h4>
                            </header>
                            <div className="pg-empty-fields-area">
                                <button onClick={this.editForm.bind(this)} >Add Degree</button>
                                <button onClick={this.editForm.bind(this)} >Add Dates Attended</button>
                                <button onClick={this.editForm.bind(this)} >Add Grade</button>
                                <button onClick={this.editForm.bind(this)} >Add Activities and Societies</button>
                                <button onClick={this.editForm.bind(this)} >Add Description</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


}

export class University extends React.Component{
    constructor(props){
        super(props);

    }

    editField(){
        this.props.editing(this.props.fieldName);
    }

    render() {
        let readOnly = this.props.readOnly;
        return (
            <h4 className="pg-entity-control-field">
                <div className="pg-main-header-field  pg-field" title="Click to edit this education">
                    <span className="pg-field-text">University of Moratuwa</span>
                    {
                        (!readOnly)?
                        <button className="pg-edit-field pg-edit-field-button" onClick={this.editField.bind(this)}>
                            <i className="fa fa-pencil"></i>
                        </button>
                        : null

                    }
                </div>
            </h4>
        );
    }
}

export class Degree extends React.Component{
    constructor(props){
        super(props);

    }

    editField(){
        this.props.editing(this.props.fieldName);
    }

    render() {
        let readOnly = this.props.readOnly;
        return (
            <h5 className="pg-entity-control-field">
                <div className="pg-sub-header-field  pg-field" title="Click to edit this education">
                    <span className="pg-field-text">
                        <span className="degree">Bachelor Of Information Technology</span>
                        <span className="grade"> , A </span>
                    </span>
                    {
                        (!readOnly)?
                        <button className="pg-edit-field pg-edit-field-button" onClick={this.editField.bind(this)} >
                            <i className="fa fa-pencil"></i>
                        </button>
                        : null

                    }
                </div>
            </h5>
        );
    }
}

export class Duration extends React.Component{
    constructor(props){
        super(props);

    }

    editField(){
        this.props.editing(this.props.fieldName);
    }

    render() {
        let readOnly = this.props.readOnly;
        return (
            <div className="pg-date-area pg-field">
                <span className="pg-field-text">
                    <time>2015</time>
                    <time> - 2018</time>
                </span>
                {
                    (!readOnly)?
                    <button className="pg-edit-field pg-edit-field-button" onClick={this.editField.bind(this)} >
                        <i className="fa fa-pencil"></i>
                    </button>
                    : null

                }
            </div>
        );
    }
}

export class Description extends React.Component{
    constructor(props){
        super(props);

    }

    editField(){
        this.props.editing(this.props.fieldName);
    }

    render() {
        let readOnly = this.props.readOnly;
        return (
            <p className="pg-description pg-field">
                 <span className="pg-field-text">
                     Provosts Award for Community Service, 1999.
                     President of Student-Youth Alliance mentoring over 100 local middle school
                     students each week. Led annual student Blood Drive program,
                     increased student participation by over 75%.
                 </span>
                 {
                     (!readOnly)?
                     <button className="pg-edit-field pg-edit-field-button" onClick={this.editField.bind(this)} >
                         <i className="fa fa-pencil"></i>
                     </button>
                     : null

                 }
            </p>
        );
    }
}

export class Activities extends React.Component{
    constructor(props){
        super(props);

    }

    editField(){
        this.props.editing(this.props.fieldName);
    }

    render() {
        let readOnly = this.props.readOnly;
        return (
            <p className="pg-activities">
                <em className="date-header-field">Activities and Societies:&nbsp;</em>
                <span className="pg-field">
                     <span className="pg-field-text">
                        Alpha Phi Omega, Chamber Chorale, Debate Team
                     </span>
                    {
                        (!readOnly)?
                        <button className="pg-edit-field pg-edit-field-button" onClick={this.editField.bind(this)} >
                            <i className="fa fa-pencil"></i>
                        </button>
                        : null
                    }
                </span>
            </p>
        );
    }
}
