/**
 * This component is to store work exp. information
 */
import React from 'react';
import Session  from '../../middleware/Session';

export default class WorkExperience extends React.Component{
    constructor(props) {
        super(props);
        let uname = this.props.uname;
        this.state={
            loggedUser:Session.getSession('prg_lg'),
            uname:uname,
            editFormVisible: false,
            formData : ""
        };

        this.editForm = this.editForm.bind(this);
        this.updateWorkExperience = this.updateWorkExperience.bind(this);

        let _this = this;

    }

    editForm(data){
        let visibility = this.state.editFormVisible;
        this.setState({editFormVisible : !visibility, formData : data});
    }

    updateWorkExperience(data){
        console.log(data)
        let loggedUser = Session.getSession('prg_lg');

        $.ajax({
            url: '/work-experience/update',
            method: "POST",
            dataType: "JSON",
            data:data,
            headers: { 'prg-auth-header':loggedUser.token },
            success: function (data, text) {
                if(data.status.code == 200){
                    this.props.loadExperiences(this.state.uname)
                }

            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }.bind(this)
        });
        this.setState({editFormVisible: false});
    }

    render(){
        console.log(this.props);
        let read_only = (this.state.loggedUser.id == this.props.data.user_id)?false:true;
        let _this = this;

        if(Object.keys(this.props.data).length ==0){
            return (<div> Loading ....</div>);
        }
        return (
            <div id="background-experience-container" className="pg-section-container">
                <div className="pg-section">
                    <div className="pg-header">
                        <h3 className="pg-header-main-title">WORK EXPERIENCE</h3>
                            {
                                (!read_only)?
                                <div className="pg-edit-tools">
                                    <button className="pg-edit-btn"  onClick={this.editForm}>
                                        <i className="fa fa-plus edit-add"></i> Add Position
                                    </button>
                                </div>
                                : null
                            }
                    </div>
                    <div className="pg-body-item">
                        {
                            (this.state.editFormVisible)?
                            <WorkPlaceForm data={this.state.formData} onSubmit={this.updateWorkExperience} onCancel={this.editForm} />
                            : null
                        }
                    </div>
                    {
                        this.props.data.working_experiences.map(function(data,index){
                            return <WorkPlaces readOnly={read_only} data={data} key={index} onEdit={_this.editForm} />
                        })
                    }
                </div>
            </div>
        );
    }
}


export class WorkPlaces extends React.Component{
    constructor(props){
        super(props);

        this.state={
            editFormVisible: false
        }

        this.editForm = this.editForm.bind(this);
        this.monthList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    }
    componentDidMount(){

    }

    editForm(){
        this.props.onEdit(this.props.data);
    }
    getTimePeriod(start_date,end_date,is_current_work_place){

        let _formatted_date_str = "",
             _worked_year = 0;
        let today = new Date();

        _formatted_date_str += (start_date.month > 0)?this.monthList[start_date.month]+" ":"";
        _formatted_date_str += (start_date.year > 0)?start_date.year+" ":"";

        if(is_current_work_place ){
            _worked_year = (start_date.year > 0)?today.getFullYear() - start_date.year:0;
            _formatted_date_str += "- Current";
        }
        if(end_date != null && end_date.year >0 && end_date.month > 0){
            _worked_year =end_date.year - start_date.year;
            _formatted_date_str += " - "+ this.monthList[end_date.month] + " "+ end_date.year;

        }

        if(_worked_year >0){
            _formatted_date_str += " ("+_worked_year+" years)";
        }
        return _formatted_date_str;
    }
    render() {
        let readOnly = this.props.readOnly;
        let data = this.props.data;
        let _time_period = this.getTimePeriod(data.start_date,data.left_date,data.is_current_work_place);
        return (
            <div className="pg-body-item">
                <header>
                    {
                        (data.title)?
                        <h4 className="pg-entity-control-field">
                            <div className="pg-main-header-field  pg-field" title="Click to edit this experience">
                                <span className="pg-field-text">{data.title}</span>
                                {
                                    (!readOnly)?
                                    <button className="pg-edit-field pg-edit-field-button" onClick={this.editForm}>
                                        <i className="fa fa-pencil"></i>
                                    </button>
                                    : null
                                }
                            </div>
                        </h4>
                        : (!readOnly)?<button onClick={this.editForm.bind(this)} className="addEduInfo">Add Title</button>:null
                    }
                    {
                        (data.company_name)?
                        <h5 className="pg-entity-control-field">
                            <div className="pg-sub-header-field  pg-field" title="Click to edit this experience">
                                 <span className="pg-field-text">
                                     <span className="company">{data.company_name + ", "} </span>
                                     <span className="period">{_time_period} </span>
                                     <span className="location"> {data.location}</span>
                                 </span>
                                 {
                                     (!readOnly)?
                                     <button className="pg-edit-field pg-edit-field-button" onClick={this.editForm}>
                                         <i className="fa fa-pencil"></i>
                                     </button>
                                     : null
                                 }
                            </div>
                        </h5>
                        : (!readOnly)?<button onClick={this.editForm.bind(this)} className="addEduInfo">Add Company Details</button>:null
                    }

                </header>
                {
                    (data.description)?
                    <p className="pg-description pg-field">
                         <span className="pg-field-text">
                            {data.description}
                         </span>
                         {
                             (!readOnly)?
                             <button className="pg-edit-field pg-edit-field-button" onClick={this.editForm}>
                                 <i className="fa fa-pencil"></i>
                             </button>
                             : null
                         }
                    </p>
                    : (!readOnly)?<button onClick={this.editForm.bind(this)} className="addEduInfo">Add Title Description</button>:null
                }
            </div>
        );
    }

}

export class WorkPlaceForm extends React.Component{
    constructor(props){
        super(props);
        let data = this.props.data;

        this.state = {
            formData : {
                exp_id      :(typeof data.exp_id != 'undefined')?data.exp_id:null,
                title       : data.title,
                company     : data.company_name,
                fromMonth   : (data.start_date != null && data.start_date.month >0)?data.start_date.month:null,
                fromYear    : (data.start_date != null) ? data.start_date.year:null,
                toMonth     : (data.left_date != null && data.left_date.month >0)?data.left_date.month:null,
                toYear      : (data.left_date != null)?data.left_date.year:null,
                location    : data.location,
                currentPlc  : (typeof data.is_current_work_place != 'undefined')?data.is_current_work_place:false,
                description : data.description
            }
        }

        this.onFieldChange = this.onFieldChange.bind(this);

    }
    componentDidMount(){

    }

    onFieldChange(e){
        let _fieldName = e.target.name;
        let _fieldValue = e.target.value;
        let _workData = this.state.formData;

        if(_fieldName == "currentPlc"){
            _fieldValue = (_workData.currentPlc)? "" : "yes";
        }

        _workData[_fieldName] = _fieldValue;
        this.setState({formData : _workData});
    }

    onFormSubmit(e){
        e.preventDefault();
        this.props.onSubmit(this.state.formData);
    }

    render() {
        let data = this.state.formData;
        let today = new Date();
        let currentYear = today.getFullYear();
        let yearList = [];
        for (var i = (currentYear - 20); i <= currentYear; i++) {
            yearList.push(i);
        }
        let monthList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


        return (
            <div className="form-area" id="experience-form">
                <form onSubmit={this.onFormSubmit.bind(this)}>
                    <div className="form-group">
                        <label>Company Name</label>
                        <input type="text" value={data.company} name="company" onChange={this.onFieldChange} className="form-control pg-custom-input"  placeholder="" />
                    </div>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" value={data.title} name="title" onChange={this.onFieldChange} className="form-control pg-custom-input"  placeholder="" />
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input type="text" value={data.location} name="location" onChange={this.onFieldChange} className="form-control pg-custom-input"  placeholder="" />
                    </div>
                    <div className="form-group">
                        <label className="display-block">Time Period</label>
                        <div className="yearDropDownHolder">
                            <div className="workPeriodSelect">
                                <select className="form-control pg-custom-input pg-dropdown" name="fromMonth" onChange={this.onFieldChange} value={data.fromMonth}>
                                    <option value="">Choose</option>
                                    {
                                        monthList.map(function(month,index){
                                            return <option value={index+1} key={index}>{month}</option>
                                        })
                                    }
                                </select>
                                <select className="form-control pg-custom-input pg-dropdown" name="fromYear" onChange={this.onFieldChange} value={data.fromYear}>
                                    <option value="">Choose</option>
                                    {
                                        yearList.map(function(year,index){
                                            return <option value={year} key={index}>{year}</option>
                                        })
                                    }
                                </select>
                            </div>
                            {
                                (!data.currentPlc)?
                                <span className="to">&nbsp;–&nbsp;</span>
                                : null
                            }
                            {
                                (!data.currentPlc)?
                                <div className="workPeriodSelect lastDrpDwn">
                                    <select className="form-control pg-custom-input pg-dropdown" name="toMonth" onChange={this.onFieldChange} value={data.toMonth}>
                                        <option value="">Choose</option>
                                        {
                                            monthList.map(function(month,index){
                                                return <option value={index+1} key={index}>{month}</option>
                                            })
                                        }
                                    </select>
                                    <select className="form-control pg-custom-input pg-dropdown" name="toYear" onChange={this.onFieldChange} value={data.toYear}>
                                        <option value="">Choose</option>
                                        {
                                            yearList.map(function(year,index){
                                                return <option value={year} key={index}>{year}</option>
                                            })
                                        }
                                    </select>
                                </div>
                                :null
                            }
                        </div>

                        <div className="checkbox">
                            <label>
                                <input className="pg-experience-current-option" type="checkbox" name="currentPlc" checked={data.currentPlc} onChange={this.onFieldChange} />I currently work here
                            </label>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea className="form-control non-resize" value={data.description} onChange={this.onFieldChange} name="description" rows="3"></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary pg-btn-custom">Save</button>
                    <button type="button" className="btn btn-default pg-btn-custom" onClick={this.props.onCancel}>Cancel</button>
                </form>
            </div>
        );
    }
}
