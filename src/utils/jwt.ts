import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config/config';

const SECRET_KEY = config.development.secretKey;

// Función para crear un JWT
export const createJWT = (payload: object): string => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '4h' }); // Token válido por 1 hora
};

// Función para validar un JWT y devolver el token decodificado o null si es inválido
export const validateJWT = (token: string): JwtPayload | null => {
    try {
        // Verificar y decodificar el token usando la clave secreta
        const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
        return decoded; // Retorna el token decodificado si es válido
    } catch (err) {
        console.error('Error al validar el token:', err); // Log del error
        return null; // Retorna null si el token es inválido o hay un error
    }
};