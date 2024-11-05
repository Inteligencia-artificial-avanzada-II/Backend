import { Schema, model, Document } from 'mongoose';

// Interfaz para los productos dentro de una orden
export interface Product {
    itemCode: string;
    itemDescription: string;
    requestedQuantity: string;
    salePrice: string;
}

// Interfaz para la orden
export interface Order extends Document {
    orderNumber: string;
    createdBy: string;
    modifiedBy: string;
    creationDate: string;
    products: Product[];
}

// Esquema para los productos
const ProductSchema = new Schema<Product>({
    itemCode: { type: String, required: true },
    itemDescription: { type: String, required: true },
    requestedQuantity: { type: String, required: true },
    salePrice: { type: String, required: true }
});

// Esquema para las órdenes
const OrderSchema = new Schema<Order>({
    orderNumber: { type: String, required: true },
    createdBy: { type: String, required: true },
    modifiedBy: { type: String, required: true },
    creationDate: { type: String, required: true },
    products: { type: [ProductSchema], required: true }
}, {
    timestamps: true  // Agrega createdAt y updatedAt automáticamente
});

// Exportamos el modelo de la orden
export const MongoProductosModel = model<Order>('Order', OrderSchema);
