import { Request, Response, Router } from 'express';
import schemaValidator from '../middlewares/schema-validator.middleware';
import { PELLET_CREATION_SCHEMA, PELLET_UPDATE_SCHEMA } from '../schemas';
import { verifyToken } from '../middlewares/verify-jwt-token.middleware';
import multer from 'multer';
import { uploadImage } from '../utilities/upload-image';
import { IPellet } from '../interfaces/pellet.interface';
import { Pellet } from '../database/models/pellet.model';

const router: Router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
    '/',
    upload.single('image'),
    schemaValidator(PELLET_CREATION_SCHEMA),
    verifyToken,
    async (req: Request<{}, {}, IPellet>, res: Response) => {
        const newPellet = req.body;

        let image;

        if(req.file) {
            image = await uploadImage(req.file!.buffer);
        }

        const pellet = new Pellet({
            name: newPellet.name,
            price: newPellet.price,
            imageUrl: image?.secure_url,
            certificates: newPellet.certificates,
            producent: newPellet.producent,
        });

        const savedPellet = await pellet.save();
        return res.json({ pellet: savedPellet.toJsonFor() });
    }
)

router.get(
    '/', 
    async (req: Request, res: Response) => {
        const pellets = await Pellet.find();

        return res.json({
            pellets: pellets.map(pellet => pellet.toJsonFor()),
        });
    }
)

router.get(
    '/:id', 
    async (req: Request<{ id: string }>, res: Response) => {
        const { id } = req.params;

        const pellet = await Pellet.findById(id);

        if(!pellet) {
            return res.status(404).json({ error: 'Pellet with given id does not exist.' });
        }

        return res.json({
            pellet: pellet.toJsonFor(),
        });
    }
)

router.delete('/:id', verifyToken, 
    async (req: Request<{ id: string }>, res: Response) => {
        const { id } = req.params;
        const pellet = await Pellet.findById(id);

        if(!pellet) {
            return res.status(404).json({ error: 'Pellet with given id does not exist.' });
        }

        await Pellet.deleteOne({ _id: id });

        return res.json({ success: true })
    }
)


router.patch(
    '/:id',
    upload.single('image'),
    schemaValidator(PELLET_UPDATE_SCHEMA),
    verifyToken,
    async (req: Request<{ id: string }, {}, Partial<IPellet>>, res: Response) => {
        const updatePellet = req.body;
        const { id } = req.params;

        const oldPellet = await Pellet.findById(id);

        if(!oldPellet) {
            return res.status(404).json({ error: 'Pellet with given id does not exist.' });
        }

        let image = undefined;

        if(req.file) {
            image = await uploadImage(req.file!.buffer);
        }

        await Pellet.updateOne({
            _id: id
        }, {
            name: updatePellet.name,
            price: updatePellet.price,
            imageUrl: image?.secure_url,
            certificates: updatePellet.certificates,
            producent: updatePellet.producent,
        });

        const newPellet = await Pellet.findById(id);

        return res.json({ pellet: newPellet!.toJsonFor() });
    }
)

export const PelletRoutes: Router = router;