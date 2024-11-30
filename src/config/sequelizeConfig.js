// Carga las variables de entorno desde el archivo `.env`.
// Esto permite utilizar configuraciones sensibles como credenciales y claves
// sin incluirlas directamente en el código fuente.
require('dotenv').config();

/**
    * Configuración de entornos para Sequelize.
    * Este archivo proporciona las credenciales y configuraciones necesarias
    * para cada entorno (desarrollo, pruebas, producción y Oracle).
    * 
    * - **development**: Configuración para el desarrollo local.
    * - **test**: Configuración para pruebas unitarias.
    * - **production**: Configuración para entornos en producción.
    * - **oracle**: Configuración adicional para integraciones con Oracle Cloud.
*/

module.exports = {
    // Configuración de la base de datos en entorno de desarrollo.
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: "mysql",
        secretKey: process.env.SECRET_KEY,
        mongoDb: process.env.MONGO_DB,
        qrKey: process.env.QR_KEY,
        bucketName: process.env.BUCKET_NAME,
        bucketNameSpace: process.env.BUCKET_NAMESPACE,
    },
    // Configuración de la base de datos en entorno de pruebas.
    test: {
        username: "root",
        password: null,
        database: "database_test",
        host: "127.0.0.1",
        dialect: "mysql",
        secretKey: process.env.SECRET_KEY,
        mongoDb: process.env.MONGO_DB,
        qrKey: process.env.QR_KEY,
        bucketName: process.env.BUCKET_NAME,
        bucketNameSpace: process.env.BUCKET_NAMESPACE,
    },
    // Configuración de la base de datos en entorno de producción.
    production: {
        username: "root",
        password: null,
        database: "database_production",
        host: "127.0.0.1",
        dialect: "mysql",
        secretKey: process.env.SECRET_KEY,
        mongoDb: process.env.MONGO_DB,
        qrKey: process.env.QR_KEY,
        bucketName: process.env.BUCKET_NAME,
        bucketNameSpace: process.env.BUCKET_NAMESPACE,
    },
    oracle: {
        // Configuración para integraciones con Oracle Cloud.
        user: process.env.USER,
        fingerprint: process.env.FINGERPRINT,
        tenancy: process.env.TENANCY,
        region: process.env.REGION,
        key_file: process.env.KEY_FILE,
    },
};
