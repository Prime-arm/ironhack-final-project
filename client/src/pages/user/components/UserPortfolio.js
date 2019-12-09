import React, { Component } from "react";
import { Link } from "react-router-dom";

// import { FaLinkedin } from "react-icons/fa/";
// import { FaGithub } from "react-icons/fa";
// import { FaDribbble } from "react-icons/fa";
// import { FaBehance } from "react-icons/fa";
// import { FaMedium } from "react-icons/fa";

export default class UserPortfolio extends Component {
  state = {
    portfolio: this.props.profile.portfolio,
    linkedin: this.props.profile.portfolio[0].url,
    github: this.props.profile.portfolio[1].url,
    dribbble: this.props.profile.portfolio[2].url,
    behance: this.props.profile.portfolio[3].url,
    medium: this.props.profile.portfolio[4].url
  };

  portfolioNewState = () => {
    this.props.onChange(this.state.portfolio);
    this.props.hideForm();
  };

  onChange = event => {
    const newPort = [...this.props.profile.portfolio].map(port => {
      if (port.site === event.target.name) {
        port.url = event.target.value;
        return port;
      } else {
        return port;
      }
    });
    this.setState({
      [event.target.name]: event.target.value,
      portfolio: newPort
    });
  };

  render() {
    if (!this.state.portfolio) return <div></div>;
    return (
      <>
        {this.props.showForm === "newPortfolio" ? (
          <>
            {this.state.portfolio.map(port => {
              return (
                <div key={port.site}>
                  <label htmlFor={port.site}>{port.baseUrl}</label>
                  <input
                    type="text"
                    name={port.site}
                    value={this.state[port.site]}
                    onChange={this.onChange}
                    id={port.site}
                  />
                </div>
              );
            })}
            <button type="submit" onClick={this.portfolioNewState}>
              SAVE
            </button>
          </>
        ) : (
          <>
            {this.state.portfolio.map(userPort => {
              return (
                userPort.url && (
                  <a
                    key={userPort.site}
                    href={`https://www.${userPort.baseUrl}${userPort.url}`}
                    target="_blank"
                  >
                    {userPort.site}
                  </a>
                )
              );
            })}
            <button name="newPortfolio" onClick={this.props.onClick}>
              EDIT PORTFOLIO
            </button>
          </>
        )}
      </>
    );
  }
}
