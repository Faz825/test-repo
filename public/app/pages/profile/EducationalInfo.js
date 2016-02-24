/**
 * This component is to store education information
 */
import React from 'react';
import Session  from '../../middleware/Session';

const data = [
    {
        university : "University of Moratuwa",
        degree : "Bachelor Of Information Technology",
        grade : "A",
        duration_from : "2001",
        duration_to : "2005",
        description : "Provosts Award for Community Service, 1999. President of Student-Youth Alliance mentoring over 100 local middle school students each week. Led annual student Blood Drive program, increased student participation by over 75%.",
        activities : "Alpha Phi Omega, Chamber Chorale, Debate Team"
    },
    {
        university : "University of Cambridge",
        degree : "Masters Of Information Technology",
        grade : "A",
        duration_from : "2001",
        duration_to : "2005",
        description : "Provosts Award for Community Service, 1999. President of Student-Youth Alliance mentoring over 100 local middle school students each week. Led annual student Blood Drive program, increased student participation by over 75%.",
        activities : "Alpha Phi Omega, Chamber Chorale, Debate Team"
    },
    {
        university : "University of Greenwich",
        degree : "",
        grade : "",
        duration_from : "",
        duration_to : "",
        description : "",
        activities : ""
    }
]

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

                                    <Education readOnly={read_only} data={data}/>
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
            editFormVisible: false,
            formData : ""
        }

        this.editForm = this.editForm.bind(this);
        this.formUpdate = this.formUpdate.bind(this);
    }

    componentDidMount(){

    }

    editForm(data){
        console.log(data);
        let visibility = this.state.editFormVisible;

        this.setState({editFormVisible : !visibility, formData : data});
    }

    formUpdate(data){
        console.log(data);
        this.setState({editFormVisible: false});
    }

    render() {
        let readOnly = this.props.readOnly;
        let _this = this;

        return (
            <div className="row row-clr pg-profile-content">
                <div id="background-education-container" className="pg-section-container">
                    <div className="pg-section">
                         <div className="pg-header">
                            <h3>Education</h3>
                            {
                                (!readOnly)?
                                <div className="pg-edit-tools">
                                    <button className="pg-edit-btn"  onClick={this.editForm}>
                                        <i className="fa fa-plus edit-add"></i> Add education
                                    </button>
                                </div>
                                : null
                            }
                         </div>
                        <div className="pg-body-item">
                            {
                                (this.state.editFormVisible)?
                                <EducationForm data={this.state.formData} onSubmit={this.formUpdate} onCancel={this.editForm} />
                                : null
                            }

                        </div>

                        {this.props.data.map(function(data,id){
                            return(
                                <University readOnly={readOnly} onEdit={_this.editForm} data={data} key={id}/>
                            )
                        })}

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

    editForm(){
        this.props.onEdit(this.props.data);
    }

    render() {
        let readOnly = this.props.readOnly;
        let data = this.props.data;

        return (
            <div className="pg-body-item">
                <header>
                    <h4 className="pg-entity-control-field">
                        <div className="pg-main-header-field  pg-field" title="Click to edit this education">
                            <span className="pg-field-text">{data.university}</span>
                            {
                                (!readOnly)?
                                <button className="pg-edit-field pg-edit-field-button" onClick={this.editForm.bind(this)}>
                                    <i className="fa fa-pencil"></i>
                                </button>
                                : null

                            }
                        </div>
                    </h4>
                    {
                        (data.degree)?
                        <h5 className="pg-entity-control-field">
                            <div className="pg-sub-header-field  pg-field" title="Click to edit this education">
                                <span className="pg-field-text">
                                    <span className="degree">{data.degree}</span>
                                    <span className="grade">{data.grade}</span>
                                </span>
                                {
                                    (!readOnly)?
                                    <button className="pg-edit-field pg-edit-field-button" onClick={this.editForm.bind(this)} >
                                        <i className="fa fa-pencil"></i>
                                    </button>
                                    : null

                                }
                            </div>
                        </h5>
                        : <button onClick={this.editForm.bind(this)} className="addEduInfo">Add Degree</button>
                    }
                </header>
                <div className="pg-empty-fields-area">
                    {
                        (data.duration_from && data.duration_to)?
                        <div className="pg-date-area pg-field">
                            <span className="pg-field-text">
                                <time>{data.duration_from} - {data.duration_to}</time>
                            </span>
                            {
                                (!readOnly)?
                                <button className="pg-edit-field pg-edit-field-button" onClick={this.editForm.bind(this)} >
                                    <i className="fa fa-pencil"></i>
                                </button>
                                : null

                            }
                        </div>
                        : <button onClick={this.editForm.bind(this)} className="addEduInfo">Add Duration</button>
                    }

                    {
                        (data.description)?
                        <p className="pg-description pg-field">
                             <span className="pg-field-text">
                                {data.description}
                             </span>
                             {
                                 (!readOnly)?
                                 <button className="pg-edit-field pg-edit-field-button" onClick={this.editForm.bind(this)} >
                                     <i className="fa fa-pencil"></i>
                                 </button>
                                 : null

                             }
                        </p>
                        : <button onClick={this.editForm.bind(this)} className="addEduInfo">Add Description</button>
                    }

                    {
                        (data.activities)?
                        <p className="pg-activities">
                            <em className="date-header-field">Activities and Societies:&nbsp;</em>
                            <span className="pg-field">
                                 <span className="pg-field-text">
                                    {data.activities}
                                 </span>
                                {
                                    (!readOnly)?
                                    <button className="pg-edit-field pg-edit-field-button" onClick={this.editForm.bind(this)} >
                                        <i className="fa fa-pencil"></i>
                                    </button>
                                    : null
                                }
                            </span>
                        </p>
                        : <button onClick={this.editForm.bind(this)} className="addEduInfo">Add Activities</button>
                    }


                </div>
            </div>
        );
    }
}

export class EducationForm extends React.Component{
    constructor(props){
        super(props);
        let data = this.props.data;

        this.state = {
            formData : {
                university : data.university,
                duration_from : data.duration_from,
                duration_to : data.duration_to,
                degree : data.degree,
                grade : data.grade,
                description : data.description,
                activities : data.activities
            }

        }

        this.fieldChangeHandler = this.fieldChangeHandler.bind(this);
    }

    fieldChangeHandler(e){
        let fieldName = e.target.name,
            _fieldValue = e.target.value;
        let _edu_data = this.state.formData;

        _edu_data[fieldName] = _fieldValue;
        this.setState({formData:_edu_data});
    }

    formSave(e){
        e.preventDefault();
        this.props.onSubmit(this.state.formData)
    }

    render() {
        let formData = this.state.formData;
        let yearList = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];

        return (
            <div className="form-area" id="education-form">
                <form onSubmit={this.formSave.bind(this)}>
                    <div className="form-group">
                        <label>School</label>
                        <input type="text" value={formData.university} className="form-control pg-custom-input" name="university" id="pg-form-school" placeholder="" onChange={this.fieldChangeHandler} />
                    </div>
                    <div className="form-group">
                        <label className="display-block">Dates Attend</label>
                        <select className="form-control pg-custom-input pg-dropdown" value={formData.duration_from} name="duration_from" onChange={this.fieldChangeHandler} >
                            {yearList.map(function(year, i){
                                return <option value={year} key={i} > {year}</option>
                            })}
                        </select>
                        <span className="to">&nbsp;–&nbsp;</span>
                        <select className="form-control pg-custom-input pg-dropdown" value={formData.duration_to} name="duration_to" onChange={this.fieldChangeHandler} >
                            {yearList.map(function(year, i){
                                return <option value={year} key={i} > {year}</option>
                            })}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Degree</label>
                        <input type="text" className="form-control pg-custom-input" value={formData.degree} name="degree" id="pg-form-degree" placeholder="" onChange={this.fieldChangeHandler} />
                    </div>
                    <div className="form-group">
                        <label>Activities and Societies</label>
                        <textarea className="form-control" name="activities" rows="3" value={formData.activities} onChange={this.fieldChangeHandler} ></textarea>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={this.fieldChangeHandler} ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary pg-btn-custom">Save</button>
                    <button type="button" className="btn btn-default pg-btn-custom" onClick={this.props.onCancel}>Cancel</button>
                </form>
            </div>
        );
    }

}
