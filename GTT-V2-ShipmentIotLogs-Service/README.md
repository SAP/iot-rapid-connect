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
#### Payload Structure
- The following example payload is logged in the PostgreSQL database instance.
- `shipmentNo` and `reportedAt` are required fields.
``` json
{
    "shipmentNo":"9678292607",
    "reportedAt":"2022-12-06T18:06:12.075Z",
    "timezone": "London",
    "priority": 3,
    "reportedBy":"MO001",
    "eventDetails":
        {
            "Key":"Temperature Exceeded",
            "Value":"500",
            "Timestamp":""
        }
}
```
#### Authentication for API call
The application uses the `passport` `@sap/xsenv` and `@sap/xssec` packages to provide client credential authentication via a JSON web token (JWT) strategy, verifying the token against the bound UAA service instance.
``` js
import passport from 'passport';
import { JWTStrategy } from '@sap/xssec';
import xsenv from '@sap/xsenv';

passport.use(new JWTStrategy(xsenv.getServices({ xsuaa: { tag: 'xsuaa' } }).xsuaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));
```
### Test
Using Postman, send a http request to the following endpoints:
- `"application-url"/api/v1/iot/shipment/events` POST - Send an event payload to the microservice
- `"application-url"/api/v1/iot/shipment/events` GET - returns a list of events logged by the microservice
- `"application-url"/api/v1/iot/shipment/:shipmentNo/events/:reportedAt` GET - returns event log by id
- `"application-url"/api/v1/iot/shipment/:shipmentNo/events/:reportedAt/processFlow` GET - returns process flow details by id
