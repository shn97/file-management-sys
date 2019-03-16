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
      handleLogoutRedirect: this.handleLogoutRedirect
    })));
  }

}

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
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
  }

  handleOnLogin() {
    let data = this.state;
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
    this.state = {};
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
    return React.createElement("div", null, React.createElement("div", {
      id: "divTopBar"
    }, React.createElement("button", {
      id: "btnLogout",
      onClick: this.handleOnLogout
    }, "Logout")), React.createElement("div", {
      id: "divFileTree"
    }));
  }

}

ReactDOM.render(React.createElement(IndexPage, null), document.getElementById("root")); // .\babel ..\..\IndexPage.jsx --out-file .
// .\..\test.js --presets=@babel/preset-react
