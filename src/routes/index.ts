import { Router } from 'express';
import { BusRouters } from './bus.routes';

const router: Router = Router();

router.use('/bus', BusRouters);

export const MainRouter: Router = router;