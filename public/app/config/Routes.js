
import React from 'react';
import { Router, Route } from 'react-router';

import Main from '../pages/main';
import Signup from '../pages/Signup/Signup';
import DashBoard from '../pages/dashboard/DashBoard';


const Routes =(
	 <Route name="main" path="/" component={Main}>
		<Route name="signup" path="/signup" component={Signup}/>
		<Route name="dashboard" path="/dashboard" component={DashBoard}/>
	</Route>
);


