
import React from 'react';
import Session  from '../../middleware/Session';
import GroupHeader from './GroupHeader';
import Folders from './Folders';
import Discussion from './Discussion';

export default class GroupsLayout extends React.Component {

    constructor(props) {

        let user = Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        this.state = {
            groupLayout : 'folder',
            user: user,
            group_name:'',
            group:{}
        };

        this.setGroupLayout = this.setGroupLayout.bind(this);

    }

    componentDidMount() {
        var groupPrefix = this.props.params.name;
        let _data = {
            name_prefix : groupPrefix
        };

        $.ajax({
            url : '/groups/get-group',
            method : "POST",
            data : _data,
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    console.log(data);
                    console.log("GROUP DATA FETCHED");
                    this.setState({group_name: groupPrefix, group: data.group});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
                this.setState({group_name: groupPrefix});
            }
        });
    }

    setGroupLayout(_value) {
        console.log("_value @ setGroupLayout", _value);
        this.setState({groupLayout:_value});
    }

    loadLayoutPage() {

        switch(this.state.groupLayout) {
            case 'discussion':
                return (<Discussion myGroup={this.state.group}/>);
            case 'calendar':
                return null;
            case 'chat':
                return null;
            case 'notebook':
                return null;
            case 'folder':
                return  (<Folders myGroup={this.state.group}/>);
            case 'task_manager':
                return null;
            default:
                return null;
        }
    }

    render() {
        return (

            <section className="group-container">
                <div className="container">
                    <GroupHeader setGroupLayout={this.setGroupLayout} />
                    {this.loadLayoutPage()}
                </div>
            </section>

        );
    }

}