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
