import multer from "multer";
import path from "path";

/**
    * Configuración de Multer para la gestión de archivos subidos:
    * - Define la carpeta `uploads` como destino de los archivos subidos.
    * - Genera un nombre único para cada archivo basado en la fecha y un sufijo aleatorio.
    * - Exporta el middleware `upload` para ser utilizado en las rutas que manejan subida de archivos.
*/

// Configuración del almacenamiento para Multer
const storage = multer.diskStorage({
    /**
        * Función que define la carpeta de destino de los archivos subidos.
        * 
        * @param req - Objeto de solicitud HTTP.
        * @param file - Objeto que representa el archivo subido.
        * @param cb - Callback para definir el destino de almacenamiento.
    */
    destination: (req, file, cb) => {
        // Utiliza una ruta absoluta para la carpeta `uploads`.
        cb(null, path.resolve(__dirname, "../../uploads")); // Usa una ruta absoluta a la carpeta `uploads`
    },

    /**
        * Función que genera un nombre único para los archivos subidos.
        * 
        * @param req - Objeto de solicitud HTTP.
        * @param file - Objeto que representa el archivo subido.
        * @param cb - Callback para definir el nombre del archivo.
    */
    filename: (req, file, cb) => {
        // Genera un sufijo único con la fecha y un número aleatorio.
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        // Combina el sufijo único con la extensión original del archivo.
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Inicialización del middleware Multer con la configuración de almacenamiento.
const upload = multer({ storage: storage });

// Exporta el middleware para su uso en otros módulos.
export { upload };
