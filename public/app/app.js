import React from 'react'
import ReactDom from 'react-dom'
import { Router , Route, browserHistory } from 'react-router'

import Main from './pages/main';
import Signup from './pages/signup/Signup';
import Secretary from './pages/signup/Secretary';
import DashBoard from './pages/dashboard/DashBoard';


let rootRoute =(
   <Route name="main" path="/" component={Main}>
        <Route name="signup" path="/signup" component={Signup}/>
        <Route name="choose-secretary" path="/choose-secretary" component={Secretary}/>
        <Route name="dashboard" path="/dashboard" component={DashBoard}/>
      </Route>
);
ReactDom.render((
	<Router  history={browserHistory}  routes={rootRoute}/>
		 
	

), document.getElementById('proglob-app-container'));



