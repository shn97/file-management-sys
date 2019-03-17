/*import PropTypes from 'prop-types';*/

class IndexPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn : false
        };

        this.handleLoginRedirect = this.handleLoginRedirect.bind(this)
        this.handleLogoutRedirect = this.handleLogoutRedirect.bind(this)
    }

    handleLoginRedirect() {
        this.setState({isLoggedIn : true});
    }

    handleLogoutRedirect() {
        this.setState({isLoggedIn : false});
    }

    render() {
        let displayLoginPage = this.state.isLoggedIn ? "none" : "";
        let displayFileManagementPage = this.state.isLoggedIn ? "" : "none";

        return (
            <div>
                <div style={{display : displayLoginPage}}>
                    <LoginPage
                        handleLoginRedirect={this.handleLoginRedirect}/>
                </div>
                <div style={{display : displayFileManagementPage}}>
                    <FileManagementPage
                        isLoggedIn={this.state.isLoggedIn}
                        handleLogoutRedirect={this.handleLogoutRedirect}/>
                </div>
            </div>
        )
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
        this.setState({username : event.target.value})
    }

    handleOnPasswordChange(event) {
         this.setState({password : event.target.value})
    }

    handleOnCreateUser(event) {
        let data = this.state;
        if (data.username !== "" && data.password !== "") {
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
        } else {
            alert("Username and password fields cannot be empty!")
        }

    }

    handleOnLogin() {
        let data = this.state;

        if (data.username !== "" && data.password !== "") {
            $.ajax({
                url: "/api/users",
                type: "GET",
                data: data,
                success: (response) => {
                    if (response.success) {
                        alert("Successfully Logged in! Welcome back " + this.state.username);
                        this.props.handleLoginRedirect()
                    } else {
                        alert("Failed to login " + this.state.username)
                    }
                }
            })
        } else {
            alert("Username and password fields cannot be empty!")
        }
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

class FileManagementPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedFileInfo: null,
            uploadProgress: 0,
            showCreateFolderDialog: false
        };

        this.fileUpload = React.createRef();
        this.handleOnClickUpload = this.handleOnClickUpload.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleOnClickCreateFolder = this.handleOnClickCreateFolder.bind(this);
        this.handleOnLogout = this.handleOnLogout.bind(this);
        this.handleOnSelectFile = this.handleOnSelectFile.bind(this);
        this.isSelected = this.isSelected.bind(this);
    }

    handleOnClickUpload() {
        this.fileUpload.current.click()
    }

    handleUploadFile(event) {
        let files = event.target.files;
        if (files.length > 0) {
            const max_file_size =  5 * 1024 * 1000
            let file = files[0];
            if (file.filename === "") {
                alert("Filename cannot be empty");
                return;
            } else if (file.size > max_file_size) {
                alert("File size is too large!");
                return;
            }

            let data = new FormData()
            data.append("file", files[0]);
            data.append("parentId", this.state.selectedFileInfo.fileId)
            axios.post("/api/files", data, {
                onUploadProgress: (progress) => {
                    let uploadProgress = progress.loaded / progress.total * 100;
                    this.setState({uploadProgress: uploadProgress});
                }
            }).then((response) => {
                if (!response.success) {
                    alert("Failed to upload File: " + response.msg);
                }
            })
        }
    }

    handleOnClickCreateFolder(shouldShowDialog) {
        this.setState({showCreateFolderDialog : shouldShowDialog})
    }

    handleOnLogout() {
        $.ajax({
            url: "/api/logout",
            type: "GET",
            success: (response) => {
                if (response.success) {
                    alert("Successfully Logged out!");
                    this.props.handleLogoutRedirect()
                } else {
                    alert("Failed to logout for user \"" + this.state.username + "\"")
                }
            }
        })
    }

    handleOnSelectFile(fileInfo) {
        this.setState({selectedFileInfo: fileInfo});
    }

    isSelected(fileId) {
        return this.state.selectedFileInfo && this.state.selectedFileInfo.fileId === fileId
    }

    render() {
        let shouldDisplayButtons = this.state.selectedFileInfo && this.state.selectedFileInfo.isFolder &&
                                    this.state.selectedFileInfo.fileId > 0 ? "" : "none";
        let fileTree = [];
        if (this.props.isLoggedIn) {
            fileTree.push(
                <File
                    fileId={-1}
                    fileName={""}
                    isFolder={true}
                    isExpanded={false}
                    isSelected={this.isSelected}
                    handleOnSelectFile={this.handleOnSelectFile}/>)
        }

        return (
            <div>
                <div id="divTopBar" className="topBar">
                    <button id="btnUploadFile" className="btnTopBar"
                            style={{display: shouldDisplayButtons}}
                            onClick={this.handleOnClickUpload}>Upload File</button>
                    <button id="btnCreateFolder" className="btnTopBar"
                            style={{display: shouldDisplayButtons}}
                            onClick={this.handleOnClickCreateFolder}>Create Folder</button>
                    <button id="btnLogout" className="btnTopBar"
                            onClick={this.handleOnLogout}>Logout</button>
                </div>
                <div id="divFileTreeContainer">
                    {fileTree}
                </div>
                <input id="fileUpload"
                       ref={this.fileUpload}
                       type="file"
                       style={{display:"none"}}
                       onChange={this.handleUploadFile}/>
            </div>
        )
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
            isExpanded: this.props.isExpanded,
            isSelected: false,
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
             parentId : parentId
         };
         $.ajax({
             url: "/api/files",
             type: "GET",
             data: data,
             success: (response) => {
                 if (response.success) {
                     let files = response.data;
                     if (parentId === -1) {
                        this.setState({
                            fileId: files[0].file_id,
                            fileName: files[0].file_name
                        });
                     } else {
                         let childrenFiles = [];
                         files.forEach((child) => {
                             childrenFiles.push(
                                 <File
                                     fileId={child.file_id}
                                     fileName={child.file_name}
                                     isFolder={child.is_folder}
                                     isExpanded={this.state.isExpanded}
                                     isSelected={this.props.isSelected}
                                     handleOnSelectFile={this.props.handleOnSelectFile}/>)
                         });
                         this.setState({childrenFiles: childrenFiles});
                     }
                 } else {
                     alert("Failed to get files! Please re-login and try again");
                 }
             }
         });
    }

    handleOnClickFile(event) {
        let shouldExpand = !this.state.isExpanded;
        let fileInfo = {};
        if (shouldExpand && this.props.isFolder) {
            this.getFiles(this.state.fileId);
        }

        if (shouldExpand) {
             fileInfo = {
                fileId: this.state.fileId,
                isFolder: this.props.isFolder
            };
        } else {
            fileInfo = {
                fileId: null,
                isFolder: null
             };
        }

        this.props.handleOnSelectFile(fileInfo);
        this.setState({isExpanded: shouldExpand});
    }

    render() {
        this.state.isSelected = this.props.isSelected(this.state.fileId);
        let fileNodeClass = "fileNode";
        fileNodeClass += this.state.isSelected ? " selected" : "";
        let childrenFileNodes = this.state.isExpanded ? this.state.childrenFiles : [];

        return (
            <div className="fileNodeContainer">
                <span className={fileNodeClass}
                      onClick={this.handleOnClickFile}>{this.state.fileName}
                </span>
                {childrenFileNodes}
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