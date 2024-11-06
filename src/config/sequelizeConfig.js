// Carga las variables de entorno desde `.env`
require('dotenv').config();

module.exports = {
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
        user: process.env.USER,
        fingerprint: process.env.FINGERPRINT,
        tenancy: process.env.TENANCY,
        region: process.env.REGION,
        key_file: process.env.KEY_FILE,
    },
};
