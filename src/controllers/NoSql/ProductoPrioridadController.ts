// Importamos el modelo PriorityProductModel y su interfaz
import { Request, Response } from "express";
import { PriorityProductListModel, PriorityProductList } from "../../models/NoSql/ProductoPrioridadModel";
import AbstractController from "../AbstractController";
import { validateTokenMiddleware } from "../../middlewares/validateToken";

class PriorityProductController extends AbstractController {
    private static _instance: PriorityProductController;
    private model = PriorityProductListModel;

    public static get instance(): PriorityProductController {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new PriorityProductController("priorityproduct");
        return this._instance;
    }

    constructor(name: string) {
        super(name);
        this.model = PriorityProductListModel; // Asignación del modelo PriorityProductModel
    }

    // Método protegido donde añadimos todas nuestras rutas y las ligamos con los métodos generados
    protected initializeRoutes(): void {
        this.router.get("/test", validateTokenMiddleware, this.getTest.bind(this));
        this.router.post("/crear", validateTokenMiddleware, this.postCrear.bind(this));
        this.router.get("/consultarTodos", validateTokenMiddleware, this.getTodos.bind(this));
        this.router.get("/consultar/:id", validateTokenMiddleware, this.getPorId.bind(this));
        this.router.put("/actualizar/:id", validateTokenMiddleware, this.putActualizar.bind(this));
        this.router.delete("/eliminar/:id", validateTokenMiddleware, this.deletePorId.bind(this));
    }

    // Métodos privados
    private async getTest(req: Request, res: Response) {
        /**
            * Prueba de conexión con el controlador.
            * 
            * @param - None
            * @returns - None
        */

        try {
            res.status(200).send("Priority Product Controller works");
        } catch (error) {
            res.status(500).send(`Error en la prueba de conexión: ${error}`);
        }
    }

    private async postCrear(req: Request, res: Response) {
        /**
            * Crea una nueva lista de productos prioritarios en la base de datos.
            * 
            * @param req - Objeto de solicitud HTTP que debe contener:
            *   - `products` (array en `req.body`): Lista de productos prioritarios a crear. 
            *     Si está vacío o no es un array, se inicializará como un array vacío.
            *     Ejemplo: ["Producto1", "Producto2"]
            * @param res - Objeto de respuesta HTTP.
            * @returns Lista de productos prioritarios creada o mensaje de error.
        */

        try {
            const { products } = req.body;

            // Verificar si 'products' es un array; si no, inicializarlo como un array vacío
            const productsList = Array.isArray(products) ? products : [];

            // Eliminar cualquier documento existente en la colección para mantener solo uno
            await PriorityProductListModel.deleteMany({});

            // Crear un nuevo documento, incluso si 'productsList' está vacío
            const newPriorityProductList = new PriorityProductListModel({
                products: productsList
            });

            // Guardar el nuevo documento en la base de datos
            const savedProductList = await newPriorityProductList.save();

            // Enviar la lista de productos guardada (vacía o no) como respuesta
            res.status(201).send(savedProductList);
        } catch (error) {
            res.status(500).send(`Error al crear la lista de productos prioritarios: ${error}`);
        }
    }

    private async getTodos(req: Request, res: Response) {
        /**
            * Consulta y devuelve todas las listas de productos prioritarios.
            * 
            * @param - None
            * @returns - Lista de productos prioritarios o mensaje de error.
        */

        try {
            const products = await this.model.find();
            res.status(200).json({ message: "Datos obtenidos exitosamene", data: products });
        } catch (error) {
            res.status(500).json({ error: `Error al consultar los productos prioritarios: ${error}` });
        }
    }

    private async getPorId(req: Request, res: Response) {
        /**
            * Consulta un producto prioritario específico por su ID.
            * 
            * @param req - Objeto de solicitud HTTP que debe contener:
            *   - `id` (string en `req.params`): ID único del producto prioritario a consultar.
            *     Ejemplo: "/consultar/12345" donde `12345` es el ID.
            * @param res - Objeto de respuesta HTTP.
            * @returns Producto prioritario consultado o mensaje de error.
        */

        try {
            const { id } = req.params;
            const product = await this.model.findById(id);
            if (!product) {
                res.status(404).json({ message: `Producto prioritario con id ${id} no encontrado`, data: {} });
                return;
            }
            res.status(200).json({ message: "Producto prioritario obtenido exitosamente", data: product });
        } catch (error) {
            res.status(500).json({ message: `Error al consultar el producto prioritario: ${error}`, data: {} });
        }
    }

    private async putActualizar(req: Request, res: Response) {
        /**
            * Actualiza un producto prioritario específico por su ID.
            * 
            * @param req - Objeto de solicitud HTTP que debe contener:
            *   - `id` (string en `req.params`): ID único del producto prioritario a actualizar.
            *   - `req.body` (object): Datos que se van a actualizar en el producto prioritario.
            *     Ejemplo: { nombre: "Producto Actualizado", prioridad: 1 }
            * @param res - Objeto de respuesta HTTP.
            * @returns Producto prioritario actualizado o mensaje de error.
        */

        try {
            const { id } = req.params;
            const updatedProduct = await this.model.findByIdAndUpdate(id, req.body, { new: true });
            if (!updatedProduct) {
                res.status(404).send(`Producto prioritario con id ${id} no encontrado`);
                return;
            }
            res.status(200).send(updatedProduct);
        } catch (error) {
            res.status(500).send(`Error al actualizar el producto prioritario: ${error}`);
        }
    }

    private async deletePorId(req: Request, res: Response) {
        /**
            * Elimina un producto prioritario específico por su ID.
            * 
            * @param req - Objeto de solicitud HTTP que debe contener:
            *   - `id` (string en `req.params`): ID único del producto prioritario a eliminar.
            * @param res - Objeto de respuesta HTTP.
            * @returns Mensaje de éxito si el producto prioritario fue eliminado o mensaje de error.
        */

        try {
            const { id } = req.params;
            const deletedProduct = await this.model.findByIdAndDelete(id);
            if (!deletedProduct) {
                res.status(404).send(`Producto prioritario con id ${id} no encontrado`);
                return;
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).send(`Error al eliminar el producto prioritario: ${error}`);
        }
    }

    // Métodos públicos
    public async createPriorityProduct(data: PriorityProductList): Promise<PriorityProductList & { _id: string }> {
        /**
            * Crea un nuevo producto prioritario en la base de datos.
            * 
            * @param data - Objeto que representa el producto prioritario a crear.
            *     Ejemplo: { nombre: "Producto1", prioridad: 1 }
            * @returns Producto prioritario creado y guardado en la base de datos.
        */

        const newProduct = new this.model(data);
        const savedProduct = await newProduct.save();
        return savedProduct as PriorityProductList & { _id: string };
    }

    public async getPriorityProductById(id: string): Promise<PriorityProductList | null> {
        /**
            * Consulta un producto prioritario específico por su ID.
            * 
            * @param id - ID único del producto prioritario a consultar.
            * @returns Producto prioritario consultado o `null` si no se encuentra.
        */

        try {
            const product = await this.model.findById(id).select('-__v -_id').exec();
            return product;
        } catch (error) {
            console.error("Error obteniendo el producto prioritario por ID:", error);
            return null;
        }
    }
}

export default PriorityProductController;
