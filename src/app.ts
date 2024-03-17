import express from 'express';
import { Request, Response } from 'express';

import * as bodyParser from 'body-parser';
import { MainRouter } from './routes';
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from './swagger-output.json';
import cors from 'cors';

import './database';

const app: express.Application = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    return res.json({ health: 'check' });
})

app.use('/api', MainRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

process.on('SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
    process.exit(0);
});

export default app;