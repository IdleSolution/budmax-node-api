import { Request, Response, Router } from 'express';
import schemaValidator from '../middlewares/schema-validator.middleware';
import { COAL_CREATION_SCHEMA } from '../schemas';
import { verifyToken } from '../middlewares/verify-jwt-token.middleware';
import multer from 'multer';
import { uploadImage } from '../utilities/upload-image';
import { ICoal, ICoalListQueryParams } from '../interfaces/coal.interface';
import { Coal } from '../database/models/coal.model';
import { CoalType } from '../database/enums/coal.enum';

const router: Router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
    '/',
    upload.single('image'),
    schemaValidator(COAL_CREATION_SCHEMA),
    verifyToken,
    async (req: Request<{}, {}, ICoal>, res: Response) => {
        const newCoal = req.body;

        let image;

        if(req.file) {
            image = await uploadImage(req.file!.buffer);
        }
        

        const coal = new Coal({
            type: newCoal.type,
            price: newCoal.price,
            calorificValue: newCoal.calorificValue,
            granulation: newCoal.granulation,
            mine: newCoal.mine,
            image_url: image?.secure_url,

        });

        const savedCoal = await coal.save();
        return res.json({ bus: savedCoal.toJsonFor() });
    }
)

router.get(
    '/', 
    async (req: Request<{}, {}, {}, ICoalListQueryParams>, res: Response) => {
        const type = req.query.type;

        if(!Object.values(CoalType).includes(type as CoalType) && type !== undefined) {
            return res.status(400).json({ error: 'Invalid type parameter.' })
        }

        const searchQuery = type ? { type } : {}

        const coals = await Coal.find(searchQuery);

        return res.json({
            coals: coals.map(coal => coal.toJsonFor()),
        });
    }
)

export const CoalRoutes: Router = router;