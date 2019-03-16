class LoginPage extends React.Component {
    render() {
        return (
            <div>
                <CreateUserPage />
            </div>
        )
    }
}

class CreateUserPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {};

        this.handleOnUsernameChange = this.handleOnUsernameChange.bind(this)
        this.handleOnPasswordChange = this.handleOnPasswordChange.bind(this)
        this.handleOnLogin = this.handleOnLogin.bind(this)
    }

    handleOnUsernameChange(event) {
        this.setState({username : event.target.value})
    }

    handleOnPasswordChange(event) {
         this.setState({password : event.target.value})
    }

    handleOnLogin(event) {
        let data = this.state;

        $.ajax({
            url : "/api/users",
            type : "POST",
            data : data,
            success : (response) => {
                if (response.success) {
                    alert("Sucessfully created user " + this.state.username)
                } else {
                    alert("Failed to create user " + this.state.username)
                }
            }
        })
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
                <button id="btnCreateUser" onClick={ this.handleOnLogin}>Create User</button>
            </div>
        )
    }
}

ReactDOM.render(
    <LoginPage/>,
    document.getElementById("root")
);

// .\babel ..\..\LoginPage.jsx --out-file .
// .\..\test.js --presets=@babel/preset-react