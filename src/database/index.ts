import mongoose from 'mongoose';
import logger from "../utilities/logger";
import { DB } from "../utilities/secrets";

const dbURI = `mongodb://${DB.HOST}:${DB.PORT}/${
  DB.NAME
}`;

console.log(dbURI);


const options = {
  autoIndex         : true,
  connectTimeoutMS  : 10000,
  socketTimeoutMS   : 45000,
};

logger.debug(dbURI);

mongoose
  .connect(dbURI, options)
  .then(() => {
    logger.info('Mongoose connection done');
  })
  .catch((e) => {
    logger.info('Mongoose connection error');
    logger.error(e);
  });


mongoose.connection.on('connected', () => {
  logger.info('Mongoose default connection open to ' + dbURI);
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose default connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
  logger.info('Mongoose default connection disconnected');
});

process.on('SIGINT', () => {
  logger.info('Mongoose default connection disconnected through app termination');

  mongoose.connection.close(true);
});