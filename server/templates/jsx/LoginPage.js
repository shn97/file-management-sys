class LoginPage extends React.Component {
  render() {
    return React.createElement("div", null, React.createElement(CreateUserPage, null));
  }

}

class CreateUserPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleOnUsernameChange = this.handleOnUsernameChange.bind(this);
    this.handleOnPasswordChange = this.handleOnPasswordChange.bind(this);
    this.handleOnLogin = this.handleOnLogin.bind(this);
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

  handleOnLogin(event) {
    let data = this.state;
    $.ajax({
      url: "/api/users",
      type: "POST",
      data: data,
      success: response => {
        if (response.success) {
          alert("Sucessfully created user " + this.state.username);
        } else {
          alert("Failed to create user " + this.state.username);
        }
      }
    });
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
    })), React.createElement("button", {
      id: "btnCreateUser",
      onClick: this.handleOnLogin
    }, "Create User"));
  }

}

ReactDOM.render(React.createElement(LoginPage, null), document.getElementById("root")); // .\babel ..\..\LoginPage.jsx --out-file .
// .\..\test.js --presets=@babel/preset-react
