import React from 'react'
import ReactDom from 'react-dom'
import { Router , Route, browserHistory } from 'react-router'

import Main from './pages/main';
import SignupIndex from './pages/signup/Index';
import Session  from './middleware/Session';
import SelectSecretary  from './pages/signup/SelectSecretary';

let SessionClient =  new Session();
let sessionData = SessionClient.getSession('prg_lg');


if(SessionClient.isSessionSet('prg_lg') && sessionData.status > 2 ){
	let rootRoute =(
	   	<Route name="main" path="/" component={Main} state="1">
			<Route name="signup" path="/choose-secretary" component={SelectSecretary}/>
		</Route>
	);

	ReactDom.render((
		<Router  history={browserHistory}  routes={rootRoute}/>

	), document.getElementById('proglob-app-container'));
}else{
	let rootRoute =(
	   	<Route name="main" path="/" component={Main} state="1">
			<Route name="signup" path="/signup" component={SignupIndex}/>
		</Route>
	);


	ReactDom.render((
		<Router  history={browserHistory}  routes={rootRoute}/>
			 
		

	), document.getElementById('proglob-app-container'));
}






