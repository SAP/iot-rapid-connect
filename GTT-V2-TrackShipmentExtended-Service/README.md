# GTT-V2-TrackShipmentExtended-Service

This application provides CRUD services to manage extended fields. It enables extending Track shipment application with custom fields.
The application is based on the Express Node.js web application framework using Typescript. It is deployed on an SAP BTP Cloud Foundry environment and uses PostgreSQL as a database.

![](../Assets/BN4L_IOT_TS_Ser.png)

### How to deploy
#### Create Services
In SAP BTP Cockpit, create instances of required services: UAA and PostgreSQL.

#### Install packages
Run `npm install` to install required application packages.
#### Deploy to Cloud Foundry
Login to your subaccount's Cloud Foundry dev space via cf cli.
Run `npm run-script build` followed by `cf push` to deploy to subaccount.
#### Bind Services
Bind created services to track-shipment-extended application either via cf cli or on SAP BTP Cockpit.

#### Configure Database
For PostgreSQL, SSH into instance from using Cloud Foundry CLI and psql.
`cf enable-ssh track-shipment-extended`
`cf ssh -L 63306:"Hostname":"Port" track-shipment-extended`
`psql -d "Database" -U "User" -p 63306 -h localhost`

Then, run CREATE script for required table.

``` sql
CREATE TABLE IF NOT EXISTS public.custom_fields(shipment_no character varying(100) NOT NULL,iot_device_identifier character varying(50),name_of_goods character varying(50),export_company character varying(50),customer_code character varying(50),smart_shipment_id character varying(50),value_of_goods character varying(50),import_company character varying(50),customer_address character varying(50),shipping_company character varying(50),value_of_goods_currency character varying(50),customer_profile character varying(50),customer_id character varying(50),CONSTRAINT custom_fields_pkey PRIMARY KEY (shipment_no));
```
The above fields are only exemplary. If you wish you can replace these or add new fields as required.

### Extended Fields API specification
#### Payload Structure
- The following example payload is logged in the PostgreSQL database instance.
- `shipmentNo` is a required field.
``` json
{
    "shipmentNo": "9678292607",
    "iotDeviceIdentifier": "MO001", 
    "nameOfGoods": "MOS", 
    "exportCompany": "Company A", 
    "customerCode": "1932", 
    "smartShipmentId": "0243296", 
    "valueOfGoods": "1000,000", 
    "importCompany": "Company B", 
    "customerAddress": "**City, **Street, NO.1", 
    "shippingCompany": "MAERSK", 
    "valueOfGoodsCurrency": "EUR", 
    "customerProfile": "C02", 
    "customerId": "349034293"
}
```
#### Authentication for API call
The application uses Oauth 2.0 Bearer Tokens to authenticate API calls. The token is verified against the bound UAA service instance using the `passport` `@sap/xsenv` and `@sap/xssec` packages on a JWT strategy.

In order to get a token to make the API call: 
1. Fetch the environment variables of the microservice using `cf env track-shipment-extended` or from the application overview on SAP BTP Cockpit.
2. Extract the token authentication URL, client ID and client secret as shown below.
3. Append `/oauth/token?grant_type=client_credentials&response_type=token` to the authentication URL.
4. Add the URL and client credentials as Oauth 2.0 Bearer authentication on http requests to the API.
   
![](../Assets/auth.png)
### Test
Using Postman, send a http request to the following endpoints:
- `"application-url"/api/v1/iot/shipment/customFields` POST - Send a payload to the application that defines the required custom fields
- `"application-url"/api/v1/iot/shipment/:shipmentNo/customFields` GET - returns the custom fields and their values for shipment id
- `"application-url"/api/v1/iot/shipment/:shipmentNo/customFields` PUT - updates the custom fields and their values for shipment id
- `"application-url"/api/v1/iot/shipment/:shipmentNo/customFields` DELETE - deletes the custom fields and their values for shipment id
