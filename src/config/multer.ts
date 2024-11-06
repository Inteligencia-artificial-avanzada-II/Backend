import multer from "multer";
import path from "path";

// Define una ruta absoluta para `uploads/`
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, "../../uploads")); // Usa una ruta absoluta a la carpeta `uploads`
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

export { upload };
