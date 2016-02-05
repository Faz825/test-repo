
import React from 'react';
import { Router, Route } from 'react-router';

import Main from '../pages/main';
import Signup from '../pages/Signup/Signup';
import Secretary from '../pages/Signup/Secretary';


const Routes =(
	 <Route name="main" path="/" component={Main}>
		<Route name="signup" path="/signup" component={Signup}/>
		<Route name="secretary" path="/secretary" component={Secretary}/>

	</Route>
);


