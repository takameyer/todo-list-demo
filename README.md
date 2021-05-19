# React Native Demo TodoList App

This is a React Native demo todo list app that synchronizes its data with a node server.  It is written in typescript.

# Installation, Running, and Testing

## System Requirements

1. I assume you have a development machine that is up to date and can build and run React Native app for both iOS and Android flawlessly. [Setup React Native](https://reactnative.dev/docs/environment-setup)

2. I am also assuming the user is using a \*nix based maching (MacOS/Linux). It is possible the synchronization server has issues storing and retrieving data in a windows based environment. Also there are two bash scripts that will obviously not work in Windows.

3. I am assuming you have yarn installed. If not, please [install yarn](https://classic.yarnpkg.com/en/docs/install)

4. Please also make sure you are using a stable version of node 14. [Setup nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Install App Dependencies

Use yarn to install the app dependencies

`$ yarn`

You will be asked to provide the url of the sync server. Just provide a url with your ipaddress and the port of the sync server (3000).  
For example:

`http://192.168.0.1:3000`

This will allow the locally running apps to communicate with the sync server. If it is not working, or you have made a mistake, use the following command to set it up again:

`$ yarn setupEnv`

The results are written to the '.env' file

### Start Synchronization Server

NOTE: please make sure there are no other processes running on port 3000

`$ yarn startServer`

### Install iOS

`$ yarn ios`

### Install Android

`$ yarn android`

### Start React Native Bundler

NOTE: please make sure there are no other processes running on port 8081

`$ yarn start`

### Run Tests

`$ yarn test`
