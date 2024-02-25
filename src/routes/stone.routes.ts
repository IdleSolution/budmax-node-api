import { Request, Response, Router } from 'express';
import schemaValidator from '../middlewares/schema-validator.middleware';
import { PELLET_CREATION_SCHEMA, STONE_CREATION_SCHEMA } from '../schemas';
import { verifyToken } from '../middlewares/verify-jwt-token.middleware';
import multer from 'multer';
import { uploadImage } from '../utilities/upload-image';
import { IPellet } from '../interfaces/pellet.interface';
import { Pellet } from '../database/models/pellet.model';
import { IStone } from '../interfaces/stone.interface';
import { Stone } from '../database/models/stone.models';

const router: Router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
    '/',
    upload.single('image'),
    schemaValidator(STONE_CREATION_SCHEMA),
    verifyToken,
    async (req: Request<{}, {}, IStone>, res: Response) => {
        const newStone = req.body;

        let image;

        if(req.file) {
            image = await uploadImage(req.file!.buffer);
        }
        

        const stone = new Stone({
            price: newStone.price,
            image_url: image?.secure_url,
            name: newStone.name,
            granulation: newStone.granulation,
            deliveryForm: newStone.deliveryForm,
        });

        const savedStone = await stone.save();
        return res.json({ bus: savedStone.toJsonFor() });
    }
)

router.get(
    '/', 
    async (req: Request, res: Response) => {
        const stones = await Stone.find();

        return res.json({
            pellets: stones.map(stone => stone.toJsonFor()),
        });
    }
)

export const StoneRoutes: Router = router;