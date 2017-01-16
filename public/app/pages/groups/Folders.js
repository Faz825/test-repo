/**
 * The Index view of the folder section
 */
import React from 'react';
import {Alert} from '../../config/Alert';
import Session  from '../../middleware/Session';

export default class Index extends React.Component{

    constructor(props) {

        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        this.state = {};
    }

    render() {

        return (
            <section className="group-content">
                <div className="group-folder-container">
                    <section className="folder-header">
                        <div className="row">
                            <div className="col-sm-7">
                                <h2>My Group Folder</h2>
                            </div>
                            <div className="col-sm-5">
                                <div className="search-folder">
                        <span className="inner-addon">
                            <i className="fa fa-search"></i>
                            <input type="text" className="form-control" placeholder="Search"/>
                        </span>
                                </div>
                                <div className="crt-folder">
                                    <button className="btn btn-crt-folder">
                                        <i className="fa fa-plus"></i> New Folder
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="folder-body">
                        <div className="row folder pink">
                            <div className="folder-wrapper">
                                <div className="drag-shader">
                                    <p className="drag-title">Drag and Drop Link/Folder here</p>
                                </div>
                                <div className="col-sm-2">
                                    <div className="folder-cover-wrapper">
                                        <span className="folder-overlay"></span>
                                        <span className="folder-overlay"></span>
                                        <div className="folder-cover">
                                            <div className="content-wrapper">
                                                <div className="logo-wrapper">
                                                    <img src="assets/images/user-rounded.png" alt="Folder Name" className="img-rounded"/>
                                                        <div className="logo-shader"></div>
                                                        <div className="logo-shader"></div>
                                                </div>
                                                <h3>My Folder</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-10">
                                    <div className="row">
                                        <div className="folder-content-wrapper">
                                            <div className="folder-items-wrapper">
                                                <div className="folder-col">
                                                    <div className="folder-item upload-file">
                                                        <i className="fa fa-plus"></i>
                                                        <p>Upload new file or image</p>
                                                    </div>
                                                </div>
                                                <div className="folder-col">
                                                    <div className="folder-item pdf">
                                                        <div className="time-wrapper">
                                                            <p className="date-created">July 28, 2016</p>
                                                            <p className="time-created">12.34pm</p>
                                                        </div>
                                                        <div className="folder-title-holder">
                                                            <p className="folder-title">Cambodia Final Paper</p>
                                                        </div>
                                                        <div className="item-type"></div>
                                                    </div>
                                                </div>
                                                <div className="folder-col">
                                                    <div className="folder-item doc">
                                                        <div className="time-wrapper">
                                                            <p className="date-created">July 28, 2016</p>
                                                            <p className="time-created">12.34pm</p>
                                                        </div>
                                                        <div className="folder-title-holder">
                                                            <p className="folder-title">Cambodia Final Paper</p>
                                                        </div>
                                                        <div className="item-type"></div>
                                                    </div>
                                                </div>
                                                <div className="folder-col">
                                                    <div className="folder-item image">
                                                        <div className="time-wrapper">
                                                            <p className="date-created">July 28, 2016</p>
                                                            <p className="time-created">12.34pm</p>
                                                        </div>
                                                        <div className="folder-title-holder">
                                                            <p className="folder-title">Cambodia Final Paper</p>
                                                        </div>
                                                        <div className="item-type"></div>
                                                    </div>
                                                </div>
                                                <div className="folder-col">
                                                    <div className="folder-item pdf">
                                                        <div className="time-wrapper">
                                                            <p className="date-created">July 28, 2016</p>
                                                            <p className="time-created">12.34pm</p>
                                                        </div>
                                                        <div className="folder-title-holder">
                                                            <p className="folder-title">Cambodia Final Paper</p>
                                                        </div>
                                                        <div className="item-type"></div>
                                                    </div>
                                                </div>
                                                <div className="folder-col">
                                                    <div className="folder-item doc">
                                                        <div className="time-wrapper">
                                                            <p className="date-created">July 28, 2016</p>
                                                            <p className="time-created">12.34pm</p>
                                                        </div>
                                                        <div className="folder-title-holder">
                                                            <p className="folder-title">Cambodia Final Paper</p>
                                                        </div>
                                                        <div className="item-type"></div>
                                                    </div>
                                                </div>
                                                <div className="folder-col">
                                                    <div className="folder-item image">
                                                        <div className="time-wrapper">
                                                            <p className="date-created">July 28, 2016</p>
                                                            <p className="time-created">12.34pm</p>
                                                        </div>
                                                        <div className="folder-title-holder">
                                                            <p className="folder-title">Cambodia Final Paper</p>
                                                        </div>
                                                        <div className="item-type"></div>
                                                    </div>
                                                </div>
                                                <div className="folder-col">
                                                    <div className="folder-item pdf">
                                                        <div className="time-wrapper">
                                                            <p className="date-created">July 28, 2016</p>
                                                            <p className="time-created">12.34pm</p>
                                                        </div>
                                                        <div className="folder-title-holder">
                                                            <p className="folder-title">Cambodia Final Paper</p>
                                                        </div>
                                                        <div className="item-type"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="see-all">
                                                <i className="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                                <p>See All</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row folder pink">
                            <div className="folder-wrapper drag">
                                <div className="drag-shader">
                                    <p className="drag-title">Drag and Drop Link/Folder here</p>
                                </div>
                                <div className="col-sm-2">
                                    <div className="folder-cover-wrapper">
                                        <span className="folder-overlay"></span>
                                        <span className="folder-overlay"></span>
                                        <div className="folder-cover">
                                            <div className="folder-overlay"></div>
                                            <div className="content-wrapper">
                                                <div className="logo-wrapper">
                                                    <img src="assets/images/user-rounded.png" alt="Folder Name" className="img-rounded"/>
                                                        <div className="logo-shader"></div>
                                                        <div className="logo-shader"></div>
                                                </div>
                                                <h3>Ambi</h3>
                                            </div>
                                            <div className="share-folder">
                                                <i className="fa fa-share-alt" aria-hidden="true"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-10">
                                    <div className="row">
                                        <div className="folder-content-wrapper">
                                            <div className="folder-items-wrapper">
                                                <div className="folder-col">
                                                    <div className="folder-item upload-file">
                                                        <i className="fa fa-plus"></i>
                                                        <p>Upload new file or image</p>
                                                    </div>
                                                </div>
                                                <div className="folder-col">
                                                    <div className="folder-item pdf">
                                                        <div className="time-wrapper">
                                                            <p className="date-created">July 28, 2016</p>
                                                            <p className="time-created">12.34pm</p>
                                                        </div>
                                                        <div className="folder-title-holder">
                                                            <p className="folder-title">Cambodia Final Paper</p>
                                                        </div>
                                                        <div className="item-type"></div>
                                                    </div>
                                                </div>
                                                <div className="folder-col">
                                                    <div className="folder-item doc">
                                                        <div className="time-wrapper">
                                                            <p className="date-created">July 28, 2016</p>
                                                            <p className="time-created">12.34pm</p>
                                                        </div>
                                                        <div className="folder-title-holder">
                                                            <p className="folder-title">Cambodia Final Paper</p>
                                                        </div>
                                                        <div className="item-type"></div>
                                                    </div>
                                                </div>
                                                <div className="folder-col">
                                                    <div className="folder-item image">
                                                        <div className="time-wrapper">
                                                            <p className="date-created">July 28, 2016</p>
                                                            <p className="time-created">12.34pm</p>
                                                        </div>
                                                        <div className="folder-title-holder">
                                                            <p className="folder-title">Cambodia Final Paper</p>
                                                        </div>
                                                        <div className="item-type"></div>
                                                    </div>
                                                </div>
                                                <div className="folder-col">
                                                    <div className="folder-item pdf">
                                                        <div className="time-wrapper">
                                                            <p className="date-created">July 28, 2016</p>
                                                            <p className="time-created">12.34pm</p>
                                                        </div>
                                                        <div className="folder-title-holder">
                                                            <p className="folder-title">Cambodia Final Paper</p>
                                                        </div>
                                                        <div className="item-type"></div>
                                                    </div>
                                                </div>
                                                <div className="folder-col">
                                                    <div className="folder-item doc">
                                                        <div className="time-wrapper">
                                                            <p className="date-created">July 28, 2016</p>
                                                            <p className="time-created">12.34pm</p>
                                                        </div>
                                                        <div className="folder-title-holder">
                                                            <p className="folder-title">Cambodia Final Paper</p>
                                                        </div>
                                                        <div className="item-type"></div>
                                                    </div>
                                                </div>
                                                <div className="folder-col">
                                                    <div className="folder-item image">
                                                        <div className="time-wrapper">
                                                            <p className="date-created">July 28, 2016</p>
                                                            <p className="time-created">12.34pm</p>
                                                        </div>
                                                        <div className="folder-title-holder">
                                                            <p className="folder-title">Cambodia Final Paper</p>
                                                        </div>
                                                        <div className="item-type"></div>
                                                    </div>
                                                </div>
                                                <div className="folder-col">
                                                    <div className="folder-item pdf">
                                                        <div className="time-wrapper">
                                                            <p className="date-created">July 28, 2016</p>
                                                            <p className="time-created">12.34pm</p>
                                                        </div>
                                                        <div className="folder-title-holder">
                                                            <p className="folder-title">Cambodia Final Paper</p>
                                                        </div>
                                                        <div className="item-type"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="see-all">
                                                <i className="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                                <p>See All</p>
                                            </div>
                                        </div>
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
