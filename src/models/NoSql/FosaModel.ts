import { Schema, model, Document } from "mongoose";

// Interfaz para cada entrada en `daily`, permitiendo valores booleanos con claves dinámicas
interface DailySubEntry {
  [key: string]: boolean; // Claves como `1-09:54`, `2-09:57`, etc.
}

// Interfaz para la estructura de `daily`, donde las fechas son las claves principales
interface DailyEntry {
  [fecha: string]: DailySubEntry; // Cada fecha contiene un objeto con entradas de contenedores
}

// Interfaz para cada `Fosa`
export interface Fosa {
  name: string;
  description: string;
  capacity: number;
  created_at: Date;
  updated_at: Date;
  daily: DailyEntry;
}

// Interfaz para el documento de colección de `Fosas`
export interface FosasDocument extends Document {
  fosas: Fosa[];
}

// Esquema para cada `Fosa`
const FosaSchema = new Schema<Fosa>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  capacity: { type: Number, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
  daily: {
    type: Schema.Types.Mixed, // Flexibilidad total para almacenar objetos de fechas y contenedores
    required: true,
  },
});

// Esquema para la colección de `Fosas`
const FosasSchema = new Schema<FosasDocument>({
  fosas: { type: [FosaSchema], required: true },
});

// Exportamos el modelo de `Fosas`
export const MongoFosasModel = model<FosasDocument>("Fosas", FosasSchema);
