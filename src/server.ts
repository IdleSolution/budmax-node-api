import app from './app';
import { PORT } from "./utilities/secrets";
import logger from "./utilities/logger";

app
  .listen(PORT, () => {
    logger.info(`Server running on port : ${PORT}`);
    console.log(`Server running on port : ${PORT}`);
  })
  .on('error', (e) => logger.error(e));