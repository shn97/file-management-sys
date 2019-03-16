class IndexPage extends React.Component {
    render() {
        return (
            <div>
                <LoginPage />
            </div>
        )
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
        this.setState({username : event.target.value})
    }

    handleOnPasswordChange(event) {
         this.setState({password : event.target.value})
    }

    handleOnCreateUser(event) {
        let data = this.state;

        $.ajax({
            url : "/api/users",
            type : "POST",
            data : data,
            success : (response) => {
                if (response.success) {
                    alert("Successfully created user " + this.state.username)
                } else {
                    alert("Failed to create user " + this.state.username)
                }
            }
        })
    }

    handleOnLogin() {
        let data = this.state;

        $.ajax({
            url: "/api/users",
            type: "GET",
            data: data,
            success: (response) => {
                if (response.success) {
                    alert("Successfully Logged in! Welcome back " + this.state.username)
                } else {
                    alert("Failed to login " + this.state.username)
                }
            }
        })
    }

    displayLoginButton() {
        return (
            <div>
                <button id="btnCreateUser" onClick={this.handleOnCreateUser}>Create New Account</button>
                <button id="btnLogin" onClick={this.handleOnLogin}>Login</button>
            </div>
        )
    }

    render() {


        return (
            <div>
                <div>
                    <label className="loginLabel">Username: </label>
                    <input id="inpUsername" className="loginInput"
                           type="text" onChange={this.handleOnUsernameChange}/>
                </div>
                <div>
                    <label className="loginLabel">Password: </label>
                    <input id="inpPassword" className="loginInput"
                           type="text" onChange={this.handleOnPasswordChange}/>
                </div>
                {this.displayLoginButton()}
            </div>
        )
    }
}

ReactDOM.render(
    <IndexPage/>,
    document.getElementById("root")
);

// .\babel ..\..\IndexPage.jsx --out-file .
// .\..\test.js --presets=@babel/preset-react