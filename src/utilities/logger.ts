import { createLogger, format, transports } from 'winston';
import * as fs from 'fs';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ENV, LOG_DIRECTORY } from "./secrets";

let dir = LOG_DIRECTORY;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const logLevel = ENV === 'dev' ? 'debug' : 'warn';

const options = {
  file: {
    level                          : logLevel,
    filename                       : dir + '/%DATE%.log',
    datePattern                    : 'YYYY-MM-DD',
    zippedArchive                  : true,
    timestamp                      : true,
    handleExceptions               : true,
    humanReadableUnhandledException: true,
    prettyPrint                    : true,
    json                           : true,
    maxSize                        : '20m',
    colorize                       : true,
    maxFiles                       : '14d',
  },
};

export default createLogger({
  transports       : [
    new transports.Console({
      stderrLevels: ["info", "error"],
      format: format.combine(format.errors({stack: true}), format.prettyPrint()),
    }),
  ],
  exceptionHandlers: [new DailyRotateFile(options.file)],
  exitOnError      : false,
});