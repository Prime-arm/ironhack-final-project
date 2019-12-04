import React, { Component } from "react";
import { Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

class App extends Component {
  state = {
    user: this.props.user
  };

  setUser = user => {
    this.setState({
      user: user
    });
  };

  render() {
    return (
      <div>
        <Navbar user={this.state.user} clearUser={this.setUser} />
        <Route exact path="/" component={Home} />
        <Route
          exact
          path="/login"
          render={props => <Login {...props} setUser={this.setUser} />}
        />
        <Route
          exact
          path="/signup"
          render={props => <Signup {...props} setUser={this.setUser} />}
        />
      </div>
    );
  }
}

export default App;
