// src/app/App.js
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Contact from '../pages/Contact';

function App() {
  return (
    <Router>
      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[#fafafa] to-[#8C8278]">
        <div className="flex-1 overflow-hidden">
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/contact" component={Contact} />
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;