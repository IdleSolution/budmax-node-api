import { Request, Response, Router } from "express";
import { IAdminLogin } from "../interfaces/admin.interface";
import { Admin } from "../database/models/admin.model";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../utilities/secrets";

const router: Router = Router();

router.post('/login', async (req: Request<{}, {}, IAdminLogin>, res: Response) => {
    const { username, password } = req.body;

    const user = await Admin.findOne({ username });

    if(!user) {
        return res.status(404).json({ error: 'User not found!' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if(!validPassword) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: 86400 });
    res.status(200).json({ auth: true, token });
})


export const AdminAuthRoutes: Router = router;
