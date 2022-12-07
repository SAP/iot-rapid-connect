# GTT-V2-ShipmentIotLogs-Service

This application exposes the event endpoint to pass IoT event payload and also serves as a log application to trace the message processing through to BN4L.
The application is based on the Express Node.js web application framework using Typescript. It is deployed on an SAP BTP Cloud Foundry environment and uses PostgreSQL as a database.

![](../Assets/BN4L_IOT_Logs_Ser.png)

### How to deploy
#### Create Services
In subaccount, create instances of required services: UAA, Destination Service, PostgreSQL.


#### Configure Destination
Create LBN destination in the Destination Service. Define the destination's name in event.controller.ts
#### Install packages
Run `npm install` to install required application packages.
#### Deploy to Cloud Foundry
Login to subaccount via cf cli.
Run `npm run-script build` followed by `cf push` to deploy to subaccount.
#### Bind Services
Bind created services to IoT-logs application either via cf cli or on subaccount.
#### Configure Database
For PostgreSQL, SSH into instance from using Cloud Foundry CLI and psql.
`cf ssh -L 63306:"Hostname":"Port" "App-Name"`
`psql -d "Database" -U "User" -p 63306 -h localhost`

Then, run create scripts for required tables.

``` sql
CREATE TABLE IF NOT EXISTS public.events_log(shipment_no character varying(100),reported_at character varying(30),event_body json,lbn_status character varying(30),updated_at timestamp with time zone,CONSTRAINT events_log_pkey PRIMARY KEY (shipment_no, reported_at));
```
``` sql
CREATE TABLE IF NOT EXISTS public.lbn_response(shipment_no character varying(100),reported_at timestamp with time zone,response_at timestamp with time zone,error_body character varying(100),status character varying(30),CONSTRAINT lbn_response_pkey PRIMARY KEY (shipment_no, reported_at));
```
### Event API specification

#### Host URL and path
The host or application url can be found by accessing the application ```IoT-LBN-microservice``` using the command ```cf a ``` in the BTP environment.
Append the path `/api/v1/iot/shipment/events` and use the method POST to call the API with the payload defined below.

#### Payload specification

| Field | Description |
| --- | --- |
| shipmentNo | Shipment no to track. This has to be BN4L-GTT understandable shipment no |
| reportedAt | Time at which the event is reported to GTT |
| timezone | Timezone of reporting entity/system |
| priority | Priority that identifies criticality of the event |
| reportedBy | reporter's identification. Could be system ID or if manual readings taken, the ID/name of the person |
| eventDetails | This section captures the IOT event details |
| eventDetails-Key | Parameter that has exceeded threshold |
| eventDetails-Value | Value of the parameter |
| eventDetails-Timestamp | Timestamp of the reading |

#### Payload Structure
- The following example payload is logged in the PostgreSQL database instance.
- `shipmentNo` and `reportedAt` are required fields.
``` json
{
    "shipmentNo":"9678292607",
    "reportedAt":"2022-12-06T18:06:12.075Z",
    "timezone": "Australia/Brisbane",
    "priority": 3,
    "reportedBy":"MO001",
    "eventDetails": [
        {
            "Key":"Temperature",
            "Value":"500",
            "Timestamp":"2022-12-06T18:06:12.075Z"
        },
        {
            "Key":"Vibration",
            "Value":"300",
            "Timestamp":"2022-12-06T18:06:12.075Z"
        }
      ]
}
```
#### Authentication for API call
The application uses the `passport` `@sap/xsenv` and `@sap/xssec` packages to provide client credential authentication via a JSON web token (JWT) strategy, verifying the token against the bound UAA service instance.

The application uses Oauth 2.0 to authenticate API calls.
In order to get the Token to make the API call, fetch the credentials from the environment variables of the microservice as:

`cf env IoT-LBN-microservice`

Extract the token URL, client ID and client secret as below.

![](../Assets/auth.png)

### Test
Using Postman, send a http request to the following endpoints:
- `"application-url"/api/v1/iot/shipment/events` POST - Send an event payload to the microservice
- `"application-url"/api/v1/iot/shipment/events` GET - returns a list of events logged by the microservice
- `"application-url"/api/v1/iot/shipment/:shipmentNo/events/:reportedAt` GET - returns event log by id
- `"application-url"/api/v1/iot/shipment/:shipmentNo/events/:reportedAt/processFlow` GET - returns process flow details by id
