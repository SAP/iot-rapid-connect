import express from 'express';
import passport from 'passport';
import * as http from 'http';
import { JWTStrategy } from '@sap/xssec';
import xsenv from '@sap/xsenv';

import cors from 'cors';
import { RoutesConfig } from './routes/base.routes.js';
import { CustomRoutes } from './routes/custom.routes.js';
import httpLogger from './utils/httpLogger.config.js';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = 8080;
const routes: Array<RoutesConfig> = [];

// auth
passport.use(new JWTStrategy(xsenv.getServices({ xsuaa: { tag: 'xsuaa' } }).xsuaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));

app.use(express.json());
app.use(httpLogger);
app.use(cors());

// add routes
routes.push(new CustomRoutes(app));

const runningMessage = `Server running on http://localhost:${port}`;
app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(runningMessage)
});

server.listen(port, () => {
    console.log(runningMessage);
});