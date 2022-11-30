import { RoutesConfig } from './base.routes.js';
import CustomController from '../controllers/custom.controller.js';
import express from 'express';

export class CustomRoutes extends RoutesConfig {
    constructor(app: express.Application) {
        super(app, 'CustomRoutes');
    }

    configureRoutes(): express.Application {

        this.app
            .route(`/api/v1/iot/shipment/customFields`)
            .post(CustomController.customFields);

        this.app
            .route(`/api/v1/iot/shipment/:shipmentNo/customFields`)
            .get(CustomController.getCustomFields)
            .put(CustomController.customFieldsUpdate)
            .delete(CustomController.customFieldsDelete);

        return this.app;

    }
}