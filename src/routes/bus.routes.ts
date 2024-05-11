import { Request, Response, Router } from 'express';
import { BusCreationInterface, IBus, IBusSearchQueryParams } from '../interfaces/bus.interface';
import IBusModel, { Bus } from '../database/models/bus.model';
import schemaValidator from '../middlewares/schema-validator.middleware';
import { BUS_CREATION_SCHEMA, BUS_UPDATE_SCHEMA } from '../schemas';
import { verifyToken } from '../middlewares/verify-jwt-token.middleware';
import multer from 'multer';
import { uploadImage } from '../utilities/upload-image';
import { checkDateIntersection } from '../utilities/date-intersection';
import { Document, Types } from 'mongoose';
import { countDays } from '../utilities/count-days';
import { ADVANCE_PAYMENT_PERCENTAGE } from './payments.routes';

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

        let image;

        if(req.file) {
            image = await uploadImage(req.file!.buffer);
        }

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

router.get(
    '/search', 
    async (req: Request<{}, {}, {}, IBusSearchQueryParams>, res: Response) => {
        const { start, end } = req.query;

        const buses = await Bus.find();

        const busesToReturn: (Document<unknown, {}, IBusModel> & IBusModel & { _id: Types.ObjectId; })[] = [];

        buses.forEach(bus => {
            let intersected = false;
            bus.rents.forEach(rent => {
                const differenceMs = Date.now() - rent.createdAt.getTime();
    
                const oneHourMs = 60 * 60 * 1000;
    
                const intersection = checkDateIntersection({ startDate: new Date(Number(start)), endDate: new Date(Number(end)) }, 
                    { startDate: rent.startDate, endDate: rent.endDate }
                );

                if((rent.payment.paid || (differenceMs < oneHourMs && !rent.payment.paid)) && intersection) {
                    intersected = true;
                }
             })

             if(!intersected) {
                busesToReturn.push(bus);
             }
        })

        return res.json({
            buses: busesToReturn.map(bus => {
                return {
                    ...bus.toJsonFor(),
                    totalAmountToPay: bus.pricePerDay * ADVANCE_PAYMENT_PERCENTAGE * countDays(new Date(Number(start)), new Date(Number(end))),
                }
            }),
        });
    }
)

router.get(
    '/:id', 
    async (req: Request<{ id: string }>, res: Response) => {
        const { id } = req.params;

        const bus = await Bus.findById(id);

        if(!bus) {
            return res.status(404).json({ error: 'Bus with given id does not exist.' });
        }

        return res.json({
            bus: bus.toJsonFor(),
        });
    }
)

router.delete('/:id', verifyToken, 
    async (req: Request<{ id: string }>, res: Response) => {
        const { id } = req.params;
        const bus = await Bus.findById(id);

        if(!bus) {
            return res.status(404).json({ error: 'Bus with given id does not exist.' });
        }

        await Bus.deleteOne({ _id: id });

        return res.json({ success: true })
    }
)

router.patch(
    '/:id',
    upload.single('image'),
    schemaValidator(BUS_UPDATE_SCHEMA),
    verifyToken,
    async (req: Request<{ id: string }, {}, Partial<IBus>>, res: Response) => {
        const updatedBus = req.body;
        const { id } = req.params;

        const oldBus = await Bus.findById(id);

        if(!oldBus) {
            return res.status(404).json({ error: 'Bus with given id does not exist.' });
        }

        let image = undefined;

        if(req.file) {
            image = await uploadImage(req.file!.buffer);
        }

        await Bus.updateOne({
            _id: id
        }, {
            model: updatedBus.model,
            power: updatedBus.power,
            engineCapacity: updatedBus.engineCapacity,
            pricePerDay: updatedBus.pricePerDay,
            
            imageUrl: image?.secure_url,
        });

        const newBus = await Bus.findById(id);

        return res.json({ bus: newBus!.toJsonFor() });
    }
)

export const BusRouters: Router = router;