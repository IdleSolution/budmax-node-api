import { Router } from 'express';
import { BusRouters } from './bus.routes';
import { AdminAuthRoutes } from './admin-auth.routes';

const router: Router = Router();

router.use('/bus', BusRouters);
router.use('/admin-auth', AdminAuthRoutes);

export const MainRouter: Router = router;