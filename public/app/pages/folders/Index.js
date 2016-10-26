/**
 * This is folders index class that handle all
 */
import React from 'react';

export default class Index extends React.Component{
    constructor(props){
        super(props);

        this.state={}
    }

    render(){
        return(
            <section className="folder-container">
                <div className="container">
                    <section className="folder-header">
                        <div className="row">
                            <div className="col-sm-3">
                                <h2>Folders</h2>
                            </div>
                            <div className="col-sm-4">
                                <div className="folder-type active">
                                    <h4>My Folders</h4>
                                    <div className="highlighter"></div>
                                    
                                </div>
                                <div className="folder-type">
                                    <h4>Group Folders</h4>
                                    <div className="highlighter"></div>
                                </div>
                            </div>
                            <div className="col-sm-5">
                                <div className="crt-folder">
                                    <button className="btn btn-crt-folder"><i className="fa fa-plus"></i> Create Folder</button>
                                </div>
                                <div className="search-folder">
                                    <div className="inner-addon">
                                        <i className="fa fa-search"></i>
                                        <input type="text" className="form-control" placeholder="Search"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        );
    }

}
