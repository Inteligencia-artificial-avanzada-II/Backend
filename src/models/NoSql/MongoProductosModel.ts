import { Schema, model, Document } from 'mongoose';

// Interfaz para los productos dentro de una orden
export interface Product {
    itemCode: string;
    itemDescription: string;
    originalOrderQuantity: number;
    requestedQuantity: number;
    assignedQuantity: number;
    packedQuantity: number;
    orderDetailStatus: string;
    expirationDateComprobante: Date;
    barcode: string;
    salePrice: number;
    creationDateDetail?: Date; // Si puede ser opcional, agregamos el ?
    alternativeItemCodes: string;
    unitOfMeasure: string;
}

// Interfaz para la orden
export interface Order extends Document {
    orderNumber: string;
    createdBy: string;
    modifiedBy: string;
    creationDate: Date;
    products: Product[];
}

// Esquema para los productos
const ProductSchema = new Schema<Product>({
    itemCode: { type: String, required: true },
    itemDescription: { type: String, required: true },
    originalOrderQuantity: { type: Number, required: true },
    requestedQuantity: { type: Number, required: true },
    assignedQuantity: { type: Number, required: true },
    packedQuantity: { type: Number, required: true },
    orderDetailStatus: { type: String, required: true },
    expirationDateComprobante: { type: Date, required: true },
    barcode: { type: String, required: true },
    salePrice: { type: Number, required: true },
    creationDateDetail: { type: Date, required: false }, // Aquí hacemos explícito que es opcional
    alternativeItemCodes: { type: String, required: true },
    unitOfMeasure: { type: String, required: true }
});

// Esquema para las órdenes
const OrderSchema = new Schema<Order>({
    orderNumber: { type: String, required: true },
    createdBy: { type: String, required: true },
    modifiedBy: { type: String, required: true },
    creationDate: { type: Date, required: true },
    products: { type: [ProductSchema], required: true }
}, {
    timestamps: true  // Agregamos createdAt y updatedAt automáticamente
});

// Exportamos el modelo de la orden
export const MongoProductosModel = model<Order>('Order', OrderSchema);
