import express from 'express';
import * as bodyParser from 'body-parser';
import { MainRouter } from './routes';
import './database';


const app: express.Application = express();

app.use(bodyParser.json());

app.use('/api', MainRouter);


export default app;