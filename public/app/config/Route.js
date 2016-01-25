
import React from 'react';
import { browserHistory, Router, Route, IndexRoute, Link } from 'react-router';

import Login from './pages/login';


export default class Routes {

	<Router history={browserHistory}>
	    <Route path="/" component={Login}>
	    	<Route path="/signup" component={Login}/>
	    </Route>
	</Router>


}

/*
'use strict'
var React = require('react');


var Main = require('../pages/main');
var Login = require('../pages/Login/login');
var Logout = require('../pages/Login/Logout');
var Demo = require('../pages/Demo/demo');
var Subscribe = require('../pages/Subscribe/subscribe');



var Session = require('../lib/Session');
var PG_404 = require('../pages/404/PG_404');

var Router = require('react-router');
var DefaultRoute =Router.DefaultRoute;
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;	





if(Session.isSessionSet()){
	module.exports = (
		<Route name="main" path="/" handler={Main}>
			 <DefaultRoute  handler={Demo} />
			 <Route name="demo" path="/demo" handler={Demo}/>
			 <Route name="logout" path="/logout" handler={Logout}/>
			 <NotFoundRoute handler={PG_404} />
		</Route>

	);
}else{
	module.exports = (
		<Route name="main" path="/" handler={Main}>
			
			<DefaultRoute  handler={Subscribe} />
			 <Route name="login" path="/login" handler={Login}/>
			 <Route name="subscribe" path="/subscribe" handler={Subscribe}/>
			 <NotFoundRoute handler={PG_404} />
		</Route>


	);
}*/

