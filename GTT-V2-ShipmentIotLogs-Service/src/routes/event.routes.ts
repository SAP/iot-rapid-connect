import { RoutesConfig } from './base.routes.js';
import routesMiddleware from '../middleware/routes.middleware.js';
import EventController from '../controllers/event.controller.js';
import express from 'express';

export class EventRoutes extends RoutesConfig {
    constructor(app: express.Application) {
        super(app, 'EventRoutes');
    }

    configureRoutes(): express.Application {
        this.app
            .route(`/api/v1/iot/shipment/events`)
            .post(
                routesMiddleware.validateRequiredFields,
                EventController.eventLog,
                EventController.lbnRequestPost
            )
            .get(
                EventController.eventList
            );

        this.app
            .route(`/api/v1/iot/shipment/:shipmentNo/events/:reportedAt`)
            .get(
                EventController.eventListByID
            );

        this.app
            .route(`/api/v1/iot/shipment/:shipmentNo/events/:reportedAt/processFlow`)
            .get(
                EventController.processFlow
            );

        return this.app;

    }
}