import { Schema, model, Document } from 'mongoose';

// Interfaz para el producto
export interface Product extends Document {
    id: number;
    nombre: string;
    cantidad: string;
    descripcion: string;
    imagen: string;
    cantidadAgregada: number;
    botana: string;
}

// Esquema para el producto
const ProductSchema = new Schema<Product>({
    id: { type: Number, required: true },
    nombre: { type: String, required: true },
    cantidad: { type: String, required: true },
    descripcion: { type: String, required: true },
    imagen: { type: String, required: true },
    cantidadAgregada: { type: Number, default: 0 },
    botana: { type: String, required: true }
}, {
    timestamps: true  // Agrega createdAt y updatedAt automáticamente
});

// Exportamos el modelo del producto
export const InventarioFabricaModel = model<Product>('InventarioFabrica', ProductSchema);