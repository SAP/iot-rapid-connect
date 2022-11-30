import express from 'express';
import * as http from 'http';
import basicAuth from 'express-basic-auth';

import cors from 'cors';
import { RoutesConfig } from './routes/base.routes.js';
import { CustomRoutes } from './routes/custom.routes.js';
import httpLogger from './utils/httpLogger.config.js';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = 8080;
const routes: Array<RoutesConfig> = [];



app.use(basicAuth({
    users: { 'admin': 'redbluegreen', 'test': 'greenthirteen' },
    unauthorizedResponse: getUnauthorizedResponse
}));

function getUnauthorizedResponse(req) {
    return req.auth
        ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
        : 'No credentials provided'
}

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