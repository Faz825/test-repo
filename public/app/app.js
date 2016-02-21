import React from 'react'
import ReactDom from 'react-dom'
import { Router , Route, browserHistory } from 'react-router'

import Main from './pages/main';
import SignupIndex from './pages/signup/Index';
import SelectSecretary  from './pages/signup/SelectSecretary';


import ProfileIndex  from './pages/profile/index';





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

	</Route>
);


ReactDom.render((
	<Router  history={browserHistory}  routes={rootRoute}/>



), document.getElementById('proglob-app-container'));