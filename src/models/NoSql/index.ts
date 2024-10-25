import mongoose from "mongoose";
import config from "../../config/config";  // Configuración de tu archivo de configuración

const uri = config.development.mongoDb;  // Tomamos la URI de MongoDB de la configuración

// Función para conectar a MongoDB usando Mongoose
const connectToMongoDB = async () => {
    try {
        // Intentamos conectar usando Mongoose
        await mongoose.connect(uri);
        console.log("Conectado a MongoDB correctamente.");

        // Opcional: Aquí puedes obtener la base de datos (aunque en Mongoose no es necesario)
        const db = mongoose.connection;

        // Puedes exportar la conexión para usarla en otros archivos
        return db;
    } catch (error) {
        console.error("Error conectando a MongoDB:", error);
        process.exit(1); // Terminar la aplicación en caso de error
    }
};

export default connectToMongoDB;
