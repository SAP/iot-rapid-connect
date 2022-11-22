import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import express from 'express';
import EventDto from '../dto/event.dto.js';
import Logger from '../utils/logger.config.js';

class RoutesMiddleware {
    async validateRequiredFields(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (req.body && req.body.shipmentNo && req.body.reportedAt) {
            next();
        } else {
            res.status(400).send({
                error: `Missing required fields: shipmentNo and/or reportedAt`,
            });
            next();
        }

        // const shipmentToValidate = plainToInstance(EventDto, req.body);

        // try {
        //     await validateOrReject(shipmentToValidate);
        //     next();
        // } catch (error) {
        //     Logger.error(error);
        //     res.status(400).send(error);
        // }
    }
}

export default new RoutesMiddleware();