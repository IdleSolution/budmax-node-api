import { Request, Response, Router } from 'express';
import schemaValidator from '../middlewares/schema-validator.middleware';
import { COAL_CREATION_SCHEMA, COAL_UPDATE_SCHEMA } from '../schemas';
import { verifyToken } from '../middlewares/verify-jwt-token.middleware';
import multer from 'multer';
import { uploadImage } from '../utilities/upload-image';
import { ICoal, ICoalListQueryParams } from '../interfaces/coal.interface';
import { Coal } from '../database/models/coal.model';
import { CoalType, CoalTypeTranslations } from '../database/enums/coal.enum';

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

        const translatedType = CoalTypeTranslations[newCoal.type];
        
        const coal = new Coal({
            type: translatedType,
            name: newCoal.name,
            price: Number(newCoal.price),
            calorificValue: Number(newCoal.calorificValue),
            granulation: Number(newCoal.granulation),
            mine: newCoal.mine,
            imageUrl: image?.secure_url,

        });

        const savedCoal = await coal.save();
        return res.json({ coal: savedCoal.toJsonFor() });
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

router.get('/cube', async (req: Request, res: Response) => {
    const coals = await Coal.find({ type: CoalType.CUBE });

    return res.json({
        coals: coals.map(coal => coal.toJsonFor()),
    });
});

router.get('/walnut', async (req: Request, res: Response) => {
    const coals = await Coal.find({ type: CoalType.WALNUT });

    return res.json({
        coals: coals.map(coal => coal.toJsonFor()),
    });
});

router.get('/eco', async (req: Request, res: Response) => {
    const coals = await Coal.find({ type: CoalType.ECO_PEA });

    return res.json({
        coals: coals.map(coal => coal.toJsonFor()),
    });
});

router.get(
    '/:id', 
    async (req: Request<{ id: string }>, res: Response) => {
        const { id } = req.params;

        const coal = await Coal.findById(id);

        if(!coal) {
            return res.status(404).json({ error: 'Coal with given id does not exist.' });
        }

        return res.json({
            coal: coal.toJsonFor(),
        });
    }
)

router.patch(
    '/:id',
    upload.single('image'),
    schemaValidator(COAL_UPDATE_SCHEMA),
    verifyToken,
    async (req: Request<{ id: string }, {}, Partial<ICoal>>, res: Response) => {
        const updatedCoal = req.body;
        const { id } = req.params;

        const oldCoal = await Coal.findById(id);

        if(!oldCoal) {
            return res.status(404).json({ error: 'Coal with given id does not exist.' });
        }

        let image = undefined;

        if(req.file) {
            image = await uploadImage(req.file!.buffer);
        }

        await Coal.updateOne({
            _id: id
        }, {
            name: updatedCoal.name,
            type: updatedCoal.type,
            price: updatedCoal.price ? Number(updatedCoal.price) : undefined,
            calorificValue: updatedCoal.calorificValue ? Number(updatedCoal.calorificValue) : undefined,
            granulation: updatedCoal.granulation ? Number(updatedCoal.granulation) : undefined,
            mine: updatedCoal.mine,
            imageUrl: image?.secure_url,
        });

        const newCoal = await Coal.findById(id);

        return res.json({ coal: newCoal!.toJsonFor() });
    }
)

router.delete('/:id', verifyToken, 
    async (req: Request<{ id: string }>, res: Response) => {
        const { id } = req.params;
        const coal = await Coal.findById(id);

        if(!coal) {
            return res.status(404).json({ error: 'Coal with given id does not exist.' });
        }

        await Coal.deleteOne({ _id: id });

        return res.json({ success: true })
    }
)



export const CoalRoutes: Router = router;