import { Request, Response } from "express";
import AbstractNoSqlController from "./AbstractNoSqlController";
import { MongoProductosModel, Order } from "../../models/NoSql/MongoProductosModel";  // Importamos la interfaz Order también

class MongoProductosController extends AbstractNoSqlController<Order> {  // Cambiamos 'typeof OrderModel' a 'Order'
    private static _instance: MongoProductosController;

    public static get instance(): MongoProductosController {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new MongoProductosController("orden", MongoProductosModel);
        return this._instance;
    }

    protected initializeRoutes(): void {
        this.router.get("/test", this.getTest.bind(this));
        this.router.post("/crear", this.postCrear.bind(this));
        this.router.get("/consultarTodos", this.getTodos.bind(this));
        this.router.get("/consultar/:id", this.getPorId.bind(this));
        this.router.put("/actualizar/:id", this.putActualizar.bind(this));
        this.router.delete("/eliminar/:id", this.deletePorId.bind(this));
    }

    private async getTest(req: Request, res: Response) {
        /**
        * Prueba de conexión con el controlador
        * @param - None
        * @returns - None
        */
        try {
            res.status(200).send("Orden works");
        } catch (error) {
            res.status(500).send(`Error al conectar con la Orden: ${error}`);
        }
    }
    private async postCrear(req: Request, res: Response) {
        try {
            // Obtenemos los datos del cuerpo de la petición
            const { orderNumber, createdBy, modifiedBy, creationDate, products } = req.body;

            // Validamos que todos los campos requeridos estén presentes (opcional)
            if (!orderNumber || !createdBy || !products || products.length === 0) {
                return res.status(400).send("Faltan datos requeridos para crear la orden.");
            }

            // Creamos una nueva instancia del modelo con los datos proporcionados
            const newOrder = new this.model({
                orderNumber,
                createdBy,
                modifiedBy,
                creationDate,
                products
            });

            // Guardamos la nueva orden en la base de datos
            const savedOrder = await newOrder.save();

            // Enviamos la orden guardada como respuesta
            res.status(201).send(savedOrder);
        } catch (error) {
            res.status(500).send(`Error al crear la Orden: ${error}`);
        }
    }


    private async getTodos(req: Request, res: Response) {
        try {
            const orders = await this.model.find();
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ error: `Error al consultar las Órdenes: ${error}` });
        }
    }

    private async getPorId(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const order = await this.model.findById(id);
            if (!order) {
                res.status(404).send(`Orden con id ${id} no encontrada`);
                return;
            }
            res.status(200).send(order);
        } catch (error) {
            res.status(500).send(`Error al consultar la Orden: ${error}`);
        }
    }

    private async putActualizar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updatedOrder = await this.model.findByIdAndUpdate(id, req.body, { new: true });
            if (!updatedOrder) {
                res.status(404).send(`Orden con id ${id} no encontrada`);
                return;
            }
            res.status(200).send(updatedOrder);
        } catch (error) {
            res.status(500).send(`Error al actualizar la Orden: ${error}`);
        }
    }

    private async deletePorId(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const deletedOrder = await this.model.findByIdAndDelete(id);
            if (!deletedOrder) {
                res.status(404).send(`Orden con id ${id} no encontrada`);
                return;
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).send(`Error al eliminar la Orden: ${error}`);
        }
    }
}

export default MongoProductosController;
