import { Request, Response, NextFunction } from 'express';
import { validateJWT } from '../utils/jwt'; // Ajusta la ruta según donde esté tu función
import { JwtPayload } from 'jsonwebtoken';

// Middleware para validar el JWT
export const validateTokenMiddleware = (req: Request, res: Response, next: NextFunction): Response | void => {
    console.log(req.headers)
    const token = req.headers['authorization']?.split(' ')[1]; // Suponiendo que el token viene en formato 'Bearer <token>'

    if (!token) {
        return res.status(401).json({ message: 'No token provided', data: {} });
    }

    const decodedToken: JwtPayload | null = validateJWT(token);

    if (!decodedToken) {
        return res.status(401).json({ message: 'Invalid token', data: {} });
    }

    // Si el token es válido, adjuntamos el token decodificado al objeto de la solicitud
    req.body.decodedToken = decodedToken;

    next(); // Continuar con la siguiente función o middleware
};
