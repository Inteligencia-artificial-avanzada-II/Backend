/**
  * Configuración de variables de entorno requeridas por la aplicación:
  * 
  * - **PORT**: Número del puerto en el que correrá el servidor (por defecto 8080).
  * - **NODE_ENV**: Entorno de ejecución ("development", "production", etc.).
  * - **DB_NAME**: Nombre de la base de datos MySQL.
  * - **DB_USER**: Usuario de la base de datos MySQL.
  * - **DB_PASSWORD**: Contraseña para la base de datos MySQL.
  * - **DB_HOST**: Host donde se encuentra la base de datos MySQL (por defecto "localhost").
  * - **DB_PORT**: Puerto para conectarse a la base de datos MySQL (por defecto 3306).
  * - **PREFIX_NAME**: Prefijo del nombre de la aplicación (diferente entre entornos).
  * - **SECRET_KEY**: Clave secreta para autenticación y cifrado.
  * - **USER**: Usuario para integraciones con Oracle Cloud.
  * - **FINGERPRINT**: Huella digital asociada a la cuenta de Oracle.
  * - **TENANCY**: Tenencia (Tenancy) para Oracle Cloud.
  * - **REGION**: Región para los servicios de Oracle Cloud.
  * - **KEY_FILE**: Ruta al archivo de clave privada para Oracle Cloud.
  * - **MONGO_DB**: Nombre de la base de datos en MongoDB.
  * - **BUCKET_NAMESPACE**: Espacio de nombres del bucket en el servicio de almacenamiento.
  * - **BUCKET_NAME**: Nombre del bucket donde se almacenarán los archivos.
  * - **QR_KEY**: Clave secreta para generar y manejar códigos QR.
  * - **BACK_PYTHON**: Clave para la integración con un backend Python.
  * - **TOKEN_NO_EXP**: Clave para manejar tokens que no expiran.
*/

export const PORT: number = process.env.PORT
  ? parseInt(process.env.PORT)
  : 8080;
export const NODE_ENV: string = process.env.NODE_ENV || "development";
export const DB_NAME: string = process.env.DB_NAME || "";
export const DB_USER: string = process.env.DB_USER || "";
export const DB_PASSWORD: string = process.env.DB_PASSWORD || "";
export const DB_HOST: string = process.env.DB_HOST || "localhost";
export const DB_PORT: number = process.env.DB_PORT
  ? parseInt(process.env.DB_PORT)
  : 3306;
export const PREFIX_NAME: string = NODE_ENV === "production" ? "" : "-DEV";
export const SECRET_KEY: string = process.env.SECRET_KEY || "";
export const USER: string = process.env.USER || "";
export const FINGERPRINT: string = process.env.FINGERPRINT || "";
export const TENANCY: string = process.env.TENANCY || "";
export const REGION: string = process.env.REGION || "";
export const KEY_FILE: string = process.env.KEY_FILE || "";
export const MONGO_DB: string = process.env.MONGO_DB || "";
export const BUCKET_NAMESPACE: string = process.env.BUCKET_NAMESPACE || "";
export const BUCKET_NAME: string = process.env.BUCKET_NAME || "";
export const QR_KEY: string = process.env.SECRET_SAVE_QR_KEY || "";
export const BACK_PYTHON: string = process.env.BACK_PYTHON_KEY || "";
export const TOKEN_NO_EXP: string = process.env.TOKEN_NO_EXP || "";