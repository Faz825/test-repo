/**
 * This is folders index class that handle all
 */
import React from 'react';
import Session from '../../middleware/Session';

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
                    <section className="folder-body">
                        <Folder />
                    </section>
                </div>
            </section>
        );
    }

}

export class Folder extends React.Component{
    constructor(props){
        super(props);

        this.state={}
    }

    render(){
        return(
            <div className="row folder pink see-all">
                <div className="folder-wrapper">
                    <div className="col-sm-3">
                        <div className="folder-cover-wrapper">
                            <div className="folder-cover">
                                <div className="folder-overlay"></div>
                                <div className="content-wrapper">
                                    <div className="logo-wrapper">
                                        <img src="assets/images/user-rounded.png" alt="Folder Name" className="img-rounded" />
                                        <span className="logo-shader"></span>
                                        <span className="logo-shader"></span>
                                    </div>
                                    <h3>My Folder</h3>
                                </div>
                            </div>
                            <div className="folder-peak"></div>
                        </div>
                    </div>
                    <div className="col-sm-9">
                        <div className="row">
                            <div className="folder-content-wrapper">
                                <div className="folder-items-wrapper">
                                    <div className="folder-col">
                                        <div className="folder-item upload-file">
                                            <i className="fa fa-plus"></i>
                                            <p>Upload new file or image</p>
                                        </div>
                                    </div>
                                    <File />
                                    <div className="see-all">
                                        <i className="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                        <p>See All</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export class File extends React.Component{
    constructor(props){
        super(props);

        this.state={}
    }

    render(){
        return(
            <div className="folder-col">
                <div className="folder-item pdf">
                    <div className="time-wrapper">
                        <p className="date-created">July 28, 2016</p>
                        <p className="time-created">12.34pm</p>
                    </div>
                    <div className="folder-title-holder">
                        <p className="folder-title">Cambodia Final Paper</p>
                    </div>
                    <span className="item-type"></span>
                </div>
            </div>
        );
    }
}
