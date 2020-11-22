import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Log from './components/log';
import Main from './components/main';

//simple navigation:
const Routes = () => {
    return (
        <div>
            <Switch>
                <Route exact path="/" component={Main} />
                <Route path="/log" component={Log} />

            </Switch>
        </div>
    )
}

export default Routes;