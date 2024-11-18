import { Schema, model, Document } from 'mongoose';

// Interfaz para la lista de prioridad de contenedores
export interface ListaPrioridadContenedor extends Document {
    contenedores: string[]; // Cambiamos a array de strings
}

// Esquema para la lista de prioridad de contenedores
const ListaPrioridadContenedorSchema = new Schema<ListaPrioridadContenedor>({
    contenedores: [{ type: String, required: true }]
}, {
    timestamps: true,
    collection: 'ListaPrioridadContenedor'
});

// Exportamos el modelo de la lista de prioridad de contenedores
export const ListaPrioridadContenedorModel = model<ListaPrioridadContenedor>('ListaPrioridadContenedor', ListaPrioridadContenedorSchema);
