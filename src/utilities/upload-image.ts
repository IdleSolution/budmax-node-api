import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_NAME } from './secrets';
import logger from './logger';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');


v2.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

export const uploadImage = async (buffer: Buffer): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> => {
    try {
        return new Promise((resolve, reject) => {
            const upload = v2.uploader.upload_stream(
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              },
            );
            toStream(buffer).pipe(upload);
          });
      
    } catch(e) {
        logger.error(`Something went wrong with file upload!`);
        throw e;
    }

}