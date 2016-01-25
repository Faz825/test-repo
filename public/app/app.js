import React from 'react'
import ReactDom from 'react-dom'
import Router from 'react-router'
import { browserHistory, DefaultRoute, Link, Route, RouteHandler} from 'react-router'

import Main from './pages/main';
import SignUp from './pages/Signup/Signup';

/*const rootRoute = {
  component: 'div',
  childRoutes: [ {
    path: '/',
    component: require('./pages/main')
    childRoutes: [
      //require('./pages/signup'),
      ,
    ]
  } ]
}*/
let rootRoute =(
	<Route name="app" path="/" handler={Main}>
    	<Route name="signup" path="/signup" handler={SignUp}/>
  	</Route>
);

Router.run(rootRoute, function (Handler) {  
	
  ReactDom.render(<Handler/>, document.getElementById('proglob-app-container'));
});
/*render(
	<Router history={browserHistory} routes={rootRoute} />,
	document.getElementById('proglob-app-container')
);*/