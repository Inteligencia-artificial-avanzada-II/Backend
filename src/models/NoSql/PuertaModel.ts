import { number } from "joi";
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
export interface Puerta {
  number: number;
  isOccupied: boolean;
  created_at: Date;
  updated_at: Date;
  daily: DailyEntry;
}

// Interfaz para el documento de colección de `Fosas`
export interface PuertaDocument extends Document {
  puertas: Puerta[];
}

// Esquema para cada `Fosa`
const PuertaSchema = new Schema<Puerta>({
  number: { type: Number, required: true },
  isOccupied: { type: Boolean, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
  daily: {
    type: Schema.Types.Mixed, // Flexibilidad total para almacenar objetos de fechas y contenedores
    required: true,
  },
});

// Esquema para la colección de `Fosas`
const PuertasSchema = new Schema<PuertaDocument>({
  puertas: { type: [PuertaSchema], required: true },
});

// Exportamos el modelo de `Fosas`
export const MongoPuertasModel = model<PuertaDocument>(
  "Puertas",
  PuertasSchema
);
