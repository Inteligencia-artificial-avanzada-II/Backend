import {
  DB_NAME,
  DB_PASSWORD,
  DB_USER,
  DB_HOST,
  SECRET_KEY,
  USER,
  FINGERPRINT,
  TENANCY,
  REGION,
  KEY_FILE,
} from "./index";

export default {
  development: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    dialect: "mysql",
    secretKey: SECRET_KEY,
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
    secretKey: SECRET_KEY,
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql",
    secretKey: SECRET_KEY,
  },
  oracle: {
    user: USER,
    fingerprint: FINGERPRINT,
    tenancy: TENANCY,
    region: REGION,
    key_file: KEY_FILE,
  },
};
