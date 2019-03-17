/*import PropTypes from 'prop-types';*/
class IndexPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false
    };
    this.handleLoginRedirect = this.handleLoginRedirect.bind(this);
    this.handleLogoutRedirect = this.handleLogoutRedirect.bind(this);
  }

  handleLoginRedirect() {
    this.setState({
      isLoggedIn: true
    });
  }

  handleLogoutRedirect() {
    this.setState({
      isLoggedIn: false
    });
  }

  render() {
    let displayLoginPage = this.state.isLoggedIn ? "none" : "";
    let displayFileManagementPage = this.state.isLoggedIn ? "" : "none";
    return React.createElement("div", null, React.createElement("div", {
      style: {
        display: displayLoginPage
      }
    }, React.createElement(LoginPage, {
      handleLoginRedirect: this.handleLoginRedirect
    })), React.createElement("div", {
      style: {
        display: displayFileManagementPage
      }
    }, React.createElement(FileManagementPage, {
      isLoggedIn: this.state.isLoggedIn,
      handleLogoutRedirect: this.handleLogoutRedirect
    })));
  }

}

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    };
    this.handleOnUsernameChange = this.handleOnUsernameChange.bind(this);
    this.handleOnPasswordChange = this.handleOnPasswordChange.bind(this);
    this.handleOnLogin = this.handleOnLogin.bind(this);
    this.handleOnCreateUser = this.handleOnCreateUser.bind(this);
    this.displayLoginButton = this.displayLoginButton.bind(this);
  }

  handleOnUsernameChange(event) {
    this.setState({
      username: event.target.value
    });
  }

  handleOnPasswordChange(event) {
    this.setState({
      password: event.target.value
    });
  }

  handleOnCreateUser(event) {
    let data = this.state;

    if (data.username !== "" && data.password !== "") {
      $.ajax({
        url: "/api/users",
        type: "POST",
        data: data,
        success: response => {
          if (response.success) {
            alert("Successfully created user " + this.state.username);
          } else {
            alert("Failed to create user " + this.state.username);
          }
        }
      });
    } else {
      alert("Username and password fields cannot be empty!");
    }
  }

  handleOnLogin() {
    let data = this.state;

    if (data.username !== "" && data.password !== "") {
      $.ajax({
        url: "/api/users",
        type: "GET",
        data: data,
        success: response => {
          if (response.success) {
            alert("Successfully Logged in! Welcome back " + this.state.username);
            this.props.handleLoginRedirect();
          } else {
            alert("Failed to login " + this.state.username);
          }
        }
      });
    } else {
      alert("Username and password fields cannot be empty!");
    }
  }

  handleUploadFile() {
    let data = this.state;
    $.ajax({});
  }

  displayLoginButton() {
    return React.createElement("div", null, React.createElement("button", {
      id: "btnCreateUser",
      onClick: this.handleOnCreateUser
    }, "Create New Account"), React.createElement("button", {
      id: "btnLogin",
      onClick: this.handleOnLogin
    }, "Login"));
  }

  render() {
    return React.createElement("div", null, React.createElement("div", null, React.createElement("label", {
      className: "loginLabel"
    }, "Username: "), React.createElement("input", {
      id: "inpUsername",
      className: "loginInput",
      type: "text",
      onChange: this.handleOnUsernameChange
    })), React.createElement("div", null, React.createElement("label", {
      className: "loginLabel"
    }, "Password: "), React.createElement("input", {
      id: "inpPassword",
      className: "loginInput",
      type: "text",
      onChange: this.handleOnPasswordChange
    })), this.displayLoginButton());
  }

}

class FileManagementPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null
    };
    this.handleOnLogout = this.handleOnLogout.bind(this);
  }

  handleOnLogout() {
    $.ajax({
      url: "/api/logout",
      type: "GET",
      success: response => {
        if (response.success) {
          alert("Successfully Logged out!");
          this.props.handleLogoutRedirect();
        } else {
          alert("Failed to logout for user \"" + this.state.username + "\"");
        }
      }
    });
  }

  render() {
    let fileTree = [];

    if (this.props.isLoggedIn) {
      fileTree.push(React.createElement(File, {
        fileId: -1,
        fileName: ""
      }));
    }

    return React.createElement("div", null, React.createElement("div", {
      id: "divTopBar"
    }, React.createElement("button", {
      id: "btnLogout",
      className: "btnTopBar",
      onClick: this.handleOnLogout
    }, "Logout")), React.createElement("div", {
      id: "divFileTreeContainer"
    }, fileTree));
  }

}

class File extends React.Component {
  /*    propTypes = {
          fileId: PropTypes.number,
          fileName: PropTypes.String,
          getFiles: PropTypes.func
      };*/
  constructor(props) {
    super(props);
    this.state = {
      fileId: this.props.fileId,
      fileName: this.props.fileName,
      isExpanded: false,
      childrenFiles: []
    };
    this.getFiles = this.getFiles.bind(this);
    this.handleOnClickFile = this.handleOnClickFile.bind(this);

    if (this.state.fileId === -1) {
      this.getFiles(this.state.fileId);
    }
  }

  getFiles(parentId) {
    let data = {
      parentId: parentId
    };
    $.ajax({
      url: "/api/files",
      type: "GET",
      data: data,
      success: response => {
        if (response.success) {
          let files = response.data;

          if (parentId === -1) {
            this.setState({
              fileId: files[0].file_id,
              fileName: files[0].file_name
            });
          } else {
            let childrenFiles = [];
            files.forEach(child => {
              childrenFiles.push(React.createElement(File, {
                fileId: child.fileId,
                filename: child.fileName
              }));
            });
            this.setState({
              childrenFiles: childrenFiles
            });
          }
        } else {
          alert("Failed to get files! Please re-login and try again");
        }
      }
    });
  }

  handleOnClickFile(event) {
    let shouldExpand = !this.state.isExpanded;
    this.handleGetFiles(shouldExpand, event.target.dataset.value);
    this.setState({
      isExpanded: shouldExpand
    });
  }

  render() {
    return React.createElement("div", null, React.createElement("span", {
      className: "fileNode",
      onClick: this.handleOnClickFile,
      "data-value": this.state.fileId
    }, this.state.fileName, this.state.childrenFiles));
  }

}

ReactDOM.render(React.createElement(IndexPage, null), document.getElementById("root")); // .\babel ..\..\IndexPage.jsx --out-file .
// .\..\test.js --presets=@babel/preset-react
