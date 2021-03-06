import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { projectInfos, addApplication } from "../../services/project";
import { ProjectContainer } from "./styles";
import { tags } from "../user/Keywords";
import socketIOClient from "socket.io-client";
import { FaCheck, FaTimes, FaTrashAlt } from "react-icons/fa";
// socket client for notification about new application
const endpoint = "http://localhost:5555"; //socket
const socket = socketIOClient(endpoint);

export default class ProjectDetails extends Component {
  state = {
    project: "",
    editForm: false,
    showProjectDetails: true,
    title: "",
    description: "",
    requiredRoles: [],
    tags: [],
    remote: true,
    status: "Open",
    error: ""
  };

  handleRemove = elem => {
    this.setState({
      tags: this.state.tags.filter(t => t !== elem)
    });
  };

  handleSelect = event => {
    this.setState({
      tags: [...this.state.tags, event.target.value],
      newTag: ""
    });
  };

  handleApplication = event => {
    addApplication(this.state.project._id, {
      user: this.props.user._id,
      role: event.target.name
    })
      .then(response => {
        const application =
          response.applications[response.applications.length - 1];
        console.log("new application returned from db: ", application);
        this.setState({
          project: response
        });
        socket.emit("application",application);
      })
      .catch(err => {
        console.log(err);
      });
  };

  applied = () => {
    if (this.state.project.applications.length > 0) {
      const findRole = this.state.project.applications.find(
        application => application.user === this.props.user._id
      );
      if (findRole) {
        return findRole.role;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  addContributor = (applicant, project) => {
    axios
      .post(`/api/projects/applications/accept`, {
        applicant,
        project
      })
      .then(response => {
        const accepted = response.data.contributors[response.data.contributors.length-1]
        console.log("new accepted contributor returned from db: ", accepted);
        socket.emit("accepted", accepted);
      })
      .catch(err => {
        console.log(err);
      });
  };

  removeApplicant = (applicant, project) => {
    axios
      .post(`/api/projects/applications/reject`, {
        applicant,
        project
      })
      .then(response => {
        //const rejected = ??
        console.log(response.data);
        console.log(response.data.applications);
        //socket.emit("rejected", rejected)
      })
      .catch(err => {
        console.log(err);
      });
  };

  updateRoles = (project, role) => {
    axios
      .post(`/api/projects/applications/roleUpdate`, {
        project,
        role
      })
      .then(response => {
        console.log(response.data);
        console.log(response.data.applications);
        console.log("history", this.props.history);
        console.log("history id", this.state.project._id);
        this.getInitialData(this.props.match.params.projectId);
      })
      .catch(err => {
        console.log(err);
      });
  };

  accepted = event => {
    let result = window.confirm(
      "Are you sure you want to accept this applicant?"
    );
    if (result) {
      this.addContributor(event.target.id, this.state.project._id);
      this.removeApplicant(event.target.id, this.state.project._id);
      this.updateRoles(this.state.project._id, event.target.name);
    }
  };

  rejected = event => {
    let result = window.confirm(
      "Are you sure you want to remove this applicant?"
    );
    if (result) {
      this.removeApplicant(event.target.id, this.state.project._id);
      this.getInitialData(this.props.match.params.projectId);
    }
  };

  getInitialData = projectId => {
    projectInfos(projectId)
      .then(response => {
        this.setState({
          project: response,
          title: response.title,
          description: response.description,
          requiredRoles: response.requiredRoles,
          tags: response.tags,
          remote: response.remote,
          status: response.status
        });
      })
      .catch(err => {
        console.log(err);
        if (err.response.status === 404) {
          this.setState({
            error: err.response.data.message
          });
        }
      });
      console.log("getInitialData()");
  };

  componentDidMount() {
    const { projectId } = this.props.match.params;
     socket.on("application", application => {
      console.log("socket received emitted application: ", application);
    });
    this.getInitialData(projectId);
  }

  /* ----------------------------- Editing options ---------------------------- */

  showEditForm = () => {
    this.setState({
      editForm: !this.state.editForm,
      showProjectDetails: !this.state.showProjectDetails
    });
  };

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    axios
      .put(`/api/projects/${this.props.match.params.projectId}`, {
        title: this.state.title,
        description: this.state.description,
        // requiredRoles: this.state.requiredRoles,
        tags: this.state.tags,
        remote: this.state.remote,
        status: this.state.status
      })
      .then(response => {
        console.log("RESPONSAA", response);
        this.setState({
          project: response.data,
          editForm: false,
          showProjectDetails: true
        });
        /* this.props.history.push(
          `/projects/${this.props.match.params.projectId}`
        ); */
      })
      .catch(err => {
        console.log(err);
      });
  };

  handleCheckBox = event => {
    console.log(event.target.name, event.target.checked);
    this.setState({
      [event.target.name]: event.target.checked
    });
  };

  /* ------------------------------------ delete ----------------------------------- */

  deleteProject = () => {
    let result = window.confirm(
      "Are you sure you want to delete this project?"
    );
    if (result) {
      axios
        .delete(`/api/projects/${this.props.match.params.projectId}`)
        .then(response => {
          console.log("delete response", response);
          this.props.history.push("/projects");
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  render() {
    //console.log(this.props);
    if (!this.state.project) {
      return <div></div>;
    }
    const { project } = this.state;
    return (
      <ProjectContainer>
        <div className="main">
          <div className="bg-header" />
          <div className="container">
            {/* Show edit Form */}
            {this.state.editForm && (
              <div className="projectForm">
                <div className="projectHeader">
                  <h2>EDIT PROJECT</h2>
                </div>
                <form onSubmit={this.handleSubmit}>
                  <label htmlFor="title">Project title</label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={this.state.title}
                    onChange={this.handleChange}
                  />
                  <br />
                  <label htmlFor="description">Description</label>
                  <textarea
                    type="text"
                    name="description"
                    id="description"
                    value={this.state.description}
                    onChange={this.handleChange}
                  />
                  <br />
                  <label htmlFor="tags" className="label">
                    keywords
                  </label>
                  <select name="tags" id="tags" onChange={this.handleSelect}>
                    {tags.map(tag => {
                      return (
                        <option value={tag} key={tag}>
                          {tag}
                        </option>
                      );
                    })}
                  </select>
                  <ul>
                    {this.state.tags &&
                      this.state.tags.map((tag, i) => {
                        return (
                          <li key={i}>
                            <button
                              className="deleteButton"
                              type="button"
                              onClick={() => this.handleRemove(tag)}
                            >
                              <FaTrashAlt color="red" /> {tag}
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                  <br />
                  <label htmlFor="remote">remotely</label>
                  <input
                    type="checkbox"
                    name="remote"
                    id="remote"
                    checked={this.state.remote}
                    onChange={this.handleCheckBox}
                  />
                  <br />
                  <label htmlFor="status">Status</label>
                  <select
                    name="status"
                    onChange={this.handleChange}
                    value={this.state.status}
                    id="status"
                  >
                    <option value="Open">Open</option>
                    <option value="In progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {/* <label htmlFor="requiredRoles">
              Choose which roles are required:{" "}
            </label> */}
                  {/* <RoleSelect onSelect={this.onSelect} onRemove={this.onRemove} /> */}
                  <div>
                    <button type="submit" className="editButton">
                      <FaCheck /> Save Changes
                    </button>
                    <button onClick={this.deleteProject} className="editButton">
                      <FaTrashAlt /> Delete Project
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* -------------- Project details -------------- */}

            {this.state.showProjectDetails && (
              <div>
                <div className="projectHeader">
                  <h1>{project.title}</h1>
                  {/* check if user is project owner */}
                  {this.props.user._id === project.owner._id && (
                    <button className="editButton" onClick={this.showEditForm}>
                      EDIT PROJECT
                    </button>
                  )}
                </div>
                <div className="projectInfos">
                  {/* ------------------ REMOTE ------------------ */}
                  {project.remote ? (
                    <span remote={project.remote.toString()}>REMOTE</span>
                  ) : (
                    <span remote={project.remote.toString()}>LOCAL</span>
                  )}
                  {/* ------------------ CREATED AT ------------------ */}
                  <p className="date">{project.created_at.slice(0, 10)}</p>
                </div>
                {/* ------------------ ABOUT ------------------ */}
                <div className="projectMain">
                  <div className="grid verticalLine">
                    <div className="grid3">
                      <div className="projectDescription">
                        <h4>ABOUT</h4>
                        <p>{project.description}</p>
                      </div>
                      {/* ------------------ STATUS ------------------ */}
                      <div className="verticalLine status">
                        <h4>STATUS</h4>
                        <p>{project.status}</p>
                      </div>
                    </div>
                    {/* ------------------ OWNER ------------------ */}
                    <div className="verticalLine owner">
                      <h4>OWNER</h4>

                      <Link
                        to={`/user/${project.owner._id}`}
                        className="userIcon"
                      >
                        <img
                          src={project.owner.photo}
                          alt={project.owner.username}
                        />
                        <span className="cool-link">
                          {project.owner.username}
                        </span>
                      </Link>
                    </div>
                  </div>
                  <div className="grid">
                    <div className="grid2">
                      {/* ------------------ TAGS ------------------ */}
                      {project.tags && (
                        <div className="verticalLine keywords">
                          <h4>KEYWORDS</h4>
                          {project.tags.map((tag, i) => {
                            return (
                              <ul key={i}>
                                <li>{tag}</li>
                              </ul>
                            );
                          })}
                        </div>
                      )}
                      {/* ------------------ ROLES ------------------ */}
                      {project.requiredRoles && (
                        <div className="verticalLine">
                          <h4>REQUIRED</h4>
                          {this.applied() ? (
                            <p>Applied for {this.applied()}</p>
                          ) : (
                            project.requiredRoles.map((role, i) => {
                              return (
                                <div key={i} className="roles">
                                  {role.open &&
                                    this.props.user._id !==
                                      project.owner._id && (
                                      <button
                                        name={role.name}
                                        onClick={this.handleApplication}
                                        className="editButton"
                                      >
                                        APPLY
                                      </button>
                                    )}
                                  <p open={role.open}>{role.name}</p>

                                  {this.props.user._id === project.owner._id &&
                                    project.applications.map(applicant => {
                                      return (
                                        <div key={applicant.user}>
                                          {applicant.role === role.name && (
                                            <>
                                              <Link
                                                to={`/user/${applicant.user}`}
                                                className="editButton"
                                              >
                                                SEE PROFILE
                                              </Link>
                                              <button
                                                type="button"
                                                id={applicant.user}
                                                name={role.name}
                                                onClick={this.accepted}
                                                className="editButton"
                                              >
                                                <FaCheck /> ACCEPT
                                              </button>
                                              <button
                                                type="button"
                                                id={applicant.user}
                                                name={role.name}
                                                onClick={this.rejected}
                                                className="editButton"
                                              >
                                                <FaTimes color="red" /> REJECT
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      );
                                    })}
                                  <br />
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                    {/* ------------------ CONTRIBUTORS ------------------ */}
                    <div className="verticalLine contributors">
                      {project.contributors && (
                        <>
                          <h4>CONTRIBUTORS</h4>
                          {project.contributors.map(c => {
                            return (
                              <Link
                                key={c}
                                to={`/user/${c._id}`}
                                className="userIcon"
                              >
                                <img src={c.photo} alt={c.username} />
                                <span className="cool-link">{c.username}</span>
                              </Link>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ProjectContainer>
    );
  }
}
