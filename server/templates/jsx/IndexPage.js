function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
            alert("Successfully created user! You can now login ");
          } else if (response.msg && response.msg !== "") {
            alert(response.msg);
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
            this.props.handleLoginRedirect();
          } else {
            alert("Failed to login to " + this.state.username);
          }
        }
      });
    } else {
      alert("Username and password fields cannot be empty!");
    }
  }

  displayLoginButton() {
    return React.createElement("div", null, React.createElement("button", {
      id: "btnCreateUser",
      className: "btnLogin",
      onClick: this.handleOnCreateUser
    }, "Create New Account"), React.createElement("button", {
      id: "btnLogin",
      className: "btnLogin",
      onClick: this.handleOnLogin
    }, "Login"));
  }

  render() {
    return React.createElement("div", {
      className: "loginContainer"
    }, React.createElement("div", null, React.createElement("label", {
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
    this.fileUpload.current.click();
  }

  handleUploadFile(event) {
    let files = event.target.files;

    if (files.length > 0) {
      const max_file_size = 5 * 1024 * 1000;
      let file = files[0];

      if (file.filename === "") {
        alert("Filename cannot be empty");
        return;
      } else if (file.size > max_file_size) {
        alert("File size is too large!");
        return;
      }

      let data = new FormData();
      data.append("file", files[0]);
      data.append("parentId", this.state.selectedFileInfo.fileId);
      axios.post("/api/files", data, {
        onUploadProgress: progress => {
          let uploadProgress = progress.loaded / progress.total * 100;
          this.setState({
            uploadProgress: uploadProgress
          });
        }
      }).then(response => {
        data = response.data;

        if (!data.success) {
          alert("Failed to upload File: " + response.msg);
        }
      });
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
        success: response => {
          if (response.success) {
            let deleteInfo = {
              fileId: data.file_id
            };
            FileManagementPage.deletedFileInfos.push(deleteInfo);
            this.setState({
              deleteFileInfo: this.state.selectedFileInfo
            });
          } else {
            alert("Failed to delete file\"" + this.state.selectedFileInfo.fileName + "\"");
          }
        }
      });
    }
  }

  handleOnSetCreateFolder(doCreateFolder) {
    this.setState({
      createFolder: doCreateFolder
    });
  }

  handleOnClickCreateFolder() {
    this.handleOnSetCreateFolder(true);
  }

  handleOnSelectFile(fileInfo) {
    this.setState({
      selectedFileInfo: fileInfo
    });
  }

  isSelected(fileId) {
    return this.state.selectedFileInfo && this.state.selectedFileInfo.fileId === fileId;
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
    this.handleOnSelectFile = this.handleOnSelectFile.bind(this);
    let isAnyFileSelected = this.state.selectedFileInfo && this.state.selectedFileInfo.fileId > 0;
    let displayIfFileSelected = isAnyFileSelected && !this.state.selectedFileInfo.isFolder ? "" : "none";
    let displayFolderOnlyButtons = isAnyFileSelected && this.state.selectedFileInfo.isFolder ? "" : "none";
    let displayIfFileIsNotRoot = isAnyFileSelected && !this.state.selectedFileInfo.isRoot ? "" : "none";
    let fileTree = [];

    if (this.props.isLoggedIn) {
      fileTree.push(React.createElement(File, {
        fileId: -1,
        fileName: "",
        isFolder: true,
        isExpanded: false,
        isSelected: this.isSelected,
        createFolder: this.state.createFolder,
        handleOnSelectFile: this.handleOnSelectFile.bind(this),
        handleOnSetCreateFolder: this.handleOnSetCreateFolder.bind(this)
      }));
    }

    return React.createElement("div", null, React.createElement("div", {
      id: "divTopBar",
      className: "topBar"
    }, React.createElement("button", {
      id: "btnUploadFile",
      className: "btnTopBar",
      style: {
        display: displayFolderOnlyButtons
      },
      onClick: this.handleOnClickUpload
    }, "Upload File"), React.createElement("button", {
      id: "btnDeleteFile",
      className: "btnTopBar",
      style: {
        display: displayIfFileIsNotRoot
      },
      onClick: this.handleOnDeleteFile
    }, isAnyFileSelected && this.state.selectedFileInfo.isFolder ? "Delete Folder" : "Delete File"), React.createElement("button", {
      id: "btnCreateFolder",
      className: "btnTopBar",
      style: {
        display: displayFolderOnlyButtons
      },
      onClick: this.handleOnClickCreateFolder
    }, "Create Folder"), React.createElement("form", {
      className: "formDownload",
      action: "/api/download",
      method: "POST"
    }, React.createElement("input", {
      type: "text",
      name: "file_id",
      style: {
        display: "none"
      },
      value: this.state.selectedFileInfo ? this.state.selectedFileInfo.fileId : -1
    }), React.createElement("button", {
      id: "btnDownloadFile",
      className: "btnTopBar",
      style: {
        display: displayIfFileSelected
      },
      type: "submit"
    }, "Download File")), React.createElement("button", {
      id: "btnLogout",
      className: "btnTopBar",
      onClick: this.handleOnLogout
    }, "Logout")), React.createElement("div", {
      id: "divFileTreeContainer"
    }, fileTree), React.createElement("input", {
      id: "fileUpload",
      ref: this.fileUpload,
      type: "file",
      style: {
        display: "none"
      },
      onChange: this.handleUploadFile
    }));
  }

}

_defineProperty(FileManagementPage, "deletedFileInfos", []);

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
              fileName: files[0].file_name,
              isRoot: true
            });
          } else if (this.state.childrenFiles.length !== files) {
            let childrenFiles = [];
            files.forEach(child => {
              childrenFiles.push(this.renderChildFile(child));
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

    if (shouldExpand && this.props.isFolder && this.state.childrenFiles.length === 0) {
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
    let new_file_name = event.target.value;

    if (new_file_name === "") {
      alert("File name cannot be empty!");
      return;
    }

    let data = {
      file_id: this.state.fileId,
      new_file_name: new_file_name
    };

    if (new_file_name !== this.state.fileName) {
      $.ajax({
        url: "/api/files",
        type: "PUT",
        data: data,
        success: response => {
          if (response.success) {
            this.setState({
              fileName: new_file_name
            });
          } else {
            alert("Failed to update file name!");
          }
        }
      });
    }

    this.setState({
      isSelected: false
    });
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
        success: response => {
          if (response.success && response.data) {
            let folder = response.data;
            this.state.childrenFiles.push(this.renderChildFile(folder));
            this.setState({
              childrenFiles: this.state.childrenFiles
            });
          } else {
            alert("Failed to create new folder!");
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
    childrenFiles.forEach(child => {
      this.state.childrenFiles.push(this.renderChildFile(child));
    });
    this.state.shouldUpdateChildren = false;
  }

  renderChildFile(child) {
    return React.createElement(File, {
      fileId: child.file_id || child.props && child.props.fileId,
      fileName: child.file_name || child.props && child.props.fileName,
      isFolder: child.is_folder || child.props && child.props.isFolder,
      isExpanded: this.state.isExpanded,
      isSelected: this.state.isSelected,
      createFolder: this.props.createFolder,
      handleOnSelectFile: this.props.handleOnSelectFile,
      handleOnSetCreateFolder: this.props.handleOnSetCreateFolder
    });
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
    return React.createElement("div", {
      className: "fileNodeContainer",
      style: {
        display: FileManagementPage.deletedFileInfos.filter(d => d.fileId === this.state.fileId).length > 0 ? "none" : ""
      }
    }, React.createElement("input", {
      className: fileNodeClass,
      type: "text",
      defaultValue: this.state.fileName,
      onClick: this.handleOnClickFile,
      onBlur: this.handleOnBlur
    }), childrenFileNodes);
  }

}

ReactDOM.render(React.createElement(IndexPage, null), document.getElementById("root")); // .\babel ..\..\ --out-file .
// .\..\test.js --presets=@babel/preset-react

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMsQ0FBQyxNQUFGLEtBQWEsS0FBSyxLQUFMLENBQVcsTUFEaEMsRUFFSixNQUZJLEdBRUssQ0FGTCxHQUVTLE1BRlQsR0FFa0I7QUFIVztBQUExQyxPQUtJO0FBQU8sTUFBQSxTQUFTLEVBQUUsYUFBbEI7QUFDTyxNQUFBLElBQUksRUFBQyxNQURaO0FBRU8sTUFBQSxZQUFZLEVBQUUsS0FBSyxLQUFMLENBQVcsUUFGaEM7QUFHTyxNQUFBLE9BQU8sRUFBRSxLQUFLLGlCQUhyQjtBQUlPLE1BQUEsTUFBTSxFQUFFLEtBQUs7QUFKcEIsTUFMSixFQVdLLGlCQVhMLENBREo7QUFlSDs7QUE1TDhCOztBQStMbkMsUUFBUSxDQUFDLE1BQVQsQ0FDSSxvQkFBQyxTQUFELE9BREosRUFFSSxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixDQUZKLEUsQ0FLQTtBQUNBIiwiZmlsZSI6IkluZGV4UGFnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJzsqL1xyXG5cclxuY2xhc3MgSW5kZXhQYWdlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICAgICAgc3VwZXIocHJvcHMpO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XHJcbiAgICAgICAgICAgIGlzTG9nZ2VkSW4gOiBmYWxzZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaGFuZGxlTG9naW5SZWRpcmVjdCA9IHRoaXMuaGFuZGxlTG9naW5SZWRpcmVjdC5iaW5kKHRoaXMpXHJcbiAgICAgICAgdGhpcy5oYW5kbGVMb2dvdXRSZWRpcmVjdCA9IHRoaXMuaGFuZGxlTG9nb3V0UmVkaXJlY3QuYmluZCh0aGlzKVxyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUxvZ2luUmVkaXJlY3QoKSB7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNMb2dnZWRJbiA6IHRydWV9KTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVMb2dvdXRSZWRpcmVjdCgpIHtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKHtpc0xvZ2dlZEluIDogZmFsc2V9KTtcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICAgICAgbGV0IGRpc3BsYXlMb2dpblBhZ2UgPSB0aGlzLnN0YXRlLmlzTG9nZ2VkSW4gPyBcIm5vbmVcIiA6IFwiXCI7XHJcbiAgICAgICAgbGV0IGRpc3BsYXlGaWxlTWFuYWdlbWVudFBhZ2UgPSB0aGlzLnN0YXRlLmlzTG9nZ2VkSW4gPyBcIlwiIDogXCJub25lXCI7XHJcblxyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7ZGlzcGxheSA6IGRpc3BsYXlMb2dpblBhZ2V9fT5cclxuICAgICAgICAgICAgICAgICAgICA8TG9naW5QYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZUxvZ2luUmVkaXJlY3Q9e3RoaXMuaGFuZGxlTG9naW5SZWRpcmVjdH0vPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7ZGlzcGxheSA6IGRpc3BsYXlGaWxlTWFuYWdlbWVudFBhZ2V9fT5cclxuICAgICAgICAgICAgICAgICAgICA8RmlsZU1hbmFnZW1lbnRQYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzTG9nZ2VkSW49e3RoaXMuc3RhdGUuaXNMb2dnZWRJbn1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlTG9nb3V0UmVkaXJlY3Q9e3RoaXMuaGFuZGxlTG9nb3V0UmVkaXJlY3R9Lz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICApXHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIExvZ2luUGFnZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcclxuICAgICAgICBzdXBlcihwcm9wcyk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcclxuICAgICAgICAgICAgdXNlcm5hbWU6IFwiXCIsXHJcbiAgICAgICAgICAgIHBhc3N3b3JkOiBcIlwiXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5oYW5kbGVPblVzZXJuYW1lQ2hhbmdlID0gdGhpcy5oYW5kbGVPblVzZXJuYW1lQ2hhbmdlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVPblBhc3N3b3JkQ2hhbmdlID0gdGhpcy5oYW5kbGVPblBhc3N3b3JkQ2hhbmdlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVPbkxvZ2luID0gdGhpcy5oYW5kbGVPbkxvZ2luLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVPbkNyZWF0ZVVzZXIgPSB0aGlzLmhhbmRsZU9uQ3JlYXRlVXNlci5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZGlzcGxheUxvZ2luQnV0dG9uID0gdGhpcy5kaXNwbGF5TG9naW5CdXR0b24uYmluZCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVPblVzZXJuYW1lQ2hhbmdlKGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dXNlcm5hbWUgOiBldmVudC50YXJnZXQudmFsdWV9KVxyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZU9uUGFzc3dvcmRDaGFuZ2UoZXZlbnQpIHtcclxuICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cGFzc3dvcmQgOiBldmVudC50YXJnZXQudmFsdWV9KVxyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZU9uQ3JlYXRlVXNlcihldmVudCkge1xyXG4gICAgICAgIGxldCBkYXRhID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICBpZiAoZGF0YS51c2VybmFtZSAhPT0gXCJcIiAmJiBkYXRhLnBhc3N3b3JkICE9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmwgOiBcIi9hcGkvdXNlcnNcIixcclxuICAgICAgICAgICAgICAgIHR5cGUgOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgICAgIGRhdGEgOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgc3VjY2VzcyA6IChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiU3VjY2Vzc2Z1bGx5IGNyZWF0ZWQgdXNlciEgWW91IGNhbiBub3cgbG9naW4gXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5tc2cgJiYgcmVzcG9uc2UubXNnICE9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGVydChyZXNwb25zZS5tc2cpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiRmFpbGVkIHRvIGNyZWF0ZSB1c2VyIFwiICsgdGhpcy5zdGF0ZS51c2VybmFtZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYWxlcnQoXCJVc2VybmFtZSBhbmQgcGFzc3dvcmQgZmllbGRzIGNhbm5vdCBiZSBlbXB0eSFcIilcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZU9uTG9naW4oKSB7XHJcbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLnN0YXRlO1xyXG5cclxuICAgICAgICBpZiAoZGF0YS51c2VybmFtZSAhPT0gXCJcIiAmJiBkYXRhLnBhc3N3b3JkICE9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS91c2Vyc1wiLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmhhbmRsZUxvZ2luUmVkaXJlY3QoKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiRmFpbGVkIHRvIGxvZ2luIHRvIFwiICsgdGhpcy5zdGF0ZS51c2VybmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KFwiVXNlcm5hbWUgYW5kIHBhc3N3b3JkIGZpZWxkcyBjYW5ub3QgYmUgZW1wdHkhXCIpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRpc3BsYXlMb2dpbkJ1dHRvbigpIHtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImJ0bkNyZWF0ZVVzZXJcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG5Mb2dpblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlT25DcmVhdGVVc2VyfT5DcmVhdGUgTmV3IEFjY291bnQ8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJidG5Mb2dpblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0bkxvZ2luXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVPbkxvZ2lufT5Mb2dpbjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgcmVuZGVyKCkge1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibG9naW5Db250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImxvZ2luTGFiZWxcIj5Vc2VybmFtZTogPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJpbnBVc2VybmFtZVwiIGNsYXNzTmFtZT1cImxvZ2luSW5wdXRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiIG9uQ2hhbmdlPXt0aGlzLmhhbmRsZU9uVXNlcm5hbWVDaGFuZ2V9Lz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwibG9naW5MYWJlbFwiPlBhc3N3b3JkOiA8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cImlucFBhc3N3b3JkXCIgY2xhc3NOYW1lPVwibG9naW5JbnB1dFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgb25DaGFuZ2U9e3RoaXMuaGFuZGxlT25QYXNzd29yZENoYW5nZX0vPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICB7dGhpcy5kaXNwbGF5TG9naW5CdXR0b24oKX1cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKVxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBGaWxlTWFuYWdlbWVudFBhZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xyXG5cclxuICAgIHN0YXRpYyBkZWxldGVkRmlsZUluZm9zID0gW107XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcclxuICAgICAgICBzdXBlcihwcm9wcyk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcclxuICAgICAgICAgICAgc2VsZWN0ZWRGaWxlSW5mbzogbnVsbCxcclxuICAgICAgICAgICAgZGVsZXRlRmlsZUluZm86IG51bGwsXHJcbiAgICAgICAgICAgIHVwbG9hZFByb2dyZXNzOiAwLFxyXG4gICAgICAgICAgICBjcmVhdGVGb2xkZXI6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5maWxlVXBsb2FkID0gUmVhY3QuY3JlYXRlUmVmKCk7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVPbkNsaWNrVXBsb2FkID0gdGhpcy5oYW5kbGVPbkNsaWNrVXBsb2FkLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVVcGxvYWRGaWxlID0gdGhpcy5oYW5kbGVVcGxvYWRGaWxlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVPbkRlbGV0ZUZpbGUgPSB0aGlzLmhhbmRsZU9uRGVsZXRlRmlsZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlT25TZXRDcmVhdGVGb2xkZXIgPSB0aGlzLmhhbmRsZU9uU2V0Q3JlYXRlRm9sZGVyLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVPbkNsaWNrQ3JlYXRlRm9sZGVyID0gdGhpcy5oYW5kbGVPbkNsaWNrQ3JlYXRlRm9sZGVyLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVPbkxvZ291dCA9IHRoaXMuaGFuZGxlT25Mb2dvdXQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmlzU2VsZWN0ZWQgPSB0aGlzLmlzU2VsZWN0ZWQuYmluZCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVPbkNsaWNrVXBsb2FkKCkge1xyXG4gICAgICAgIHRoaXMuZmlsZVVwbG9hZC5jdXJyZW50LmNsaWNrKClcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVVcGxvYWRGaWxlKGV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGZpbGVzID0gZXZlbnQudGFyZ2V0LmZpbGVzO1xyXG4gICAgICAgIGlmIChmaWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1heF9maWxlX3NpemUgPSAgNSAqIDEwMjQgKiAxMDAwXHJcbiAgICAgICAgICAgIGxldCBmaWxlID0gZmlsZXNbMF07XHJcbiAgICAgICAgICAgIGlmIChmaWxlLmZpbGVuYW1lID09PSBcIlwiKSB7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcIkZpbGVuYW1lIGNhbm5vdCBiZSBlbXB0eVwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChmaWxlLnNpemUgPiBtYXhfZmlsZV9zaXplKSB7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcIkZpbGUgc2l6ZSBpcyB0b28gbGFyZ2UhXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IG5ldyBGb3JtRGF0YSgpXHJcbiAgICAgICAgICAgIGRhdGEuYXBwZW5kKFwiZmlsZVwiLCBmaWxlc1swXSk7XHJcbiAgICAgICAgICAgIGRhdGEuYXBwZW5kKFwicGFyZW50SWRcIiwgdGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVJbmZvLmZpbGVJZClcclxuICAgICAgICAgICAgYXhpb3MucG9zdChcIi9hcGkvZmlsZXNcIiwgZGF0YSwge1xyXG4gICAgICAgICAgICAgICAgb25VcGxvYWRQcm9ncmVzczogKHByb2dyZXNzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHVwbG9hZFByb2dyZXNzID0gcHJvZ3Jlc3MubG9hZGVkIC8gcHJvZ3Jlc3MudG90YWwgKiAxMDA7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dXBsb2FkUHJvZ3Jlc3M6IHVwbG9hZFByb2dyZXNzfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgIGlmICghZGF0YS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoXCJGYWlsZWQgdG8gdXBsb2FkIEZpbGU6IFwiICsgcmVzcG9uc2UubXNnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlT25EZWxldGVGaWxlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkRmlsZUluZm8uZmlsZUlkICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBmaWxlX2lkOiB0aGlzLnN0YXRlLnNlbGVjdGVkRmlsZUluZm8uZmlsZUlkXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvZmlsZXNcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcIkRFTEVURVwiLFxyXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRlbGV0ZUluZm8gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlSWQ6IGRhdGEuZmlsZV9pZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBGaWxlTWFuYWdlbWVudFBhZ2UuZGVsZXRlZEZpbGVJbmZvcy5wdXNoKGRlbGV0ZUluZm8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtkZWxldGVGaWxlSW5mbyA6IHRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlSW5mb30pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiRmFpbGVkIHRvIGRlbGV0ZSBmaWxlXFxcIlwiICsgdGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVJbmZvLmZpbGVOYW1lICsgXCJcXFwiXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVPblNldENyZWF0ZUZvbGRlcihkb0NyZWF0ZUZvbGRlcikge1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NyZWF0ZUZvbGRlciA6IGRvQ3JlYXRlRm9sZGVyfSlcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVPbkNsaWNrQ3JlYXRlRm9sZGVyKCkge1xyXG4gICAgICAgIHRoaXMuaGFuZGxlT25TZXRDcmVhdGVGb2xkZXIodHJ1ZSlcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVPblNlbGVjdEZpbGUoZmlsZUluZm8pIHtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEZpbGVJbmZvOiBmaWxlSW5mb30pO1xyXG4gICAgfVxyXG5cclxuICAgIGlzU2VsZWN0ZWQoZmlsZUlkKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlSW5mbyAmJiB0aGlzLnN0YXRlLnNlbGVjdGVkRmlsZUluZm8uZmlsZUlkID09PSBmaWxlSWRcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVPbkxvZ291dCgpIHtcclxuICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6IFwiL2FwaS9sb2dvdXRcIixcclxuICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcclxuICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiU3VjY2Vzc2Z1bGx5IExvZ2dlZCBvdXQhXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuaGFuZGxlTG9nb3V0UmVkaXJlY3QoKVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGVydChcIkZhaWxlZCB0byBsb2dvdXQgZm9yIHVzZXIgXFxcIlwiICsgdGhpcy5zdGF0ZS51c2VybmFtZSArIFwiXFxcIlwiKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVPblNlbGVjdEZpbGUgPSB0aGlzLmhhbmRsZU9uU2VsZWN0RmlsZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIGxldCBpc0FueUZpbGVTZWxlY3RlZCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlSW5mbyAmJiB0aGlzLnN0YXRlLnNlbGVjdGVkRmlsZUluZm8uZmlsZUlkID4gMDtcclxuICAgICAgICBsZXQgZGlzcGxheUlmRmlsZVNlbGVjdGVkID0gaXNBbnlGaWxlU2VsZWN0ZWQgJiYgIXRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlSW5mby5pc0ZvbGRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcIlwiIDogXCJub25lXCI7XHJcbiAgICAgICAgbGV0IGRpc3BsYXlGb2xkZXJPbmx5QnV0dG9ucyA9ICBpc0FueUZpbGVTZWxlY3RlZCAmJiB0aGlzLnN0YXRlLnNlbGVjdGVkRmlsZUluZm8uaXNGb2xkZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcIlwiIDogXCJub25lXCI7XHJcbiAgICAgICAgbGV0IGRpc3BsYXlJZkZpbGVJc05vdFJvb3QgPSBpc0FueUZpbGVTZWxlY3RlZCAmJiAhdGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVJbmZvLmlzUm9vdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcIlwiIDogXCJub25lXCI7XHJcblxyXG4gICAgICAgIGxldCBmaWxlVHJlZSA9IFtdO1xyXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmlzTG9nZ2VkSW4pIHtcclxuICAgICAgICAgICAgZmlsZVRyZWUucHVzaChcclxuICAgICAgICAgICAgICAgIDxGaWxlXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZUlkPXstMX1cclxuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZT17XCJcIn1cclxuICAgICAgICAgICAgICAgICAgICBpc0ZvbGRlcj17dHJ1ZX1cclxuICAgICAgICAgICAgICAgICAgICBpc0V4cGFuZGVkPXtmYWxzZX1cclxuICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkPXt0aGlzLmlzU2VsZWN0ZWR9XHJcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlRm9sZGVyPXt0aGlzLnN0YXRlLmNyZWF0ZUZvbGRlcn1cclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVPblNlbGVjdEZpbGU9e3RoaXMuaGFuZGxlT25TZWxlY3RGaWxlLmJpbmQodGhpcyl9XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlT25TZXRDcmVhdGVGb2xkZXI9e3RoaXMuaGFuZGxlT25TZXRDcmVhdGVGb2xkZXIuYmluZCh0aGlzKX0vPilcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGlkPVwiZGl2VG9wQmFyXCIgY2xhc3NOYW1lPVwidG9wQmFyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImJ0blVwbG9hZEZpbGVcIiBjbGFzc05hbWU9XCJidG5Ub3BCYXJcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tkaXNwbGF5OiBkaXNwbGF5Rm9sZGVyT25seUJ1dHRvbnN9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVPbkNsaWNrVXBsb2FkfT5VcGxvYWQgRmlsZTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJidG5EZWxldGVGaWxlXCIgY2xhc3NOYW1lPVwiYnRuVG9wQmFyXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7ZGlzcGxheTogZGlzcGxheUlmRmlsZUlzTm90Um9vdCB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVPbkRlbGV0ZUZpbGV9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtpc0FueUZpbGVTZWxlY3RlZCAmJiB0aGlzLnN0YXRlLnNlbGVjdGVkRmlsZUluZm8uaXNGb2xkZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcIkRlbGV0ZSBGb2xkZXJcIiA6IFwiRGVsZXRlIEZpbGVcIn1cclxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiYnRuQ3JlYXRlRm9sZGVyXCIgY2xhc3NOYW1lPVwiYnRuVG9wQmFyXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7ZGlzcGxheTogZGlzcGxheUZvbGRlck9ubHlCdXR0b25zfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlT25DbGlja0NyZWF0ZUZvbGRlcn0+Q3JlYXRlIEZvbGRlcjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cImZvcm1Eb3dubG9hZFwiIGFjdGlvbj17XCIvYXBpL2Rvd25sb2FkXCJ9ICBtZXRob2Q9XCJQT1NUXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJmaWxlX2lkXCIgc3R5bGU9e3tkaXNwbGF5OiBcIm5vbmVcIn19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVJbmZvID8gdGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVJbmZvLmZpbGVJZCA6IC0xfS8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiYnRuRG93bmxvYWRGaWxlXCIgY2xhc3NOYW1lPVwiYnRuVG9wQmFyXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7ZGlzcGxheTogZGlzcGxheUlmRmlsZVNlbGVjdGVkfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIj5Eb3dubG9hZCBGaWxlPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9mb3JtPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJidG5Mb2dvdXRcIiBjbGFzc05hbWU9XCJidG5Ub3BCYXJcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVPbkxvZ291dH0+TG9nb3V0PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJkaXZGaWxlVHJlZUNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgIHtmaWxlVHJlZX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IGlkPVwiZmlsZVVwbG9hZFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmZpbGVVcGxvYWR9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImZpbGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7ZGlzcGxheTpcIm5vbmVcIn19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuaGFuZGxlVXBsb2FkRmlsZX0vPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICApXHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEZpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xyXG4vKiAgICBwcm9wVHlwZXMgPSB7XHJcbiAgICAgICAgZmlsZUlkOiBQcm9wVHlwZXMubnVtYmVyLFxyXG4gICAgICAgIGZpbGVOYW1lOiBQcm9wVHlwZXMuU3RyaW5nLFxyXG4gICAgICAgIGdldEZpbGVzOiBQcm9wVHlwZXMuZnVuY1xyXG4gICAgfTsqL1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICAgICAgc3VwZXIocHJvcHMpO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XHJcbiAgICAgICAgICAgIGZpbGVJZDogdGhpcy5wcm9wcy5maWxlSWQsXHJcbiAgICAgICAgICAgIGZpbGVOYW1lOiB0aGlzLnByb3BzLmZpbGVOYW1lLFxyXG4gICAgICAgICAgICBpc1Jvb3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICBpc0V4cGFuZGVkOiB0aGlzLnByb3BzLmlzRXhwYW5kZWQsXHJcbiAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBjcmVhdGluZ0ZvbGRlcjogZmFsc2UsXHJcbiAgICAgICAgICAgIHNob3VsZFVwZGF0ZUNoaWxkcmVuOiBmYWxzZSxcclxuICAgICAgICAgICAgY2hpbGRyZW5GaWxlczogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmdldEZpbGVzID0gdGhpcy5nZXRGaWxlcy5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyQ2hpbGRGaWxlID0gdGhpcy5yZW5kZXJDaGlsZEZpbGUuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUNoaWxkcmVuID0gdGhpcy51cGRhdGVDaGlsZHJlbi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlT25DbGlja0ZpbGUgPSB0aGlzLmhhbmRsZU9uQ2xpY2tGaWxlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVPbkJsdXIgPSB0aGlzLmhhbmRsZU9uQmx1ci5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5maWxlSWQgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICB0aGlzLmdldEZpbGVzKHRoaXMuc3RhdGUuZmlsZUlkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RmlsZXMocGFyZW50SWQpIHtcclxuICAgICAgICAgbGV0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgICBwYXJlbnRJZCA6IHBhcmVudElkXHJcbiAgICAgICAgIH07XHJcbiAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICB1cmw6IFwiL2FwaS9maWxlc1wiLFxyXG4gICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcclxuICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICBsZXQgZmlsZXMgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50SWQgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUlkOiBmaWxlc1swXS5maWxlX2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWU6IGZpbGVzWzBdLmZpbGVfbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUm9vdDogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmNoaWxkcmVuRmlsZXMubGVuZ3RoICE9PSBmaWxlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkcmVuRmlsZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzLmZvckVhY2goKGNoaWxkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5GaWxlcy5wdXNoKHRoaXMucmVuZGVyQ2hpbGRGaWxlKGNoaWxkKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2NoaWxkcmVuRmlsZXM6IGNoaWxkcmVuRmlsZXN9KTtcclxuICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiRmFpbGVkIHRvIGdldCBmaWxlcyEgUGxlYXNlIHJlLWxvZ2luIGFuZCB0cnkgYWdhaW5cIik7XHJcbiAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVPbkNsaWNrRmlsZShldmVudCkge1xyXG4gICAgICAgIGxldCBzaG91bGRFeHBhbmQgPSAhdGhpcy5zdGF0ZS5pc0V4cGFuZGVkO1xyXG4gICAgICAgIGlmIChzaG91bGRFeHBhbmQgJiYgdGhpcy5wcm9wcy5pc0ZvbGRlciAmJiB0aGlzLnN0YXRlLmNoaWxkcmVuRmlsZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RmlsZXModGhpcy5zdGF0ZS5maWxlSWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgIGxldCBmaWxlSW5mbyA9IHtcclxuICAgICAgICAgICAgZmlsZUlkOiB0aGlzLnN0YXRlLmZpbGVJZCxcclxuICAgICAgICAgICAgaXNGb2xkZXI6IHRoaXMucHJvcHMuaXNGb2xkZXIsXHJcbiAgICAgICAgICAgIGlzUm9vdDogdGhpcy5zdGF0ZS5pc1Jvb3RcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnByb3BzLmhhbmRsZU9uU2VsZWN0RmlsZShmaWxlSW5mbyk7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgIGlzRXhwYW5kZWQ6IHNob3VsZEV4cGFuZCxcclxuICAgICAgICAgICAgaXNTZWxlY3RlZDogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZU9uQmx1cihldmVudCkge1xyXG4gICAgICAgIGxldCBuZXdfZmlsZV9uYW1lID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgIGlmIChuZXdfZmlsZV9uYW1lID09PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KFwiRmlsZSBuYW1lIGNhbm5vdCBiZSBlbXB0eSFcIik7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgIGZpbGVfaWQgOiB0aGlzLnN0YXRlLmZpbGVJZCxcclxuICAgICAgICAgICAgbmV3X2ZpbGVfbmFtZSA6IG5ld19maWxlX25hbWVcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChuZXdfZmlsZV9uYW1lICE9PSB0aGlzLnN0YXRlLmZpbGVOYW1lKSB7XHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS9maWxlc1wiLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJQVVRcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtmaWxlTmFtZSA6IG5ld19maWxlX25hbWV9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiRmFpbGVkIHRvIHVwZGF0ZSBmaWxlIG5hbWUhXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNTZWxlY3RlZCA6IGZhbHNlfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlQ3JlYXRlRm9sZGVyKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmNyZWF0ZUZvbGRlciAmJiAhdGhpcy5zdGF0ZS5jcmVhdGluZ0ZvbGRlciAmJiB0aGlzLnN0YXRlLmlzU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5jcmVhdGluZ0ZvbGRlciA9IHRydWU7XHJcbiAgICAgICAgICAgIGxldCBuZXdfZm9sZGVyX2RhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBmaWxlX25hbWU6IFwiTmV3IEZvbGRlclwiLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50X2lkOiB0aGlzLnN0YXRlLmZpbGVJZFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS9mb2xkZXJzXCIsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5ld19mb2xkZXJfZGF0YSxcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzICYmIHJlc3BvbnNlLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZvbGRlciA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuY2hpbGRyZW5GaWxlcy5wdXNoKHRoaXMucmVuZGVyQ2hpbGRGaWxlKGZvbGRlcikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjaGlsZHJlbkZpbGVzIDogdGhpcy5zdGF0ZS5jaGlsZHJlbkZpbGVzfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQoXCJGYWlsZWQgdG8gY3JlYXRlIG5ldyBmb2xkZXIhXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuY3JlYXRpbmdGb2xkZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMucHJvcHMuaGFuZGxlT25TZXRDcmVhdGVGb2xkZXIoZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVDaGlsZHJlbigpIHtcclxuICAgICAgICBsZXQgY2hpbGRyZW5GaWxlcyA9IHRoaXMuc3RhdGUuY2hpbGRyZW5GaWxlcztcclxuICAgICAgICB0aGlzLnN0YXRlLmNoaWxkcmVuRmlsZXMgPSBbXTtcclxuICAgICAgICBjaGlsZHJlbkZpbGVzLmZvckVhY2goKGNoaWxkKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuY2hpbGRyZW5GaWxlcy5wdXNoKHRoaXMucmVuZGVyQ2hpbGRGaWxlKGNoaWxkKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZS5zaG91bGRVcGRhdGVDaGlsZHJlbiA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlckNoaWxkRmlsZShjaGlsZCkge1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIDxGaWxlXHJcbiAgICAgICAgICAgICAgICAgZmlsZUlkPXtjaGlsZC5maWxlX2lkIHx8IGNoaWxkLnByb3BzICYmIGNoaWxkLnByb3BzLmZpbGVJZH1cclxuICAgICAgICAgICAgICAgICBmaWxlTmFtZT17Y2hpbGQuZmlsZV9uYW1lIHx8IGNoaWxkLnByb3BzICYmIGNoaWxkLnByb3BzLmZpbGVOYW1lfVxyXG4gICAgICAgICAgICAgICAgIGlzRm9sZGVyPXtjaGlsZC5pc19mb2xkZXIgfHwgY2hpbGQucHJvcHMgJiYgY2hpbGQucHJvcHMuaXNGb2xkZXJ9XHJcbiAgICAgICAgICAgICAgICAgaXNFeHBhbmRlZD17dGhpcy5zdGF0ZS5pc0V4cGFuZGVkfVxyXG4gICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ9e3RoaXMuc3RhdGUuaXNTZWxlY3RlZH1cclxuICAgICAgICAgICAgICAgICBjcmVhdGVGb2xkZXI9e3RoaXMucHJvcHMuY3JlYXRlRm9sZGVyfVxyXG4gICAgICAgICAgICAgICAgIGhhbmRsZU9uU2VsZWN0RmlsZT17dGhpcy5wcm9wcy5oYW5kbGVPblNlbGVjdEZpbGV9XHJcbiAgICAgICAgICAgICAgICAgaGFuZGxlT25TZXRDcmVhdGVGb2xkZXI9e3RoaXMucHJvcHMuaGFuZGxlT25TZXRDcmVhdGVGb2xkZXJ9Lz5cclxuICAgICAgICAgKVxyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlcigpIHtcclxuICAgICAgICAvLyB0aGlzLnN0YXRlLmlzU2VsZWN0ZWQgPSB0aGlzLnByb3BzLmlzU2VsZWN0ZWQodGhpcy5zdGF0ZS5maWxlSWQpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyQ2hpbGRGaWxlID0gdGhpcy5yZW5kZXJDaGlsZEZpbGUuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUNoaWxkcmVuID0gdGhpcy51cGRhdGVDaGlsZHJlbi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlQ2hpbGRyZW4oKTtcclxuXHJcbiAgICAgICAgdGhpcy5oYW5kbGVDcmVhdGVGb2xkZXIgPSB0aGlzLmhhbmRsZUNyZWF0ZUZvbGRlci5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUNyZWF0ZUZvbGRlcigpO1xyXG5cclxuICAgICAgICBsZXQgZmlsZU5vZGVDbGFzcyA9IFwiZmlsZU5vZGVcIjtcclxuICAgICAgICBmaWxlTm9kZUNsYXNzICs9IHRoaXMuc3RhdGUuaXNTZWxlY3RlZCA/IFwiIHNlbGVjdGVkXCIgOiBcIlwiO1xyXG4gICAgICAgIGxldCBjaGlsZHJlbkZpbGVOb2RlcyA9IHRoaXMuc3RhdGUuaXNFeHBhbmRlZCA/IHRoaXMuc3RhdGUuY2hpbGRyZW5GaWxlcyA6IFtdO1xyXG5cclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZpbGVOb2RlQ29udGFpbmVyXCIgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IEZpbGVNYW5hZ2VtZW50UGFnZS5kZWxldGVkRmlsZUluZm9zXHJcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihkID0+IGQuZmlsZUlkID09PSB0aGlzLnN0YXRlLmZpbGVJZClcclxuICAgICAgICAgICAgICAgICAgICAubGVuZ3RoID4gMCA/IFwibm9uZVwiIDogXCJcIlxyXG4gICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzc05hbWU9e2ZpbGVOb2RlQ2xhc3N9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZT17dGhpcy5zdGF0ZS5maWxlTmFtZX1cclxuICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZU9uQ2xpY2tGaWxlfVxyXG4gICAgICAgICAgICAgICAgICAgICAgIG9uQmx1cj17dGhpcy5oYW5kbGVPbkJsdXJ9PlxyXG4gICAgICAgICAgICAgICAgPC9pbnB1dD5cclxuICAgICAgICAgICAgICAgIHtjaGlsZHJlbkZpbGVOb2Rlc31cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKVxyXG4gICAgfVxyXG59XHJcblxyXG5SZWFjdERPTS5yZW5kZXIoXHJcbiAgICA8SW5kZXhQYWdlLz4sXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvb3RcIilcclxuKTtcclxuXHJcbi8vIC5cXGJhYmVsIC4uXFwuLlxcIC0tb3V0LWZpbGUgLlxyXG4vLyAuXFwuLlxcdGVzdC5qcyAtLXByZXNldHM9QGJhYmVsL3ByZXNldC1yZWFjdCJdfQ==