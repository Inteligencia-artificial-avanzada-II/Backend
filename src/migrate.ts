// Importación de librerías
import { exec } from "child_process";
import dotenv from "dotenv";
dotenv.config();

// Ejecutar el comando de migración de Sequelize utilizando npx y el archivo de configuración especificado
exec("npx sequelize-cli db:migrate --config src/config/sequelizeConfig.js", (error, stdout, stderr) => {
    // Validamos si se detecta algún error
    if (error) {
        console.error(`Error ejecutando la migración: ${error.message}`);
        return; // Salir del bloque de ejecución
    }
    // Verificar si hubo errores en la salida estándar de errores (stderr)
    if (stderr) {
        console.error(`Error en stderr: ${stderr}`);
        return; // Detenemos la ejecución
    }
    // Si todo salió bien, mostramos mensaje
    console.log(`Migración exitosa: ${stdout}`);
});
