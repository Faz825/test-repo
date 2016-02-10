import React from 'react'
import ReactDom from 'react-dom'
import { Router , Route, browserHistory } from 'react-router'

import Main from './pages/main';
import SignupIndex from './pages/signup/Index';
import SelectSecretary  from './pages/signup/SelectSecretary';







let rootRoute =(
	<Route name="main" path="/" component={Main} state="1">
		<Route name="signupIndex" path="/signup" component={SignupIndex}/>
		<Route name="aboutyou" path="/choose-secretary" component={SignupIndex}/>
        <Route name="aboutyou" path="/about-you" component={SignupIndex}/>
	</Route>
);


ReactDom.render((
	<Router  history={browserHistory}  routes={rootRoute}/>



), document.getElementById('proglob-app-container'));