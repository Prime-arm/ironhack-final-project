import React, { Component } from "react";
import { Container } from "./styles";
import { Link } from "react-router-dom";
import AwesomeSlider from "react-awesome-slider";
import "react-awesome-slider/dist/styles.css";

export default class BestProjects extends Component {
  render() {
    console.log("bestProj", this.props.projects);
    const filter = this.props.projects.filter(value => {
      if (value.owner !== this.props.user._id) {
        return value;
      }
      return false;
    });

    const sorted = filter.sort((a, b) => {
      const aTags = a.tags.filter(
        value => this.props.user.tags.indexOf(value) !== -1
      ).length;
      const bTags = b.tags.filter(
        value => this.props.user.tags.indexOf(value) !== -1
      ).length;
      return bTags - aTags;
    });
    let content = sorted.map(value => {
      return (
        <div className="blockMatch">
          <div className="grid311" key={value._id}>
            <div className="innerGrid">
              <h2 className="title">{value.title}</h2>
              <p>{value.description}</p>
              <br />
              <Link className="btn-see-project" to={`/projects/${value._id}`}>
                Check Project
              </Link>
            </div>
            <div className="innerGrid">
              <h3>Tags</h3>
              {value.tags.map((value, index) => {
                return <p key={index}>{value}</p>;
              })}
            </div>
            <div className="singleInfo">
              <h3>Roles</h3>
              {value.requiredRoles.map((value, index) => {
                return <p key={index}>{value.name}</p>;
              })}
            </div>
          </div>
        </div>
      );
    });
    return (
      <Container>
        <div className="projects1">
          {content.length > 0 ? (
            <AwesomeSlider>{content}</AwesomeSlider>
          ) : (
            <AwesomeSlider>
              <div>
                <h4>YOU DON'T HAVE ANY PROJECT MATCHING YOUR PREFERENCES</h4>
                <Link
                  className="btn-see-project"
                  to={`/user/${this.props.user._id}`}
                >
                  Edit your profile
                </Link>
              </div>
            </AwesomeSlider>
          )}
        </div>
      </Container>
    );
  }
}
