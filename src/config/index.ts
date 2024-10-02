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
export const AWS_REGION: string = process.env.AWS_REGION || "us-east-1";
export const AWS_ACCESS_KEY_ID: string = process.env.AWS_ACCESS_KEY_ID || "";
export const AWS_SECRET_ACCESS_KEY: string =
  process.env.AWS_SECRET_ACCESS_KEY || "";
export const AWS_SESSION_TOKEN: string = process.env.AWS_SESSION_TOKEN || "";

export const AWS_ACCESS_KEY_ID_1: string = process.env.AWS_ACCESS_KEY_ID || "";
export const AWS_SECRET_ACCESS_KEY_1: string =
  process.env.AWS_SECRET_ACCESS_KEY || "";
