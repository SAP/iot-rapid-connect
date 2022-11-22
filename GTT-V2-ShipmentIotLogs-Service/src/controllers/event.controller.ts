import axios, { AxiosError } from 'axios';
import express, { response } from 'express';

import DestinationConfig from '../utils/destination.config.js';
import RequestConfig from '../utils/request.config.js';
import Logger from '../utils/logger.config.js';
import db from '../db/db.config.js';

class EventController {

    async eventLog(req: express.Request, res: express.Response, next) {
        const eventBody = req.body;
        const shipmentNo = req.body.shipmentNo;
        const reportedAt = req.body.reportedAt;

        // insert log into db
        await db.none('INSERT INTO events_log(shipment_no, reported_at, event_body, lbn_status) VALUES($(shipment_no), $(reported_at), $(event_body), $(lbn_status))', {
            shipment_no: shipmentNo,
            reported_at: reportedAt,
            event_body: eventBody,
            lbn_status: "In Process",
        }).catch((error) => {
            Logger.error(`while logging event: ${error}`);
            res.status(400).send(`Error logging event: ${error}`);
        })

        next();
    }

    async lbnRequest(req: express.Request, res: express.Response) {
        const oDestination = await DestinationConfig("LBN_Access");
        const request = new RequestConfig(oDestination?.data);
        const auth = request.headers.Authorization;

        const eventBody = req.body;
        const shipmentNo = req.body.shipmentNo;
        const reportedAt = req.body.reportedAt;

        let lbnFormat = {
            "eventReasonText": "",
            "eventReasonCode": "",
            "senderPartyId": "",
            "reportedBy": "",
            "altKey": "xri://sap.com/id:LBN#10010003536:QW9:SHIPMENT_ORDER:9678292607",
            "locationAltKey": "",
            "eventMatchKey": "",
            "priority": 0,
            "references": [
                {
                    "referenceType_code": "TRACKING",
                    "altKey": "",
                    "validFrom": "",
                    "validTo": "",
                    "action_code": "ADD"
                }
            ],
            "estimatedTimestamps": [
                {
                    "eventType": "",
                    "locationAltKey": "",
                    "eventMatchKey": "",
                    "estimatedTimestamp": "",
                    "additionalMatchKey": ""
                }
            ],
            "actualTechnicalTimestamp": "",
            "actualBusinessTimestamp": "",
            "actualBusinessTimeZone": "",
            "longitude": 999.999999999,
            "latitude": 999.999999999,
            "folderId": "",
            "messageSourceType": "",
            "reasonCode_code": "NOT_APP_OUT_GERMANY",
            "attachments": [
                {
                    "fileId": "",
                    "fileName": "",
                    "mimeType": "",
                    "size": 0,
                    "creationDateTime": ""
                }
            ]
        };

        let responseAt;
        let resStatus;
        let responseError;

        // add mapping here for event payload to LBN format
        lbnFormat.actualTechnicalTimestamp = reportedAt;

        Logger.info(lbnFormat);

        // post event to LBN
        const response = await axios
            .post(request.url, lbnFormat, {
                headers: {
                    'Authorization': `${auth}`

                }
            })
            .then(function (response) {
                responseAt = new Date().toISOString();
                resStatus = "Success";
                responseError = "null";
                res.status(200).send("Event received");
            })
            .catch(function (error) {
                if (error.response) {
                    Logger.error(`while posting to LBN: ${error}`);
                    responseAt = new Date().toISOString();
                    resStatus = "Failed";
                    responseError = error.response.data;
                    res.status(400).send(error.response.data);
                }
            });

        // log LBN response
        await db.none('INSERT INTO lbn_response(shipment_no, reported_at, response_at, error_body, status ) VALUES($(shipment_no), $(reported_at), $(response_at), $(error_body), $(status))', {
            shipment_no: shipmentNo,
            reported_at: reportedAt,
            response_at: responseAt,
            error_body: responseError,
            status: resStatus
        }).catch((error) => {
            Logger.error(`while logging LBN response: ${error}`);
        })

        // // update event status
        await db.none('UPDATE events_log SET lbn_status = $(lbn_status), updated_at = $(updated_at) WHERE  shipment_no = $(shipment_no) AND reported_at = $(reported_at)', {
            shipment_no: shipmentNo,
            reported_at: reportedAt,
            lbn_status: resStatus,
            updated_at: responseAt,
        }).catch((error) => {
            Logger.error(`while updating event status: ${error}`);
        })
    }

    async eventList(req: express.Request, res: express.Response) {
        await db.result('SELECT shipment_no, reported_at, event_body, lbn_status, updated_at FROM events_log')
            .then(data => {
                res.status(200).send(data.rows);
            })
            .catch(error => {
                Logger.error(`while listing all events: ${error}`);
                res.status(400).send(`Error: ${error.detail}`);
            });;
    }

    async eventListByID(req: express.Request, res: express.Response) {
        const shipmentNo = req.params.shipmentNo;
        const reportedAt = req.params.reportedAt;
        await db.result('SELECT shipment_no, reported_at, event_body, lbn_status, updated_at FROM events_log WHERE shipment_no = $1 AND reported_at = $2', [shipmentNo, reportedAt])
            .then(data => {
                res.status(200).send(data.rows);
            })
            .catch(error => {
                Logger.error(`while listing event by ID: ${error}`);
                res.status(400).send(`Error: ${error.detail}`);
            });;
    }

    async processFlow(req: express.Request, res: express.Response) {
        const shipmentNo = req.params.shipmentNo;
        const reportedAt = req.params.reportedAt;
        let processFlowObject: any = '{"event": {}, "lbn_response": {}}';
        let processFlowJSON: any = JSON.parse(processFlowObject);

        // get event payload
        await db.result('SELECT shipment_no, reported_at, event_body, lbn_status, updated_at FROM events_log WHERE shipment_no = $1 AND reported_at = $2', [shipmentNo, reportedAt])
            .then(data => {
                processFlowJSON.event.push = data.rows;
            })
            .catch(error => {
                Logger.error(`while creating event process flow JSON: ${error}`);
                res.status(400).send(`Error: ${error}`);
            });;

        // get lbn response payload
        await db.result('SELECT shipment_no, reported_at, response_at, error_body, status from lbn_response WHERE shipment_no = $1 AND reported_at = $2', [shipmentNo, reportedAt])
            .then(data => {
                processFlowJSON.lbn_response.push = data.rows;
            })
            .catch(error => {
                Logger.error(`while creating LBN process flow JSON: ${error}`);
                res.status(400).send(`Error: ${error}`);
            });;

        res.status(200).send(processFlowJSON);
    }





}

export default new EventController();