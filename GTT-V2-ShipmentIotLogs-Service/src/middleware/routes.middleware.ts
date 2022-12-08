import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import express from 'express';
import EventDto from '../dto/event.dto.js';
import Logger from '../utils/logger.config.js';

class RoutesMiddleware {
    async validateRequiredFields(req: express.Request, res: express.Response, next: express.NextFunction) {
        const eventToValidate = plainToInstance(EventDto, req.body);

        try {
            await validateOrReject(eventToValidate);
            next();
        } catch (errors) {
            Logger.error(errors);
            res.status(400).send(errors);
        }
    }
}

export default new RoutesMiddleware();