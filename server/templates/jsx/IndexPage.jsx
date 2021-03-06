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
                    } else if (response.msg && response.msg !== "") {
                            alert(response.msg);
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
                        alert("Failed to login to " + this.state.username);
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
                           type="password" onChange={this.handleOnPasswordChange}/>
                </div>
                {this.displayLoginButton()}
            </div>
        )
    }
}

class FileManagementPage extends React.Component {

    static deletedFileInfos = [];

    constructor(props) {
        super(props);
        this.state = {
            selectedFileInfo: null,
            deleteFileInfo: null,
            uploadProgress: 0,
            createFolder: false
        };

        this.fileUpload = React.createRef();
        this.handleOnClickUpload = this.handleOnClickUpload.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleOnDeleteFile = this.handleOnDeleteFile.bind(this);
        this.handleOnSetCreateFolder = this.handleOnSetCreateFolder.bind(this);
        this.handleOnClickCreateFolder = this.handleOnClickCreateFolder.bind(this);
        this.handleOnLogout = this.handleOnLogout.bind(this);
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
                        let deleteInfo = {
                            fileId: data.file_id
                        };
                        FileManagementPage.deletedFileInfos.push(deleteInfo);
                        this.setState({deleteFileInfo : this.state.selectedFileInfo});
                    } else {
                        alert("Failed to delete file\"" + this.state.selectedFileInfo.fileName + "\"")
                    }
                }
            })
        }
    }

    handleOnSetCreateFolder(doCreateFolder) {
        this.setState({createFolder : doCreateFolder})
    }

    handleOnClickCreateFolder() {
        this.handleOnSetCreateFolder(true)
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
        this.handleOnSelectFile = this.handleOnSelectFile.bind(this);
        let isAnyFileSelected = this.state.selectedFileInfo && this.state.selectedFileInfo.fileId > 0;
        let displayIfFileSelected = isAnyFileSelected && !this.state.selectedFileInfo.isFolder
                                        ? "" : "none";
        let displayFolderOnlyButtons =  isAnyFileSelected && this.state.selectedFileInfo.isFolder
                                          ? "" : "none";
        let displayIfFileIsNotRoot = isAnyFileSelected && !this.state.selectedFileInfo.isRoot
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
                    createFolder={this.state.createFolder}
                    handleOnSelectFile={this.handleOnSelectFile.bind(this)}
                    handleOnSetCreateFolder={this.handleOnSetCreateFolder.bind(this)}/>)
        }

        return (
            <div>
                <div id="divTopBar" className="topBar">
                    <button id="btnUploadFile" className="btnTopBar"
                            style={{display: displayFolderOnlyButtons}}
                            onClick={this.handleOnClickUpload}>Upload File</button>
                    <button id="btnDeleteFile" className="btnTopBar"
                            style={{display: displayIfFileIsNotRoot }}
                            onClick={this.handleOnDeleteFile}>
                                {isAnyFileSelected && this.state.selectedFileInfo.isFolder
                                    ? "Delete Folder" : "Delete File"}
                    </button>
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
    constructor(props) {
        super(props);
        this.state = {
            fileId: this.props.fileId,
            fileName: this.props.fileName,
            isRoot: false,
            isExpanded: this.props.isExpanded,
            isSelected: false,
            creatingFolder: false,
            shouldUpdateChildren: false,
            childrenFiles: []
        };

        this.getFiles = this.getFiles.bind(this);
        this.renderChildFile = this.renderChildFile.bind(this);
        this.updateChildren = this.updateChildren.bind(this);
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
                     } else if (this.state.childrenFiles.length !== files) {
                         let childrenFiles = [];
                         files.forEach((child) => {
                             childrenFiles.push(this.renderChildFile(child));
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
        if (shouldExpand && this.props.isFolder) {
            this.getFiles(this.state.fileId);
        }

         let fileInfo = {
            fileId: this.state.fileId,
            isFolder: this.props.isFolder,
            isRoot: this.state.isRoot
        };

        this.props.handleOnSelectFile(fileInfo);
        this.setState({
            isExpanded: shouldExpand,
            isSelected: true
        });
    }

    handleOnBlur(event) {
        let newFileName = event.target.value;
        if (newFileName === "") {
            alert("File name cannot be empty!");
            return
        }

        let data = {
            file_id : this.state.fileId,
            new_file_name : newFileName
        };
        if (newFileName !== this.state.fileName) {
            $.ajax({
                url: "/api/files",
                type: "PUT",
                data: data,
                success: (response) => {
                    if (response.success) {
                        this.setState({fileName : newFileName})
                    } else {
                        alert("Failed to update file name!")
                    }
                }
            })
        }

        this.setState({isSelected : false});
    }

    handleCreateFolder() {
        if (this.props.createFolder && !this.state.creatingFolder && this.state.isSelected) {
            this.state.creatingFolder = true;
            let new_folder_data = {
                file_name: "New Folder",
                parent_id: this.state.fileId
            };

             $.ajax({
                url: "/api/folders",
                type: "POST",
                data: new_folder_data,
                success: (response) => {
                    if (response.success && response.data) {
                        let folder = response.data;
                        this.state.childrenFiles.push(this.renderChildFile(folder));
                        this.setState({childrenFiles : this.state.childrenFiles});
                    } else {
                        alert("Failed to create new folder!")
                    }
                    this.state.creatingFolder = false;
                }
            });
            this.props.handleOnSetCreateFolder(false);
        }
    }

    updateChildren() {
        let childrenFiles = this.state.childrenFiles;
        this.state.childrenFiles = [];
        childrenFiles.forEach((child) => {
            this.state.childrenFiles.push(this.renderChildFile(child));
        });
        this.state.shouldUpdateChildren = false;
    }

    renderChildFile(child) {
        return (
            <File
                 fileId={child.file_id || child.props && child.props.fileId}
                 fileName={child.file_name || child.props && child.props.fileName}
                 isFolder={child.is_folder || child.props && child.props.isFolder}
                 isExpanded={this.state.isExpanded}
                 isSelected={this.state.isSelected}
                 createFolder={this.props.createFolder}
                 handleOnSelectFile={this.props.handleOnSelectFile}
                 handleOnSetCreateFolder={this.props.handleOnSetCreateFolder}/>
         )
    }

    render() {
        // this.state.isSelected = this.props.isSelected(this.state.fileId);
        this.renderChildFile = this.renderChildFile.bind(this);
        this.updateChildren = this.updateChildren.bind(this);
        this.updateChildren();

        this.handleCreateFolder = this.handleCreateFolder.bind(this);
            this.handleCreateFolder();

        let fileNodeClass = "fileNode";
        fileNodeClass += this.state.isSelected ? " selected" : "";
        let childrenFileNodes = this.state.isExpanded ? this.state.childrenFiles : [];
        let icon = this.props.isFolder ? "fa fa-folder" : "fa fa-file";

        return (
            <div className="fileNodeContainer " style={{
                display: FileManagementPage.deletedFileInfos
                    .filter(d => d.fileId === this.state.fileId)
                    .length > 0 ? "none" : ""
            }}>
                <i className={icon}/>
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
