import { Request, Response, Router } from 'express';
import schemaValidator from '../middlewares/schema-validator.middleware';
import { PELLET_CREATION_SCHEMA, STONE_CREATION_SCHEMA, STONE_UPDATE_SCHEMA } from '../schemas';
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
            imageUrl: image?.secure_url,
            name: newStone.name,
            granulation: newStone.granulation,
            deliveryForm: newStone.deliveryForm,
        });

        const savedStone = await stone.save();
        return res.json({ stone: savedStone.toJsonFor() });
    }
)

router.get(
    '/', 
    async (req: Request, res: Response) => {
        const stones = await Stone.find();

        return res.json({
            stones: stones.map(stone => stone.toJsonFor()),
        });
    }
)

router.get(
    '/:id', 
    async (req: Request<{ id: string }>, res: Response) => {
        const { id } = req.params;

        const stone = await Stone.findById(id);

        if(!stone) {
            return res.status(404).json({ error: 'Stone with given id does not exist.' });
        }

        return res.json({
            stone: stone.toJsonFor(),
        });
    }
)

router.delete('/:id', verifyToken, 
    async (req: Request<{ id: string }>, res: Response) => {
        const { id } = req.params;
        const stone = await Stone.findById(id);

        if(!stone) {
            return res.status(404).json({ error: 'Stone with given id does not exist.' });
        }

        await Stone.deleteOne({ _id: id });

        return res.json({ success: true })
    }
)

router.patch(
    '/:id',
    upload.single('image'),
    schemaValidator(STONE_UPDATE_SCHEMA),
    verifyToken,
    async (req: Request<{ id: string }, {}, Partial<IStone>>, res: Response) => {
        const updatedStone = req.body;
        const { id } = req.params;

        const oldStone = await Stone.findById(id);

        if(!oldStone) {
            return res.status(404).json({ error: 'Stone with given id does not exist.' });
        }

        let image = undefined;

        if(req.file) {
            image = await uploadImage(req.file!.buffer);
        }

        await Stone.updateOne({
            _id: id
        }, {
            price: updatedStone.price,
            imageUrl: image?.secure_url,
            name: updatedStone.name,
            granulation: updatedStone.granulation,
            deliveryForm: updatedStone.deliveryForm,
        });

        const newStone = await Stone.findById(id);

        return res.json({ stone: newStone!.toJsonFor() });
    }
)

export const StoneRoutes: Router = router;