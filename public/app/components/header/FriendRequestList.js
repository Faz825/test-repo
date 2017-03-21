import React from 'react';
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';

export default class FriendRequestList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            seeAll: false
        };
    }

    toggleRequestList(){
        let _rql = this.state.seeAll;
        this.setState({
            seeAll: !_rql
        });
    }

    render() {

        let _dummyRequests = [
            {
                profileImg: "/images/header-icons/dropdown/pic1.png",
                profName: "Science Group",
                subTitle: "8 mutual Friends",
                requestedTime: "2 hours ago",

            },
            {
                profileImg: "/images/header-icons/dropdown/pic2.png",
                profName: "Tamia Bello",
                subTitle: "20 mutual Friends",
                requestedTime: "yesterday",

            },
            {
                profileImg: "/images/header-icons/dropdown/pic3.png",
                profName: "Jayden Rye",
                subTitle: "20 mutual Friends",
                requestedTime: "last friday",

            },
            {
                profileImg: "/images/header-icons/dropdown/pic4.png",
                profName: "Leah Amber",
                subTitle: "8 mutual Friends",
                requestedTime: "last thursday",

            },
            {
                profileImg: "/images/header-icons/dropdown/pic5.png",
                profName: "Helena Hernanez",
                subTitle: "20 mutual Friends",
                requestedTime: "about a week ago",

            },
            {
                profileImg: "/images/header-icons/dropdown/pic6.png",
                profName: "Tony Pham",
                subTitle: "in Science Group",
                requestedTime: "about a week ago",

            },
            {
                profileImg: "/images/header-icons/dropdown/pic7.png",
                profName: "Sarah Serif",
                subTitle: "in History 101",
                requestedTime: "about a month ago",

            },
            {
                profileImg: "/images/header-icons/dropdown/pic6.png",
                profName: "Tony Pham",
                subTitle: "in Science Group",
                requestedTime: "about a month ago",

            }
        ];

        let _requestsMap = _dummyRequests.map(function(request ,key){
            return (
                <RequestItem profileImg={request.profileImg} profName={request.profName} subTitle={request.subTitle} requestedTime={request.requestedTime} key={key}/>
            );
        });

        return (
            <section className="friends-popover-holder">
                <div className="inner-wrapper">
                    <div className="popover-header">
                        <p className="friend-requests">friend requests</p>
                        <p className="find-friends">find friend</p>
                    </div>
                    <div className={(this.state.seeAll) ? "friends-list-holder see-all" : "friends-list-holder"}>
                        {_requestsMap}
                    </div>
                    {
                        (_dummyRequests.length > 7) ?
                            <div className="popover-footer">
                                <p className="see-all" onClick={this.toggleRequestList.bind(this)}>{(this.state.seeAll)?"see less":"see all"}</p>
                            </div> : null
                    }

                </div>
            </section>
        );
    }
}

export class RequestItem extends React.Component {
    constructor(props) {
        super(props);
    }

    render (){

        let profileImg = this.props.profileImg;
        let profName = this.props.profName;
        let subTitle = this.props.subTitle;
        let requestedTime = this.props.requestedTime;

        return (
            <div className="friends-item">
                <div className="prof-img">
                    <img src={profileImg} className="img-responsive" />
                </div>
                <div className="friends-preview">
                    <h3 className="prof-name">{profName}</h3>
                    <p className="sub-title">{subTitle}</p>
                    <p className="requested-time">{requestedTime}</p>
                </div>
                <div className="controls">
                    <button className="btn btn-decline">
                        <span className="ico"></span> decline</button>
                    <button className="btn btn-accept">
                        <span className="ico"></span> accept</button>
                </div>
            </div>
        );
    }

}
