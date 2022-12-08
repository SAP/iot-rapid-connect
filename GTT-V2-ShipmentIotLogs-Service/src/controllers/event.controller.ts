import axios, { AxiosError } from 'axios';
import express, { response } from 'express';

import DestinationConfig from '../utils/destination.config.js';
import RequestConfig from '../utils/request.config.js';
import Logger from '../utils/logger.config.js';
import db from '../db/db.config.js';

class EventController {

    // log event payload in db
    async eventLog(req: express.Request, res: express.Response, next) {
        const eventPayload = req.body;
        const shipmentNo = eventPayload.shipmentNo;
        const reportedBy = eventPayload.reportedBy;
        const reportedAt = eventPayload.reportedAt;
        const timezone = eventPayload.timezone;
        const priority = eventPayload.priority;

        await db.none('INSERT INTO events_log(shipment_no, reported_by, reported_at, timezone, priority, event_body, lbn_status) VALUES($(shipment_no), $(reported_by), $(reported_at), $(timezone), $(priority), $(event_body), $(lbn_status))', {
            shipment_no: shipmentNo,
            reported_by: reportedBy,
            reported_at: reportedAt,
            timezone: timezone,
            priority: priority,
            event_body: eventPayload,
            lbn_status: "In Process"
        }).then(() => {
            res.status(200).send("Event logged");
        }).catch((error) => {
            Logger.error(`while logging event: ${error}`);
            res.status(400).send(`Error logging event: ${error}`);
        })

        next();
    }


    // post event payload to LBN, log response and update event status
    async lbnRequestPost(req: express.Request, res: express.Response, next) {
        const oDestination = await DestinationConfig("LBN_Access");
        const request = new RequestConfig(oDestination?.data);
        const auth = request.headers.Authorization;

        const eventPayload = req.body;
        const shipmentNo = eventPayload.shipmentNo;
        const reportedAt = eventPayload.reportedAt;

        let lbnRequestPayload = {
            "eventReasonCode": "IOT Event",
            "altKey": "",
            "reportedBy": "",
            "priority": "",
            "actualBusinessTimestamp": "",
            "actualBusinessTimeZone": "",
            "eventReasonText": ""
        };

        // add mapping here for event payload to LBN format
        lbnRequestPayload.eventReasonText = JSON.stringify(eventPayload.eventDetails);
        lbnRequestPayload.altKey = `xri://sap.com/id:LBN#10010003536:QW9CLNT170:SHIPMENT_ORDER:${shipmentNo}`;
        lbnRequestPayload.reportedBy = eventPayload.reportedBy;
        lbnRequestPayload.priority = eventPayload.priority;
        lbnRequestPayload.actualBusinessTimestamp = reportedAt;
        lbnRequestPayload.actualBusinessTimeZone = eventPayload.timezone;

        console.log(lbnRequestPayload);

        // log request payload
        await db.none('UPDATE events_log SET lbn_payload = $(lbn_payload) WHERE shipment_no = $(shipment_no) AND reported_at = $(reported_at)', {
            shipment_no: shipmentNo,
            reported_at: reportedAt,
            lbn_payload: lbnRequestPayload
        }).catch((error) => {
            Logger.error(`while logging LBN request payload: ${error}`);
        })

        let responseAt;
        let resStatus;
        let responseError;

        // post event to LBN
        const response = await axios
            .post(request.url, lbnRequestPayload, {
                headers: {
                    'Authorization': `${auth}`
                }
            })
            .then(function (response) {
                responseAt = new Date().toISOString();
                resStatus = "Success";
                responseError = "null";
                Logger.info("Event posted to LBN");
            })
            .catch(function (error) {
                if (error.response) {
                    Logger.error(`while posting to LBN: ${error}`);
                    responseAt = new Date().toISOString();
                    resStatus = "Failed";
                    responseError = error.response.data;
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

        // update event status and log request payload
        await db.none('UPDATE events_log SET lbn_payload = $(lbn_payload), lbn_status = $(lbn_status), updated_at = $(updated_at) WHERE  shipment_no = $(shipment_no) AND reported_at = $(reported_at)', {
            shipment_no: shipmentNo,
            reported_at: reportedAt,
            lbn_payload: lbnRequestPayload,
            lbn_status: resStatus,
            updated_at: responseAt,
        }).catch((error) => {
            Logger.error(`while updating event's LBN request status: ${error}`);
        })
    }

    // return list of events stored in db
    async eventList(req: express.Request, res: express.Response) {
        await db.result('SELECT shipment_no, reported_by, reported_at, timezone, event_body, lbn_payload, lbn_status, updated_at FROM events_log')
            .then(data => {
                res.status(200).send(data.rows);
            })
            .catch(error => {
                Logger.error(`while listing all events: ${error}`);
                res.status(500).send(`Error: ${error.detail}`);
            });;
    }

    // return event details by ID
    async eventListByID(req: express.Request, res: express.Response) {
        const shipmentNo = req.params.shipmentNo;
        const reportedAt = req.params.reportedAt;
        await db.result('SELECT shipment_no, reported_by, reported_at, timezone, event_body, lbn_payload, lbn_status, updated_at  FROM events_log WHERE shipment_no = $1 AND reported_at = $2', [shipmentNo, reportedAt])
            .then(data => {
                res.status(200).send(data.rows);
            })
            .catch(error => {
                Logger.error(`while listing event by ID: ${error}`);
                res.status(500).send(`Error: ${error.detail}`);
            });;
    }

    // return process flow for event by ID
    async processFlow(req: express.Request, res: express.Response) {
        const shipmentNo = req.params.shipmentNo;
        const reportedAt = req.params.reportedAt;
        let processFlowObject: any = '{"event": {}, "lbn_response": {}}';
        let processFlowJSON: any = JSON.parse(processFlowObject);

        // event details
        await db.result('SELECT shipment_no, reported_by, reported_at, timezone, event_body, lbn_payload, lbn_status, updated_at FROM events_log WHERE shipment_no = $1 AND reported_at = $2', [shipmentNo, reportedAt])
            .then(data => {
                processFlowJSON.event.push = data.rows;
            })
            .catch(error => {
                Logger.error(`while creating event process flow JSON: ${error}`);
                res.status(500).send(`Error: ${error}`);
            });

        // LBN response details
        await db.result('SELECT shipment_no, reported_at, response_at, error_body, status from lbn_response WHERE shipment_no = $1 AND reported_at = $2', [shipmentNo, reportedAt])
            .then(data => {
                processFlowJSON.lbn_response.push = data.rows;
            })
            .catch(error => {
                Logger.error(`while creating LBN process flow JSON: ${error}`);
                res.status(500).send(`Error: ${error}`);
            });

        res.status(200).send(processFlowJSON);
    }
}

export default new EventController();