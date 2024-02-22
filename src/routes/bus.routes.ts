import { Request, Response, Router } from 'express';
import { BusCreationInterface } from '../interfaces/bus.interface';
import { Bus } from '../database/models/bus.model';
import schemaValidator from '../middlewares/schema-validator.middleware';
import { BUS_CREATION_SCHEMA } from '../schemas';
import { verifyToken } from '../middlewares/verify-jwt-token.middleware';
import multer from 'multer';
import { uploadImage } from '../utilities/upload-image';

const router: Router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
    '/',
    upload.single('image'),
    schemaValidator(BUS_CREATION_SCHEMA),
    verifyToken,
    async (req: Request<{}, {}, BusCreationInterface>, res: Response) => {
        const newBus = req.body;

        const image = await uploadImage(req.file!.buffer);

        const bus = new Bus({
            model: newBus.model,
            power: newBus.power,
            engineCapacity: newBus.engineCapacity,
            pricePerDay: newBus.pricePerDay,
            imageUrl: image?.secure_url,
        });

        const savedBus = await bus.save();
        return res.json({ bus: savedBus.toJsonFor() });
    }
)

router.get(
    '/', 
    async (req: Request, res: Response) => {
        const buses = await Bus.find();

        return res.json({
            buses: buses.map(bus => bus.toJsonFor()),
        });
    }
)

export const BusRouters: Router = router;