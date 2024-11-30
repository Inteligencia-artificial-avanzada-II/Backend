import { Request, Response, NextFunction } from 'express';
import { validateJWT } from '../utils/jwt'; // Ajusta la ruta según donde esté tu función
import { JwtPayload } from 'jsonwebtoken';

// Middleware para validar el JWT
export const validateTokenMiddleware = (req: Request, res: Response, next: NextFunction): Response | void => {
    const authorizationHeader = req.headers['authorization'];
    const token = Array.isArray(authorizationHeader) ? authorizationHeader[0]?.split('Token ')[1] : authorizationHeader?.split('Token ')[1];

    // Validamoz que exista el token
    if (!token) {
        return res.status(401).json({ message: 'No token provided', data: {} }); // Si no existe devolvemos una respuesta de error
    }

    // Validamos el token
    const decodedToken: JwtPayload | null = validateJWT(token);

    // Validamos la validación del token
    if (!decodedToken) {
        return res.status(401).json({ message: 'Invalid token', data: {} }); // Si no es válido el token, devolvemos una respuesta de error
    }

    // Si el token es válido, adjuntamos el token decodificado al objeto de la solicitud
    req.body.decodedToken = decodedToken;

    next(); // Continuar con la siguiente función o middleware
};
