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
    let icon = this.props.isFolder ? "fa fa-folder" : "fa fa-file";
    return React.createElement("div", {
      className: "fileNodeContainer ",
      style: {
        display: FileManagementPage.deletedFileInfos.filter(d => d.fileId === this.state.fileId).length > 0 ? "none" : ""
      }
    }, React.createElement("i", {
      className: icon
    }), React.createElement("input", {
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFPLEVBQUUsa0JBQWtCLENBQUMsZ0JBQW5CLENBQ0osTUFESSxDQUNHLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBRixLQUFhLEtBQUssS0FBTCxDQUFXLE1BRGhDLEVBRUosTUFGSSxHQUVLLENBRkwsR0FFUyxNQUZULEdBRWtCO0FBSFk7QUFBM0MsT0FLSTtBQUFHLE1BQUEsU0FBUyxFQUFFO0FBQWQsTUFMSixFQU1JO0FBQU8sTUFBQSxTQUFTLEVBQUUsYUFBbEI7QUFDTyxNQUFBLElBQUksRUFBQyxNQURaO0FBRU8sTUFBQSxZQUFZLEVBQUUsS0FBSyxLQUFMLENBQVcsUUFGaEM7QUFHTyxNQUFBLE9BQU8sRUFBRSxLQUFLLGlCQUhyQjtBQUlPLE1BQUEsTUFBTSxFQUFFLEtBQUs7QUFKcEIsTUFOSixFQVlLLGlCQVpMLENBREo7QUFnQkg7O0FBeEw4Qjs7QUEyTG5DLFFBQVEsQ0FBQyxNQUFULENBQ0ksb0JBQUMsU0FBRCxPQURKLEVBRUksUUFBUSxDQUFDLGNBQVQsQ0FBd0IsTUFBeEIsQ0FGSixFLENBS0E7QUFDQSIsImZpbGUiOiJJbmRleFBhZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7Ki9cclxuXHJcbmNsYXNzIEluZGV4UGFnZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xyXG4gICAgICAgIHN1cGVyKHByb3BzKTtcclxuICAgICAgICB0aGlzLnN0YXRlID0ge1xyXG4gICAgICAgICAgICBpc0xvZ2dlZEluIDogZmFsc2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmhhbmRsZUxvZ2luUmVkaXJlY3QgPSB0aGlzLmhhbmRsZUxvZ2luUmVkaXJlY3QuYmluZCh0aGlzKVxyXG4gICAgICAgIHRoaXMuaGFuZGxlTG9nb3V0UmVkaXJlY3QgPSB0aGlzLmhhbmRsZUxvZ291dFJlZGlyZWN0LmJpbmQodGhpcylcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVMb2dpblJlZGlyZWN0KCkge1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzTG9nZ2VkSW4gOiB0cnVlfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlTG9nb3V0UmVkaXJlY3QoKSB7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNMb2dnZWRJbiA6IGZhbHNlfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVuZGVyKCkge1xyXG4gICAgICAgIGxldCBkaXNwbGF5TG9naW5QYWdlID0gdGhpcy5zdGF0ZS5pc0xvZ2dlZEluID8gXCJub25lXCIgOiBcIlwiO1xyXG4gICAgICAgIGxldCBkaXNwbGF5RmlsZU1hbmFnZW1lbnRQYWdlID0gdGhpcy5zdGF0ZS5pc0xvZ2dlZEluID8gXCJcIiA6IFwibm9uZVwiO1xyXG5cclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e2Rpc3BsYXkgOiBkaXNwbGF5TG9naW5QYWdlfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPExvZ2luUGFnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVMb2dpblJlZGlyZWN0PXt0aGlzLmhhbmRsZUxvZ2luUmVkaXJlY3R9Lz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e2Rpc3BsYXkgOiBkaXNwbGF5RmlsZU1hbmFnZW1lbnRQYWdlfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPEZpbGVNYW5hZ2VtZW50UGFnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0xvZ2dlZEluPXt0aGlzLnN0YXRlLmlzTG9nZ2VkSW59XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZUxvZ291dFJlZGlyZWN0PXt0aGlzLmhhbmRsZUxvZ291dFJlZGlyZWN0fS8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKVxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBMb2dpblBhZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICAgICAgc3VwZXIocHJvcHMpO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XHJcbiAgICAgICAgICAgIHVzZXJuYW1lOiBcIlwiLFxyXG4gICAgICAgICAgICBwYXNzd29yZDogXCJcIlxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaGFuZGxlT25Vc2VybmFtZUNoYW5nZSA9IHRoaXMuaGFuZGxlT25Vc2VybmFtZUNoYW5nZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlT25QYXNzd29yZENoYW5nZSA9IHRoaXMuaGFuZGxlT25QYXNzd29yZENoYW5nZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlT25Mb2dpbiA9IHRoaXMuaGFuZGxlT25Mb2dpbi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlT25DcmVhdGVVc2VyID0gdGhpcy5oYW5kbGVPbkNyZWF0ZVVzZXIuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmRpc3BsYXlMb2dpbkJ1dHRvbiA9IHRoaXMuZGlzcGxheUxvZ2luQnV0dG9uLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlT25Vc2VybmFtZUNoYW5nZShldmVudCkge1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3VzZXJuYW1lIDogZXZlbnQudGFyZ2V0LnZhbHVlfSlcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVPblBhc3N3b3JkQ2hhbmdlKGV2ZW50KSB7XHJcbiAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3Bhc3N3b3JkIDogZXZlbnQudGFyZ2V0LnZhbHVlfSlcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVPbkNyZWF0ZVVzZXIoZXZlbnQpIHtcclxuICAgICAgICBsZXQgZGF0YSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgaWYgKGRhdGEudXNlcm5hbWUgIT09IFwiXCIgJiYgZGF0YS5wYXNzd29yZCAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgdXJsIDogXCIvYXBpL3VzZXJzXCIsXHJcbiAgICAgICAgICAgICAgICB0eXBlIDogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhIDogZGF0YSxcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgOiAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydChcIlN1Y2Nlc3NmdWxseSBjcmVhdGVkIHVzZXIhIFlvdSBjYW4gbm93IGxvZ2luIFwiKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2UubXNnICYmIHJlc3BvbnNlLm1zZyAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQocmVzcG9uc2UubXNnKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydChcIkZhaWxlZCB0byBjcmVhdGUgdXNlciBcIiArIHRoaXMuc3RhdGUudXNlcm5hbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KFwiVXNlcm5hbWUgYW5kIHBhc3N3b3JkIGZpZWxkcyBjYW5ub3QgYmUgZW1wdHkhXCIpXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVPbkxvZ2luKCkge1xyXG4gICAgICAgIGxldCBkYXRhID0gdGhpcy5zdGF0ZTtcclxuXHJcbiAgICAgICAgaWYgKGRhdGEudXNlcm5hbWUgIT09IFwiXCIgJiYgZGF0YS5wYXNzd29yZCAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvdXNlcnNcIixcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5oYW5kbGVMb2dpblJlZGlyZWN0KClcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydChcIkZhaWxlZCB0byBsb2dpbiB0byBcIiArIHRoaXMuc3RhdGUudXNlcm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhbGVydChcIlVzZXJuYW1lIGFuZCBwYXNzd29yZCBmaWVsZHMgY2Fubm90IGJlIGVtcHR5IVwiKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkaXNwbGF5TG9naW5CdXR0b24oKSB7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJidG5DcmVhdGVVc2VyXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuTG9naW5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZU9uQ3JlYXRlVXNlcn0+Q3JlYXRlIE5ldyBBY2NvdW50PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiYnRuTG9naW5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG5Mb2dpblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlT25Mb2dpbn0+TG9naW48L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKVxyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlcigpIHtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxvZ2luQ29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJsb2dpbkxhYmVsXCI+VXNlcm5hbWU6IDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IGlkPVwiaW5wVXNlcm5hbWVcIiBjbGFzc05hbWU9XCJsb2dpbklucHV0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIiBvbkNoYW5nZT17dGhpcy5oYW5kbGVPblVzZXJuYW1lQ2hhbmdlfS8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImxvZ2luTGFiZWxcIj5QYXNzd29yZDogPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJpbnBQYXNzd29yZFwiIGNsYXNzTmFtZT1cImxvZ2luSW5wdXRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiIG9uQ2hhbmdlPXt0aGlzLmhhbmRsZU9uUGFzc3dvcmRDaGFuZ2V9Lz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAge3RoaXMuZGlzcGxheUxvZ2luQnV0dG9uKCl9XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIClcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgRmlsZU1hbmFnZW1lbnRQYWdlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuXHJcbiAgICBzdGF0aWMgZGVsZXRlZEZpbGVJbmZvcyA9IFtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICAgICAgc3VwZXIocHJvcHMpO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkRmlsZUluZm86IG51bGwsXHJcbiAgICAgICAgICAgIGRlbGV0ZUZpbGVJbmZvOiBudWxsLFxyXG4gICAgICAgICAgICB1cGxvYWRQcm9ncmVzczogMCxcclxuICAgICAgICAgICAgY3JlYXRlRm9sZGVyOiBmYWxzZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZmlsZVVwbG9hZCA9IFJlYWN0LmNyZWF0ZVJlZigpO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlT25DbGlja1VwbG9hZCA9IHRoaXMuaGFuZGxlT25DbGlja1VwbG9hZC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlVXBsb2FkRmlsZSA9IHRoaXMuaGFuZGxlVXBsb2FkRmlsZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlT25EZWxldGVGaWxlID0gdGhpcy5oYW5kbGVPbkRlbGV0ZUZpbGUuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmhhbmRsZU9uU2V0Q3JlYXRlRm9sZGVyID0gdGhpcy5oYW5kbGVPblNldENyZWF0ZUZvbGRlci5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlT25DbGlja0NyZWF0ZUZvbGRlciA9IHRoaXMuaGFuZGxlT25DbGlja0NyZWF0ZUZvbGRlci5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlT25Mb2dvdXQgPSB0aGlzLmhhbmRsZU9uTG9nb3V0LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5pc1NlbGVjdGVkID0gdGhpcy5pc1NlbGVjdGVkLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlT25DbGlja1VwbG9hZCgpIHtcclxuICAgICAgICB0aGlzLmZpbGVVcGxvYWQuY3VycmVudC5jbGljaygpXHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlVXBsb2FkRmlsZShldmVudCkge1xyXG4gICAgICAgIGxldCBmaWxlcyA9IGV2ZW50LnRhcmdldC5maWxlcztcclxuICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBjb25zdCBtYXhfZmlsZV9zaXplID0gIDUgKiAxMDI0ICogMTAwMFxyXG4gICAgICAgICAgICBsZXQgZmlsZSA9IGZpbGVzWzBdO1xyXG4gICAgICAgICAgICBpZiAoZmlsZS5maWxlbmFtZSA9PT0gXCJcIikge1xyXG4gICAgICAgICAgICAgICAgYWxlcnQoXCJGaWxlbmFtZSBjYW5ub3QgYmUgZW1wdHlcIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlsZS5zaXplID4gbWF4X2ZpbGVfc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgYWxlcnQoXCJGaWxlIHNpemUgaXMgdG9vIGxhcmdlIVwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGEgPSBuZXcgRm9ybURhdGEoKVxyXG4gICAgICAgICAgICBkYXRhLmFwcGVuZChcImZpbGVcIiwgZmlsZXNbMF0pO1xyXG4gICAgICAgICAgICBkYXRhLmFwcGVuZChcInBhcmVudElkXCIsIHRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlSW5mby5maWxlSWQpXHJcbiAgICAgICAgICAgIGF4aW9zLnBvc3QoXCIvYXBpL2ZpbGVzXCIsIGRhdGEsIHtcclxuICAgICAgICAgICAgICAgIG9uVXBsb2FkUHJvZ3Jlc3M6IChwcm9ncmVzcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB1cGxvYWRQcm9ncmVzcyA9IHByb2dyZXNzLmxvYWRlZCAvIHByb2dyZXNzLnRvdGFsICogMTAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3VwbG9hZFByb2dyZXNzOiB1cGxvYWRQcm9ncmVzc30pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWRhdGEuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiRmFpbGVkIHRvIHVwbG9hZCBGaWxlOiBcIiArIHJlc3BvbnNlLm1zZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZU9uRGVsZXRlRmlsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVJbmZvLmZpbGVJZCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgZmlsZV9pZDogdGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVJbmZvLmZpbGVJZFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBpL2ZpbGVzXCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJERUxFVEVcIixcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkZWxldGVJbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUlkOiBkYXRhLmZpbGVfaWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgRmlsZU1hbmFnZW1lbnRQYWdlLmRlbGV0ZWRGaWxlSW5mb3MucHVzaChkZWxldGVJbmZvKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGVsZXRlRmlsZUluZm8gOiB0aGlzLnN0YXRlLnNlbGVjdGVkRmlsZUluZm99KTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydChcIkZhaWxlZCB0byBkZWxldGUgZmlsZVxcXCJcIiArIHRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlSW5mby5maWxlTmFtZSArIFwiXFxcIlwiKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlT25TZXRDcmVhdGVGb2xkZXIoZG9DcmVhdGVGb2xkZXIpIHtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKHtjcmVhdGVGb2xkZXIgOiBkb0NyZWF0ZUZvbGRlcn0pXHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlT25DbGlja0NyZWF0ZUZvbGRlcigpIHtcclxuICAgICAgICB0aGlzLmhhbmRsZU9uU2V0Q3JlYXRlRm9sZGVyKHRydWUpXHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlT25TZWxlY3RGaWxlKGZpbGVJbmZvKSB7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRGaWxlSW5mbzogZmlsZUluZm99KTtcclxuICAgIH1cclxuXHJcbiAgICBpc1NlbGVjdGVkKGZpbGVJZCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnNlbGVjdGVkRmlsZUluZm8gJiYgdGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVJbmZvLmZpbGVJZCA9PT0gZmlsZUlkXHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlT25Mb2dvdXQoKSB7XHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBcIi9hcGkvbG9nb3V0XCIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGVydChcIlN1Y2Nlc3NmdWxseSBMb2dnZWQgb3V0IVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmhhbmRsZUxvZ291dFJlZGlyZWN0KClcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoXCJGYWlsZWQgdG8gbG9nb3V0IGZvciB1c2VyIFxcXCJcIiArIHRoaXMuc3RhdGUudXNlcm5hbWUgKyBcIlxcXCJcIilcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgcmVuZGVyKCkge1xyXG4gICAgICAgIHRoaXMuaGFuZGxlT25TZWxlY3RGaWxlID0gdGhpcy5oYW5kbGVPblNlbGVjdEZpbGUuYmluZCh0aGlzKTtcclxuICAgICAgICBsZXQgaXNBbnlGaWxlU2VsZWN0ZWQgPSB0aGlzLnN0YXRlLnNlbGVjdGVkRmlsZUluZm8gJiYgdGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVJbmZvLmZpbGVJZCA+IDA7XHJcbiAgICAgICAgbGV0IGRpc3BsYXlJZkZpbGVTZWxlY3RlZCA9IGlzQW55RmlsZVNlbGVjdGVkICYmICF0aGlzLnN0YXRlLnNlbGVjdGVkRmlsZUluZm8uaXNGb2xkZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJcIiA6IFwibm9uZVwiO1xyXG4gICAgICAgIGxldCBkaXNwbGF5Rm9sZGVyT25seUJ1dHRvbnMgPSAgaXNBbnlGaWxlU2VsZWN0ZWQgJiYgdGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVJbmZvLmlzRm9sZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJcIiA6IFwibm9uZVwiO1xyXG4gICAgICAgIGxldCBkaXNwbGF5SWZGaWxlSXNOb3RSb290ID0gaXNBbnlGaWxlU2VsZWN0ZWQgJiYgIXRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlSW5mby5pc1Jvb3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJcIiA6IFwibm9uZVwiO1xyXG5cclxuICAgICAgICBsZXQgZmlsZVRyZWUgPSBbXTtcclxuICAgICAgICBpZiAodGhpcy5wcm9wcy5pc0xvZ2dlZEluKSB7XHJcbiAgICAgICAgICAgIGZpbGVUcmVlLnB1c2goXHJcbiAgICAgICAgICAgICAgICA8RmlsZVxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVJZD17LTF9XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWU9e1wiXCJ9XHJcbiAgICAgICAgICAgICAgICAgICAgaXNGb2xkZXI9e3RydWV9XHJcbiAgICAgICAgICAgICAgICAgICAgaXNFeHBhbmRlZD17ZmFsc2V9XHJcbiAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZD17dGhpcy5pc1NlbGVjdGVkfVxyXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUZvbGRlcj17dGhpcy5zdGF0ZS5jcmVhdGVGb2xkZXJ9XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlT25TZWxlY3RGaWxlPXt0aGlzLmhhbmRsZU9uU2VsZWN0RmlsZS5iaW5kKHRoaXMpfVxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZU9uU2V0Q3JlYXRlRm9sZGVyPXt0aGlzLmhhbmRsZU9uU2V0Q3JlYXRlRm9sZGVyLmJpbmQodGhpcyl9Lz4pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBpZD1cImRpdlRvcEJhclwiIGNsYXNzTmFtZT1cInRvcEJhclwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJidG5VcGxvYWRGaWxlXCIgY2xhc3NOYW1lPVwiYnRuVG9wQmFyXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7ZGlzcGxheTogZGlzcGxheUZvbGRlck9ubHlCdXR0b25zfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlT25DbGlja1VwbG9hZH0+VXBsb2FkIEZpbGU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiYnRuRGVsZXRlRmlsZVwiIGNsYXNzTmFtZT1cImJ0blRvcEJhclwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e2Rpc3BsYXk6IGRpc3BsYXlJZkZpbGVJc05vdFJvb3QgfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlT25EZWxldGVGaWxlfT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aXNBbnlGaWxlU2VsZWN0ZWQgJiYgdGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVJbmZvLmlzRm9sZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJEZWxldGUgRm9sZGVyXCIgOiBcIkRlbGV0ZSBGaWxlXCJ9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImJ0bkNyZWF0ZUZvbGRlclwiIGNsYXNzTmFtZT1cImJ0blRvcEJhclwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e2Rpc3BsYXk6IGRpc3BsYXlGb2xkZXJPbmx5QnV0dG9uc319XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZU9uQ2xpY2tDcmVhdGVGb2xkZXJ9PkNyZWF0ZSBGb2xkZXI8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJmb3JtRG93bmxvYWRcIiBhY3Rpb249e1wiL2FwaS9kb3dubG9hZFwifSAgbWV0aG9kPVwiUE9TVFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwiZmlsZV9pZFwiIHN0eWxlPXt7ZGlzcGxheTogXCJub25lXCJ9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlSW5mbyA/IHRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlSW5mby5maWxlSWQgOiAtMX0vPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImJ0bkRvd25sb2FkRmlsZVwiIGNsYXNzTmFtZT1cImJ0blRvcEJhclwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e2Rpc3BsYXk6IGRpc3BsYXlJZkZpbGVTZWxlY3RlZH19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwic3VibWl0XCI+RG93bmxvYWQgRmlsZTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZm9ybT5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiYnRuTG9nb3V0XCIgY2xhc3NOYW1lPVwiYnRuVG9wQmFyXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlT25Mb2dvdXR9PkxvZ291dDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGlkPVwiZGl2RmlsZVRyZWVDb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICB7ZmlsZVRyZWV9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cImZpbGVVcGxvYWRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5maWxlVXBsb2FkfVxyXG4gICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJmaWxlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e2Rpc3BsYXk6XCJub25lXCJ9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLmhhbmRsZVVwbG9hZEZpbGV9Lz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKVxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBGaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICAgICAgc3VwZXIocHJvcHMpO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XHJcbiAgICAgICAgICAgIGZpbGVJZDogdGhpcy5wcm9wcy5maWxlSWQsXHJcbiAgICAgICAgICAgIGZpbGVOYW1lOiB0aGlzLnByb3BzLmZpbGVOYW1lLFxyXG4gICAgICAgICAgICBpc1Jvb3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICBpc0V4cGFuZGVkOiB0aGlzLnByb3BzLmlzRXhwYW5kZWQsXHJcbiAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBjcmVhdGluZ0ZvbGRlcjogZmFsc2UsXHJcbiAgICAgICAgICAgIHNob3VsZFVwZGF0ZUNoaWxkcmVuOiBmYWxzZSxcclxuICAgICAgICAgICAgY2hpbGRyZW5GaWxlczogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmdldEZpbGVzID0gdGhpcy5nZXRGaWxlcy5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyQ2hpbGRGaWxlID0gdGhpcy5yZW5kZXJDaGlsZEZpbGUuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUNoaWxkcmVuID0gdGhpcy51cGRhdGVDaGlsZHJlbi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlT25DbGlja0ZpbGUgPSB0aGlzLmhhbmRsZU9uQ2xpY2tGaWxlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVPbkJsdXIgPSB0aGlzLmhhbmRsZU9uQmx1ci5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5maWxlSWQgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICB0aGlzLmdldEZpbGVzKHRoaXMuc3RhdGUuZmlsZUlkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RmlsZXMocGFyZW50SWQpIHtcclxuICAgICAgICAgbGV0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgICBwYXJlbnRJZCA6IHBhcmVudElkXHJcbiAgICAgICAgIH07XHJcbiAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICB1cmw6IFwiL2FwaS9maWxlc1wiLFxyXG4gICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcclxuICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICBsZXQgZmlsZXMgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50SWQgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUlkOiBmaWxlc1swXS5maWxlX2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWU6IGZpbGVzWzBdLmZpbGVfbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUm9vdDogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmNoaWxkcmVuRmlsZXMubGVuZ3RoICE9PSBmaWxlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkcmVuRmlsZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzLmZvckVhY2goKGNoaWxkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5GaWxlcy5wdXNoKHRoaXMucmVuZGVyQ2hpbGRGaWxlKGNoaWxkKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2NoaWxkcmVuRmlsZXM6IGNoaWxkcmVuRmlsZXN9KTtcclxuICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiRmFpbGVkIHRvIGdldCBmaWxlcyEgUGxlYXNlIHJlLWxvZ2luIGFuZCB0cnkgYWdhaW5cIik7XHJcbiAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVPbkNsaWNrRmlsZShldmVudCkge1xyXG4gICAgICAgIGxldCBzaG91bGRFeHBhbmQgPSAhdGhpcy5zdGF0ZS5pc0V4cGFuZGVkO1xyXG4gICAgICAgIGlmIChzaG91bGRFeHBhbmQgJiYgdGhpcy5wcm9wcy5pc0ZvbGRlciAmJiB0aGlzLnN0YXRlLmNoaWxkcmVuRmlsZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RmlsZXModGhpcy5zdGF0ZS5maWxlSWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgIGxldCBmaWxlSW5mbyA9IHtcclxuICAgICAgICAgICAgZmlsZUlkOiB0aGlzLnN0YXRlLmZpbGVJZCxcclxuICAgICAgICAgICAgaXNGb2xkZXI6IHRoaXMucHJvcHMuaXNGb2xkZXIsXHJcbiAgICAgICAgICAgIGlzUm9vdDogdGhpcy5zdGF0ZS5pc1Jvb3RcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnByb3BzLmhhbmRsZU9uU2VsZWN0RmlsZShmaWxlSW5mbyk7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgIGlzRXhwYW5kZWQ6IHNob3VsZEV4cGFuZCxcclxuICAgICAgICAgICAgaXNTZWxlY3RlZDogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZU9uQmx1cihldmVudCkge1xyXG4gICAgICAgIGxldCBuZXdfZmlsZV9uYW1lID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgIGlmIChuZXdfZmlsZV9uYW1lID09PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KFwiRmlsZSBuYW1lIGNhbm5vdCBiZSBlbXB0eSFcIik7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgIGZpbGVfaWQgOiB0aGlzLnN0YXRlLmZpbGVJZCxcclxuICAgICAgICAgICAgbmV3X2ZpbGVfbmFtZSA6IG5ld19maWxlX25hbWVcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChuZXdfZmlsZV9uYW1lICE9PSB0aGlzLnN0YXRlLmZpbGVOYW1lKSB7XHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS9maWxlc1wiLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJQVVRcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtmaWxlTmFtZSA6IG5ld19maWxlX25hbWV9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiRmFpbGVkIHRvIHVwZGF0ZSBmaWxlIG5hbWUhXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNTZWxlY3RlZCA6IGZhbHNlfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlQ3JlYXRlRm9sZGVyKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmNyZWF0ZUZvbGRlciAmJiAhdGhpcy5zdGF0ZS5jcmVhdGluZ0ZvbGRlciAmJiB0aGlzLnN0YXRlLmlzU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5jcmVhdGluZ0ZvbGRlciA9IHRydWU7XHJcbiAgICAgICAgICAgIGxldCBuZXdfZm9sZGVyX2RhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBmaWxlX25hbWU6IFwiTmV3IEZvbGRlclwiLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50X2lkOiB0aGlzLnN0YXRlLmZpbGVJZFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS9mb2xkZXJzXCIsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5ld19mb2xkZXJfZGF0YSxcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzICYmIHJlc3BvbnNlLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZvbGRlciA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuY2hpbGRyZW5GaWxlcy5wdXNoKHRoaXMucmVuZGVyQ2hpbGRGaWxlKGZvbGRlcikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjaGlsZHJlbkZpbGVzIDogdGhpcy5zdGF0ZS5jaGlsZHJlbkZpbGVzfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQoXCJGYWlsZWQgdG8gY3JlYXRlIG5ldyBmb2xkZXIhXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuY3JlYXRpbmdGb2xkZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMucHJvcHMuaGFuZGxlT25TZXRDcmVhdGVGb2xkZXIoZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVDaGlsZHJlbigpIHtcclxuICAgICAgICBsZXQgY2hpbGRyZW5GaWxlcyA9IHRoaXMuc3RhdGUuY2hpbGRyZW5GaWxlcztcclxuICAgICAgICB0aGlzLnN0YXRlLmNoaWxkcmVuRmlsZXMgPSBbXTtcclxuICAgICAgICBjaGlsZHJlbkZpbGVzLmZvckVhY2goKGNoaWxkKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuY2hpbGRyZW5GaWxlcy5wdXNoKHRoaXMucmVuZGVyQ2hpbGRGaWxlKGNoaWxkKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZS5zaG91bGRVcGRhdGVDaGlsZHJlbiA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlckNoaWxkRmlsZShjaGlsZCkge1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIDxGaWxlXHJcbiAgICAgICAgICAgICAgICAgZmlsZUlkPXtjaGlsZC5maWxlX2lkIHx8IGNoaWxkLnByb3BzICYmIGNoaWxkLnByb3BzLmZpbGVJZH1cclxuICAgICAgICAgICAgICAgICBmaWxlTmFtZT17Y2hpbGQuZmlsZV9uYW1lIHx8IGNoaWxkLnByb3BzICYmIGNoaWxkLnByb3BzLmZpbGVOYW1lfVxyXG4gICAgICAgICAgICAgICAgIGlzRm9sZGVyPXtjaGlsZC5pc19mb2xkZXIgfHwgY2hpbGQucHJvcHMgJiYgY2hpbGQucHJvcHMuaXNGb2xkZXJ9XHJcbiAgICAgICAgICAgICAgICAgaXNFeHBhbmRlZD17dGhpcy5zdGF0ZS5pc0V4cGFuZGVkfVxyXG4gICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ9e3RoaXMuc3RhdGUuaXNTZWxlY3RlZH1cclxuICAgICAgICAgICAgICAgICBjcmVhdGVGb2xkZXI9e3RoaXMucHJvcHMuY3JlYXRlRm9sZGVyfVxyXG4gICAgICAgICAgICAgICAgIGhhbmRsZU9uU2VsZWN0RmlsZT17dGhpcy5wcm9wcy5oYW5kbGVPblNlbGVjdEZpbGV9XHJcbiAgICAgICAgICAgICAgICAgaGFuZGxlT25TZXRDcmVhdGVGb2xkZXI9e3RoaXMucHJvcHMuaGFuZGxlT25TZXRDcmVhdGVGb2xkZXJ9Lz5cclxuICAgICAgICAgKVxyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlcigpIHtcclxuICAgICAgICAvLyB0aGlzLnN0YXRlLmlzU2VsZWN0ZWQgPSB0aGlzLnByb3BzLmlzU2VsZWN0ZWQodGhpcy5zdGF0ZS5maWxlSWQpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyQ2hpbGRGaWxlID0gdGhpcy5yZW5kZXJDaGlsZEZpbGUuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUNoaWxkcmVuID0gdGhpcy51cGRhdGVDaGlsZHJlbi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlQ2hpbGRyZW4oKTtcclxuXHJcbiAgICAgICAgdGhpcy5oYW5kbGVDcmVhdGVGb2xkZXIgPSB0aGlzLmhhbmRsZUNyZWF0ZUZvbGRlci5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUNyZWF0ZUZvbGRlcigpO1xyXG5cclxuICAgICAgICBsZXQgZmlsZU5vZGVDbGFzcyA9IFwiZmlsZU5vZGVcIjtcclxuICAgICAgICBmaWxlTm9kZUNsYXNzICs9IHRoaXMuc3RhdGUuaXNTZWxlY3RlZCA/IFwiIHNlbGVjdGVkXCIgOiBcIlwiO1xyXG4gICAgICAgIGxldCBjaGlsZHJlbkZpbGVOb2RlcyA9IHRoaXMuc3RhdGUuaXNFeHBhbmRlZCA/IHRoaXMuc3RhdGUuY2hpbGRyZW5GaWxlcyA6IFtdO1xyXG4gICAgICAgIGxldCBpY29uID0gdGhpcy5wcm9wcy5pc0ZvbGRlciA/IFwiZmEgZmEtZm9sZGVyXCIgOiBcImZhIGZhLWZpbGVcIjtcclxuXHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaWxlTm9kZUNvbnRhaW5lciBcIiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogRmlsZU1hbmFnZW1lbnRQYWdlLmRlbGV0ZWRGaWxlSW5mb3NcclxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGQgPT4gZC5maWxlSWQgPT09IHRoaXMuc3RhdGUuZmlsZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC5sZW5ndGggPiAwID8gXCJub25lXCIgOiBcIlwiXHJcbiAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGkgY2xhc3NOYW1lPXtpY29ufS8+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3NOYW1lPXtmaWxlTm9kZUNsYXNzfVxyXG4gICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU9e3RoaXMuc3RhdGUuZmlsZU5hbWV9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVPbkNsaWNrRmlsZX1cclxuICAgICAgICAgICAgICAgICAgICAgICBvbkJsdXI9e3RoaXMuaGFuZGxlT25CbHVyfT5cclxuICAgICAgICAgICAgICAgIDwvaW5wdXQ+XHJcbiAgICAgICAgICAgICAgICB7Y2hpbGRyZW5GaWxlTm9kZXN9XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIClcclxuICAgIH1cclxufVxyXG5cclxuUmVhY3RET00ucmVuZGVyKFxyXG4gICAgPEluZGV4UGFnZS8+LFxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb290XCIpXHJcbik7XHJcblxyXG4vLyAuXFxiYWJlbCAuLlxcLi5cXCAtLW91dC1maWxlIC5cclxuLy8gLlxcLi5cXHRlc3QuanMgLS1wcmVzZXRzPUBiYWJlbC9wcmVzZXQtcmVhY3QiXX0=