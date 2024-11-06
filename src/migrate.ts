import { exec } from "child_process";
import dotenv from "dotenv";
dotenv.config();

exec("npx sequelize-cli db:migrate --config src/config/sequelizeConfig.js", (error, stdout, stderr) => {
    if (error) {
        console.error(`Error ejecutando la migración: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Error en stderr: ${stderr}`);
        return;
    }
    console.log(`Migración exitosa: ${stdout}`);
});
