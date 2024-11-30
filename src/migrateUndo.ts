// Importación de librerías
import { exec } from "child_process";
import dotenv from "dotenv";
dotenv.config();

// Ejecutar el comando de revertir migración de Sequelize utilizando npx y el archivo de configuración especificado
exec("npx sequelize-cli db:migrate:undo --config src/config/sequelizeConfig.js", (error, stdout, stderr) => {
    // Validamos si se detecta algún error en la ejecución del comando
    if (error) {
        console.error(`Error deshaciendo la migración: ${error.message}`);
        return; // Finalizamos ejecución del código
    }
    // Verificar si hubo errores en la salida estándar de errores (stderr)
    if (stderr) {
        console.error(`Error en stderr: ${stderr}`);
        return; // Finalizamos ejecución de códiog
    }
    // Si todo sale bien, mostramos mensaje de migración exitosa
    console.log(`Migración revertida exitosamente: ${stdout}`);
});
