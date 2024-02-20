import { Request, Response, Router } from 'express';
import { BusCreationInterface } from '../interfaces/bus.interface';
import { Bus } from '../database/models/bus.model';

const router: Router = Router();

router.post('/', async (req: Request<{}, {}, BusCreationInterface>, res: Response) => {
    const newBus = req.body;

    const bus = new Bus({
        model: newBus.model,
        power: newBus.power,
        engineCapacity: newBus.engineCapacity,
        pricePerDay: newBus.pricePerDay,
    });

    const savedBus = await bus.save();
    return res.json({bus: savedBus.toJsonFor()});
})

router.get('/', async (req: Request, res: Response) => {
    const buses = await Bus.find();

    return res.json({
        buses: buses.map(bus => bus.toJsonFor()),
    });
})

export const BusRouters: Router = router;