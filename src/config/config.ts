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
  BACK_PYTHON
} from "./index";

export default {
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
  },
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
  },
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
  },
  oracle: {
    user: USER,
    fingerprint: FINGERPRINT,
    tenancy: TENANCY,
    region: REGION,
    key_file: KEY_FILE,
  },
};
