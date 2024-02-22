import * as dotenv from "dotenv";

dotenv.config({path: ".env"});

export const PORT = process.env.PORT ?? 3000;
export const ENV = process.env.ENV ?? 'dev';
export const LOG_DIRECTORY = process.env.LOG_DIRECTORY ?? './logs';
export const DB = {
    USER: process.env.DB_USER ?? 'root',
    PASSWORD: process.env.DB_PASSWORD ?? 'secret',
    HOST: process.env.DB_HOST ?? '0.0.0.0',
    NAME: process.env.DB_NAME ?? 'conduit',
    PORT: process.env.DB_PORT ?? 27017,
}
export const JWT_SECRET = process.env.JWT_SECRET!;
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
export const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME!;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;