# Setup

1. Clone this project
2. Install Python 3.7: https://www.python.org/downloads/release/python-372/
3. Open terminal/command line and navigate to the folder containing requirements.txt
4. Run `pip install -r requirements.txt`
5. Change directory into the "server": `cd server`
6. Run `python router.py` to start the server
7. Open browser and navigate to `http://127.0.0.1:5000/` or to the URL given by the console

# Using the site
## Create an account
1. Type in a username and password
2. Click on the "Create Account" button 
3. If a success prompt shows up, the account is created and you can now login!
## Basic Usage

1. Login using an account you created.
2. In the top right corner, you will see a Logout button. Clicking it will log you out and redirect to the login page.
3. After logging into the account, the first folder displayed is the main folder. All uploaded files and new folders will be descendants of this folder.
    - All items are stored in a tree hierarchy.
     - Clicking a folder expands it and display its contents
     - Clicking an expanded folder contracts it and hides all its contents
4. All files and folders can be renamed anytime. Select the textbox of the item to be renamed and enter the modified name. Click outside the text box to save the changes.
5. Folder Options -
   When a folder is clicked, the following options will appear in the top bar : 
   - Upload File (button)
        - Click this to upload a file to the selected folder . A window will prompt after the button is clicked and you can choose a file to upload. (**Max size = 5MB**) (See note)
        
   - Create Folder (button)
        - Click this to create a folder under the selected folder. (See note)
        
   - Delete Folder (button)
        - Click this to delete a folder. The selected folder and all items within it will be deleted. All folders except the root folder can be deleted.

6. File Options - When a file is clicked, the following options will appear in the top bar ：
    - Delete File
        - Click this to delete a file. The file will be deleted in the server.
    
    - Download File
       - Click this to download a file. The file will be downloaded in the same format as the extension specified in its name.

    
** Note: To view the file/folder you uploaded or created, **Double Click** the folder you uploaded it to in order to refresh the folder. The item may take more time to be displayed if the file is large.