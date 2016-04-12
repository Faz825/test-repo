import React from 'react'
import ReactDom from 'react-dom'
import { Router , Route, browserHistory } from 'react-router'

import Main from './pages/main';
import SignupIndex from './pages/signup/Index';
import SelectSecretary  from './pages/signup/SelectSecretary';


import ProfileIndex  from './pages/profile/Index';

import ForgotPassword from './pages/signup/ForgotPassword';
import ChangePassword from './pages/signup/ChangePassword';
import ChangePasswordInvalid from './pages/signup/ChangePasswordInvalid';
import ChangedPassword from './pages/signup/ChangedPassword';
import Connection  from './pages/connection/Index';
import NewsSettings from './pages/news/NewsSettings';
import ChatIndex from './pages/chat/Index';
import NewsIndex from './pages/news/Index';
import NotesIndex from './pages/notes/Index';
import EditNote from './pages/notes/EditNote';

let rootRoute =(
    <Route name="main" path="/" component={Main} state="1">
		<Route name="signupIndex" path="/sign-up" component={SignupIndex}/>
		<Route name="choose-secretary" path="/choose-secretary" component={SignupIndex}/>
        <Route name="about-you" path="/about-you" component={SignupIndex}/>
        <Route name="establish-connections" path="/establish-connections" component={SignupIndex}/>
        <Route name="news-categories" path="/news-categories" component={SignupIndex}/>
        <Route name="profile-image" path="/profile-image" component={SignupIndex}/>
        <Route name="collage-and-job" path="/collage-and-job" component={SignupIndex}/>

        /**
         * Profile Route
         */
        <Route name="profile" path="/profile/:uname" component={ProfileIndex}/>

        <Route name="forgot-password" path="/forgot-password" component={ForgotPassword}/>
        <Route name="change-password" path="/change-password/:token" component={ChangePassword}/>
        <Route name="change-password-invalid" path="/change-password-invalid" component={ChangePasswordInvalid}/>
        <Route name="changed-password" path="/changed-password" component={ChangedPassword}/>

        <Route name="chats-video" path="/chat" component={ChatIndex}/>
        <Route name="new-chat" path="/chat/:chatWith" component={ChatIndex}/>




        /**
         * Connection Route
         */

        <Route name="connections" path="/connections" component={Connection}/>



		/**
		 * News
		 */

        <Route name="news-feed" path="/news-feed" component={NewsIndex}/>
        <Route name="news" path="/news" component={NewsSettings}/>


        /**
		 * Notes
		 */

        <Route name="notes" path="/notes" component={NotesIndex}/>
        <Route name="editnote" path="/editnote" component={EditNote}/>

	</Route>
);


ReactDom.render((
	<Router  history={browserHistory}  routes={rootRoute}/>



), document.getElementById('proglob-app-container'));
