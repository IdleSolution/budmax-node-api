import { Router } from 'express';
import { BusRouters } from './bus.routes';
import { AdminAuthRoutes } from './admin-auth.routes';
import { CoalRoutes } from './coal.routes';
import { PelletRoutes } from './pellet.routes';
import { StoneRoutes } from './stone.routes';

const router: Router = Router();

router.use('/bus', BusRouters);
router.use('/admin-auth', AdminAuthRoutes);
router.use('/coal', CoalRoutes);
router.use('/pellet', PelletRoutes);
router.use('/stone', StoneRoutes);


export const MainRouter: Router = router;