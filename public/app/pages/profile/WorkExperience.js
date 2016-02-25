/**
 * This component is to store work exp. information
 */
import React from 'react';
import Session  from '../../middleware/Session';

const workData = [
    {
        title : "UI Developer",
        company : "825Media",
        fromMonth : "September",
        fromYear : "2011",
        toMonth : "August",
        toYear : "2015",
        duration : "4 year",
        location : "Colombo 03",
        currentPlc : "yes",
        description : "Provosts Award for Community Service, 1999. President of Student-Youth Alliance mentoring over 100 local middle school students each week. Led annual student Blood Drive program, increased student participation by over 75%."
    },
    {
        title : "UI Designer",
        company : "825Media",
        fromMonth : "October",
        fromYear : "2014",
        toMonth : "August",
        toYear : "2015",
        duration : "1 year",
        location : "Colombo 07",
        currentPlc : "",
        description : "Provosts Award for Community Service, 1999. President of Student-Youth Alliance mentoring over 100 local middle school students each week. Led annual student Blood Drive program, increased student participation by over 75%."
    },
    {
        title : "UX Dev",
        company : "",
        fromMonth : "",
        fromYear : "",
        toMonth : "",
        toYear : "",
        duration : "",
        location : "",
        currentPlc : "",
        description : ""
    }
]

export default class WorkExperience extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            loggedUser:Session.getSession('prg_lg'),
            user:{},
            editFormVisible: false,
            formData : ""
        };

        this.editForm = this.editForm.bind(this);
        this.formUpdate = this.formUpdate.bind(this);

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

    editForm(data){
        let visibility = this.state.editFormVisible;

        this.setState({editFormVisible : !visibility, formData : data});
    }

    formUpdate(data){
        console.log(data);
        this.setState({editFormVisible: false});
    }

    render(){
        let read_only = (this.state.loggedUser.id == this.state.user.user_id)?false:true;
        let _this = this;

        console.log(this.state.editFormVisible);

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
                            <WorkPlaceForm data={this.state.formData} onSubmit={this.formUpdate} onCancel={this.editForm} />
                            : null
                        }
                    </div>
                    {
                        workData.map(function(data,index){
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

    }
    componentDidMount(){

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
                        : <button onClick={this.editForm.bind(this)} className="addEduInfo">Add Title</button>
                    }
                    {
                        (data.company)?
                        <h5 className="pg-entity-control-field">
                            <div className="pg-sub-header-field  pg-field" title="Click to edit this experience">
                                 <span className="pg-field-text">
                                     <span className="company">{data.company + ", "}</span>
                                     <span className="period">{data.fromMonth} {data.fromYear} – {data.toMonth} {data.toYear} {" (" + data.duration + "), "}</span>
                                     <span className="location">{data.location}</span>
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
                        : <button onClick={this.editForm.bind(this)} className="addEduInfo">Add Company Details</button>
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
                    : <button onClick={this.editForm.bind(this)} className="addEduInfo">Add Title Description</button>
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
                title       : data.title,
                company     : data.company,
                fromMonth   : data.fromMonth,
                fromYear    : data.fromYear,
                toMonth     : data.toMonth,
                toYear      : data.toYear,
                duration    : data.duration,
                location    : data.location,
                currentPlc  : data.currentPlc,
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
            console.log(_workData.currentPlc);
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
        let yearList = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
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
                        <select className="form-control pg-custom-input pg-dropdown" name="fromMonth" onChange={this.onFieldChange} value={data.fromMonth}>
                            <option value="">Choose</option>
                            {
                                monthList.map(function(month,index){
                                    return <option value={month} key={index}>{month}</option>
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
                        <span className="to">&nbsp;–&nbsp;</span>
                        <select className="form-control pg-custom-input pg-dropdown" name="toMonth" onChange={this.onFieldChange} value={data.toMonth}>
                            <option value="">Choose</option>
                            {
                                monthList.map(function(month,index){
                                    return <option value={month} key={index}>{month}</option>
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
