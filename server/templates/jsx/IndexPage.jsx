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
                        alert("Successfully created user! You can now login ")
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
                        this.props.handleLoginRedirect()
                    } else {
                        alert("Failed to login to " + this.state.username)
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
                <button id="btnCreateUser"
                        className="btnLogin"
                        onClick={this.handleOnCreateUser}>Create New Account</button>
                <button id="btnLogin"
                        className="btnLogin"
                        onClick={this.handleOnLogin}>Login</button>
            </div>
        )
    }

    render() {
        return (
            <div className="loginContainer">
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
            deleteFileInfo: null,
            uploadProgress: 0,
            showCreateFolderDialog: false
        };

        this.fileUpload = React.createRef();
        this.handleOnClickUpload = this.handleOnClickUpload.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleOnDeleteFile = this.handleOnDeleteFile.bind(this);
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
                data = response.data;
                if (!data.success) {
                    alert("Failed to upload File: " + response.msg);
                }
            })
        }
    }

    handleOnDeleteFile() {
        if (this.state.selectedFileInfo.fileId != null) {
            let data = {
                file_id: this.state.selectedFileInfo.fileId
            };

            $.ajax({
                url: "/api/files",
                data: data,
                type: "DELETE",
                success: (response) => {
                    if (response.success) {
                        this.setState({deleteFileInfo : this.state.selectedFileInfo});
                    } else {
                        alert("Failed to delete file\"" + this.state.selectedFileInfo.fileName + "\"")
                    }
                }
            })
        }
    }

    isDeleted(fileId) {
        return this.state.deleteFileInfo && this.state.deleteFileInfo.fileId === fileId;
    }

    handleOnClickCreateFolder(shouldShowDialog) {
        this.setState({showCreateFolderDialog : shouldShowDialog})
    }

    handleOnSelectFile(fileInfo) {
        this.setState({selectedFileInfo: fileInfo});
    }

    isSelected(fileId) {
        return this.state.selectedFileInfo && this.state.selectedFileInfo.fileId === fileId
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

    render() {
        let isAnyFileSelected = this.state.selectedFileInfo && this.state.selectedFileInfo.fileId > 0;
        let displayIfFileSelected = isAnyFileSelected && !this.state.selectedFileInfo.isFolder
                                        ? "" : "none";
        let displayFolderOnlyButtons =  isAnyFileSelected && this.state.selectedFileInfo.isFolder
                                          ? "" : "none";
        let displayDeleteButton = isAnyFileSelected && !this.state.selectedFileInfo.isFolder
                                    ? "" : "none";
        let fileTree = [];
        if (this.props.isLoggedIn) {
            fileTree.push(
                <File
                    fileId={-1}
                    fileName={""}
                    isFolder={true}
                    isExpanded={false}
                    isSelected={this.isSelected}
                    isDelete={this.isDeleted}
                    handleOnSelectFile={this.handleOnSelectFile}/>)
        }

        return (
            <div>
                <div id="divTopBar" className="topBar">
                    <button id="btnUploadFile" className="btnTopBar"
                            style={{display: displayFolderOnlyButtons}}
                            onClick={this.handleOnClickUpload}>Upload File</button>
                    <button id="btnDeleteFile" className="btnTopBar"
                            style={{display: displayDeleteButton }}
                            onClick={this.handleOnDeleteFile}>Delete File</button>
                    <button id="btnCreateFolder" className="btnTopBar"
                            style={{display: displayFolderOnlyButtons}}
                            onClick={this.handleOnClickCreateFolder}>Create Folder</button>
                    <form className="formDownload" action={"/api/download"}  method="POST">
                        <input type="text" name="file_id" style={{display: "none"}}
                               value={this.state.selectedFileInfo ? this.state.selectedFileInfo.fileId : -1}/>
                         <button id="btnDownloadFile" className="btnTopBar"
                            style={{display: displayIfFileSelected}}
                            type="submit">Download File</button>
                    </form>
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
            isRoot: false,
            isExpanded: this.props.isExpanded,
            isSelected: false,
            childrenFiles: []
        };

        this.getFiles = this.getFiles.bind(this);
        this.handleOnClickFile = this.handleOnClickFile.bind(this);
        this.handleOnBlur = this.handleOnBlur.bind(this);

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
                            fileName: files[0].file_name,
                            isRoot: true
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
                                     isDelete={this.isDeleted}
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
                isFolder: this.props.isFolder,
                isRoot: this.state.isRoot
            };
        } else {
            fileInfo = {
                fileId: null,
                isFolder: null,
                isRoot: null
             };
        }

        this.props.handleOnSelectFile(fileInfo);
        this.setState({isExpanded: shouldExpand});
    }

    handleOnBlur(event) {
        let new_file_name = event.target.value;
        if (new_file_name === "") {
            alert("File name cannot be empty!");
            return
        }

        let data = {
            file_id : this.state.fileId,
            new_file_name : new_file_name
        };
        if (new_file_name !== this.state.fileName) {
            $.ajax({
                url: "/api/files",
                type: "PUT",
                data: data,
                success: (response) => {
                    if (response.success) {
                        this.setState({fileName : new_file_name})
                    } else {
                        alert("Failed to update file name!")
                    }
                }
            })
        }

        let fileInfo = {
                fileId: this.state.fileId,
                isFolder: this.props.isFolder,
                isRoot : this.state.isRoot
        };
        this.props.handleOnSelectFile(fileInfo);
    }

    render() {
        this.state.isSelected = this.props.isSelected(this.state.fileId);
        let fileNodeClass = "fileNode";
        fileNodeClass += this.state.isSelected ? " selected" : "";
        let childrenFileNodes = this.state.isExpanded ? this.state.childrenFiles : [];

        return (
            <div className="fileNodeContainer">
                <input className={fileNodeClass}
                       type="text"
                       defaultValue={this.state.fileName}
                       onClick={this.handleOnClickFile}
                       onBlur={this.handleOnBlur}>
                </input>
                {childrenFileNodes}
            </div>
        )
    }
}

ReactDOM.render(
    <IndexPage/>,
    document.getElementById("root")
);

// .\babel ..\..\ --out-file .
// .\..\test.js --presets=@babel/preset-react