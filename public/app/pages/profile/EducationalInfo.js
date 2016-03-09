/**
 * This component is to store education information
 */
import React from 'react';
import SelectDateDropdown from '../../components/elements/SelectDateDropdown'
import Session  from '../../middleware/Session';


export default class EducationalInfo extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            loggedUser:Session.getSession('prg_lg'),
            data:{},
        };
        this.updateEducationInfo = this.updateEducationInfo.bind(this);
        this.loadEducation();
    }



    updateEducationInfo(eduData){
        let loggedUser = Session.getSession('prg_lg');

        $.ajax({
            url: '/education/update',
            method: "POST",
            dataType: "JSON",
            data:eduData,
            headers: { 'prg-auth-header':loggedUser.token },
            success: function (data, text) {
                if(data.status.code == 200 ){
                    this.loadEducation()
                }

            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }.bind(this)
        });

    };
    loadEducation(){
        $.ajax({
            url: '/educations/'+this.props.uname,
            method: "GET",
            dataType: "JSON",
            data:{uname:this.props.uname},
            success: function (data, text) {

                if (data.status.code == 200 && data.user !=null) {
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
    render(){
        let profileName = this.state.data.first_name + " " + this.state.data.last_name;
        let read_only = (this.state.loggedUser.id == this.state.data.user_id)?false:true;

        if(Object.keys(this.state.data).length ==0){
            return (<div> Loading ....</div>);
        }

        return (
            <div>
                <div className="row row-clr pg-profile-heading">
                    <h1>{profileName + "'s"} Resume</h1>
                </div>
                <Education readOnly={read_only} data={this.state.data}  updateEducationInfo = {this.updateEducationInfo} />
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
        let visibility = this.state.editFormVisible;

        this.setState({editFormVisible : !visibility, formData : data});
    }

    formUpdate(data){

        this.props.updateEducationInfo(data);
        this.setState({editFormVisible: false});
    }

    render() {
        let readOnly = this.props.readOnly;
        let _this = this;

        if(Object.keys(this.props.data.education_details).length ==0){
            return (<div> Loading ....</div>);
        }

        return (
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
                    <div className="form-holder">
                        {
                            (this.state.editFormVisible)?
                            <EducationForm data={this.state.formData} onSubmit={this.formUpdate} onCancel={this.editForm} />
                            : null
                        }

                    </div>
                        {this.props.data.education_details.map(function(data,id){
                            return(
                                <University readOnly={readOnly}
                                            onEdit={_this.editForm}
                                            data={data}
                                            key={id}
                                            user_id={_this.props.data.user_id}/>
                            )
                        })}


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
        let _frm_data = this.props.data;
        _frm_data['user_id'] = this.props.user_id;
        console.log(_frm_data)
        this.props.onEdit(_frm_data);
    }
    getDate(date){
        let dt = {
            date:"",
            month:"",
            year:""
        };
        if( date != null ){
            let split_date = date.split("-");
            dt = {
                date:split_date[0],
                month:split_date[1],
                year:split_date[2]
            }
        }
        return dt;
    }

    render() {
        let readOnly = this.props.readOnly;
        let data = this.props.data;
        let _date_attended_from =this.getDate(data.date_attended_from),
            _date_attended_to   =this.getDate(data.date_attended_to) ;

        return (
            <div className="pg-body-item">
                <header>
                    <h4 className="pg-entity-control-field">
                        <div className="pg-main-header-field  pg-field" title="Click to edit this education">
                            <span className="pg-field-text">{data.school}</span>
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
                        : (!readOnly)? <button onClick={this.editForm.bind(this)} className="addEduInfo">Add Degree</button> :null
                    }
                </header>
                <div className="pg-empty-fields-area">
                    {
                        (data.date_attended_to)?
                        <div className="pg-date-area pg-field">
                            <span className="pg-field-text">
                                {/*<time>{_date_attended_from.year} - {_date_attended_to.year} </time>*/}
                                <time>{_date_attended_to.year} </time>
                            </span>
                            {
                                (!readOnly)?
                                <button className="pg-edit-field pg-edit-field-button" onClick={this.editForm.bind(this)} >
                                    <i className="fa fa-pencil"></i>
                                </button>
                                : null

                            }
                        </div>
                        : (!readOnly)?<button onClick={this.editForm.bind(this)} className="addEduInfo">Add Duration</button>:null
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
                        : (!readOnly)?
                            <button onClick={this.editForm.bind(this)} className="addEduInfo">Add Description</button>
                            :null
                    }

                    {
                        (data.activities_societies)?
                        <p className="pg-activities">
                            <em className="date-header-field">Activities and Societies:&nbsp;</em>
                            <span className="pg-field">
                                 <span className="pg-field-text">
                                    {data.activities_societies}
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
                        : (!readOnly)?
                            <button onClick={this.editForm.bind(this)} className="addEduInfo">Add Activities</button>
                            :null
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
                edu_id:(data.edu_id)?data.edu_id:null,
                school : data.school,
                date_attended_from : data.date_attended_from,
                date_attended_to : data.date_attended_to,
                degree : data.degree,
                grade : data.grade,
                description : data.description,
                activities_societies : data.activities_societies,
                user_id:data.user_id
            }

        }

        this.fieldChangeHandler = this.fieldChangeHandler.bind(this);
        this.timePeriodUpdate = this.timePeriodUpdate.bind(this);
    }

    fieldChangeHandler(e){
        let fieldName = e.target.name,
            _fieldValue = e.target.value;
        let _edu_data = this.state.formData;

        _edu_data[fieldName] = _fieldValue;
        this.setState({formData:_edu_data});
    }

    timePeriodUpdate(name,date){
        let _edu_data = this.state.formData;

        _edu_data[name] = date;
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
                        <input type="text" value={formData.school} className="form-control pg-custom-input" name="school" id="pg-form-school" placeholder="" onChange={this.fieldChangeHandler} />
                    </div>
                    {/*<div className="form-group">
                        <label className="display-block">Dates Attend</label>
                        <select className="form-control pg-custom-input pg-dropdown" value={formData.date_attended_from} name="date_attended_from" onChange={this.fieldChangeHandler} >
                            {yearList.map(function(year, i){
                                return <option value={year} key={i} > {year}</option>
                            })}
                        </select>
                        <span className="to">&nbsp;–&nbsp;</span>
                        <select className="form-control pg-custom-input pg-dropdown" value={formData.date_attended_to} name="date_attended_to" onChange={this.fieldChangeHandler} >
                            {yearList.map(function(year, i){
                                return <option value={year} key={i} > {year}</option>
                            })}
                        </select>
                    </div>*/}
                    <div className="form-group datePicker">
                        <SelectDateDropdown
                            title="Dates Attend"
                            dateFormat="mm-dd-yyyy"
                            defaultOpt={formData.date_attended_to}
                            optChange={this.timePeriodUpdate}
                            required=""
                            dateType="date_attended_to"/>
                    </div>
                    <div className="form-group">
                        <label>Degree</label>
                        <input type="text" className="form-control pg-custom-input" value={formData.degree} name="degree" id="pg-form-degree" placeholder="" onChange={this.fieldChangeHandler} />
                    </div>
                    <div className="form-group">
                        <label>Activities and Societies</label>
                        <textarea className="form-control" name="activities_societies" rows="3" value={formData.activities_societies} onChange={this.fieldChangeHandler} ></textarea>
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
