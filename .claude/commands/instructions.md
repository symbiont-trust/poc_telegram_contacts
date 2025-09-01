# Instructions

I want to create a proof of concept typescript app using OAuth2 to retrieve a user's contact details from Telegram and display them on a page.  I want the poc to support Telegram's 2FA but for it to be optional.  i.e it needs to support both Telegram users who use 2FA and those users who do not.

For the technology stack, I want to use vite and react.

I want there to be a material button from mui.com which on clicking triggers the OAuth2 process and retrieves the contacts and displays them on the page.

I do NOT want you to create a git branch or commit the files but I do want you to come up with a plan and then give me the option to authorise you to generate the code.

I want you to generate the plan to:

<project-dir>/.claude/commands/steps.md

Basically the steps.md is in the same directory as this instructions.md file and in steps.md you will specify all the steps to create this proof of concept app.  I will then later use claude to generate the code from steps.md.

I have included the following shell scripts.  I suggest that you start the scripts yourself instead of me, so you can monitor whether the typescript is compiling without me telling you what the issues are.

The scripts you can copy to the root of the project and use are under the directory:

<project-dir>/sample_code/shell_scripts

Note these scripts make use of both nvm and npm which are already installed. The scripts are using v22.18.0 of node and it is already installed.

Note that steps.md should include all the information in this instructions.md in better refined steps.

Note that I want the react projects contents to be immediately under the project directory and not under a sub folder.  This means the commands for creating the vite project need to be the correct ones and take take the desired directory structure into account.  This itself should be part of the generated steps.md file.

Basically the generated steps.md should be an inproved version of instructions.md.

In order to better understand how to retrieve contacts from Telegram you will need to do some research.  Make sure that you are not looking at deprecated old cold examples and are instead using the latest Telegram APIs.  The generated steps.md file should explain how the Telegram code should look like.  i.e. it should have code examples in steps.md.  This will help us when I later use the generated steps.md file to generate the code.

