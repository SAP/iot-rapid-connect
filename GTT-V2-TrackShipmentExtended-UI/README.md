# GTT-V2-Sample-TrackShipments-UI

sample app - track shipments UI

![](../Assets/BN4L_IOT_TS_UI.png)

## Pre-requisites

- Node.js - https://nodejs.org/

### Node.js

Make sure the Node.js is installed succesfully.

```sh
$ node -v
$ npm -v
```

## Run

### SAPUI5 Application

Run web application in a local web server.

```sh
cd ui
npm start
```

Run unit test in a local browser
```sh
cd ui
npm run test:debug
```

You can visit http://localhost:5000/test/flpSandboxMockServer.html in the browser.

## Deploy

```sh
cf login -a {API Endponit} -u {Email address} --sso
Open the link {API Endponit/password} and get passcode.
cd GTT-V2-TrackShipmetExtended-UI
mbt build
cf deploy mta_archives/gtt-v2-ui-iot-track-shipments_2.4.0.mtar
```
### Pre-requisites

Change the TENANT_NAME in ui/.env file
