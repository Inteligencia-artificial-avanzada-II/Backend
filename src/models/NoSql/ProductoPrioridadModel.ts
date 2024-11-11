import { Schema, model, Document } from 'mongoose';

// Interfaz para un producto en la lista de prioridad
export interface PriorityProduct {
    id: string;
    descripcion: string;
}

// Interfaz para el documento que contiene la lista de productos prioritarios
export interface PriorityProductList extends Document {
    products: PriorityProduct[];
}

// Esquema para un producto con prioridad
const PriorityProductSchema = new Schema<PriorityProduct>({
    id: { type: String, required: true },
    descripcion: { type: String, required: true },
});

// Esquema para el contenedor de productos prioritarios
const PriorityProductListSchema = new Schema<PriorityProductList>({
    products: { type: [PriorityProductSchema], required: true }
}, {
    timestamps: true
});

// Modelo para la lista de productos prioritarios (todos en un solo documento)
export const PriorityProductListModel = model<PriorityProductList>('PriorityProductList', PriorityProductListSchema);
