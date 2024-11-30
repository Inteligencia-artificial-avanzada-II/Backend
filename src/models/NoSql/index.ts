import mongoose from "mongoose";
import config from "../../config/config";  // Configuración de tu archivo de configuración

const uri = config.development.mongoDb;  // Tomamos la URI de MongoDB de la configuración

// Función para conectar a MongoDB usando Mongoose
const connectToMongoDB = async () => {
    try {
        // Intentamos conectar usando Mongoose
        await mongoose.connect(uri);
        console.log("Conectado a MongoDB correctamente.");

        // Obtiene la instancia de conexión de Mongoose. Esto no siempre es necesario,
        // pero puede ser útil para manejar eventos relacionados con la conexión.
        const db = mongoose.connection;

        // Devuelve la instancia de conexión. Esto permite reutilizarla en otros módulos si es necesario.
        return db;
    } catch (error) {
        console.error("Error conectando a MongoDB:", error);
        process.exit(1); // Terminar la aplicación en caso de error
    }
};

export default connectToMongoDB;
