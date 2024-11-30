/**
  * Importación de las variables de entorno desde el archivo de configuración.
  * Estas variables incluyen credenciales, configuraciones de base de datos,
  * y claves secretas necesarias para cada entorno.
*/
import {
  DB_NAME,
  DB_PASSWORD,
  DB_USER,
  DB_HOST,
  MONGO_DB,
  SECRET_KEY,
  USER,
  FINGERPRINT,
  TENANCY,
  REGION,
  KEY_FILE,
  QR_KEY,
  BUCKET_NAMESPACE,
  BUCKET_NAME,
  BACK_PYTHON,
  TOKEN_NO_EXP
} from "./index";

export default {
  /**
    * Configuración para el entorno de desarrollo.
    * Contiene las credenciales de acceso y configuraciones específicas
    * como el nombre de la base de datos, credenciales de MongoDB, y claves secretas.
  */
  development: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    dialect: "mysql",
    secretKey: SECRET_KEY,
    mongoDb: MONGO_DB,
    qrKey: QR_KEY,
    bucketName: BUCKET_NAME,
    bucketNameSpace: BUCKET_NAMESPACE,
    backPython: BACK_PYTHON,
    tokenNoExp: TOKEN_NO_EXP,
  },
  /**
    * Configuración para el entorno de pruebas.
    * Usada durante los tests, tiene valores por defecto como host local
    * y base de datos temporal para evitar interferencias con producción.
  */
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
    secretKey: SECRET_KEY,
    mongoDb: MONGO_DB,
    qrKey: QR_KEY,
    bucketName: BUCKET_NAME,
    bucketNameSpace: BUCKET_NAMESPACE,
    backPython: BACK_PYTHON,
    tokenNoExp: TOKEN_NO_EXP,
  },
  /**
    * Configuración para el entorno de producción.
    * Incluye credenciales y configuraciones que deberían estar protegidas y seguras.
    * Estas configuraciones son usadas en el despliegue final de la aplicación.
  */
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql",
    secretKey: SECRET_KEY,
    mongoDb: MONGO_DB,
    qrKey: QR_KEY,
    bucketName: BUCKET_NAME,
    bucketNameSpace: BUCKET_NAMESPACE,
    backPython: BACK_PYTHON,
    tokenNoExp: TOKEN_NO_EXP,
  },
  /**
    * Configuración específica para Oracle.
    * Este bloque contiene las credenciales y configuraciones necesarias
    * para la conexión con servicios de Oracle Cloud Infrastructure.
  */
  oracle: {
    user: USER,
    fingerprint: FINGERPRINT,
    tenancy: TENANCY,
    region: REGION,
    key_file: KEY_FILE,
  },
};
