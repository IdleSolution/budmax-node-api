import { Router } from 'express';
import { BusRouters } from './bus.routes';
import { AdminAuthRoutes } from './admin-auth.routes';
import { CoalRoutes } from './coal.routes';

const router: Router = Router();

router.use('/bus', BusRouters);
router.use('/admin-auth', AdminAuthRoutes);
router.use('/coal', CoalRoutes);


export const MainRouter: Router = router;