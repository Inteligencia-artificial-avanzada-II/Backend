import { Request, Response } from "express";
import { InventarioFabricaModel } from "../../models/NoSql/InventarioFabricaModel"; // Aquí importa tu modelo de inventario
import AbstractController from "../AbstractController";

class InventarioFabricaController extends AbstractController {
    private static _instance: InventarioFabricaController;
    private model = InventarioFabricaModel; // Modelo que has definido para los productos del inventario

    public static get instance(): InventarioFabricaController {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new InventarioFabricaController("inventariofabrica");
        return this._instance;
    }

    // Método protegido donde añadimos todas nuestras rutas y las ligamos con los métodos generados
    protected initializeRoutes(): void {
        this.router.get("/test", this.getTest.bind(this));
        this.router.post("/crear", this.postCrear.bind(this));
        this.router.get('/consultarTodos', this.getTodos.bind(this));
        this.router.get('/consultar/:id', this.getPorId.bind(this));  // Obtener producto por ID
        this.router.put('/actualizar/:id', this.putActualizar.bind(this)); // Actualizar producto por ID
        this.router.delete('/eliminar/:id', this.deletePorId.bind(this)); // Eliminar producto por ID
    }

    private async getTest(req: Request, res: Response) {
        /**
            * Prueba de conexión con el controlador.
            * 
            * @param - None
            * @returns - None
        */

        try {
            res.status(200).send("Inventario works");
        } catch (error) {
            res.status(500).send(`Error al conectar con el Inventario: ${error}`);
        }
    }

    private async postCrear(req: Request, res: Response) {
        /**
            * Crea nuevos productos en el inventario.
            * 
            * @param req - Objeto de solicitud HTTP que debe contener:
            *   - `productos` (array): Un arreglo de objetos que representan los productos a crear.
            *     Ejemplo: [{ nombre: "Producto A", precio: 100 }, { nombre: "Producto B", precio: 200 }]
            * @param res - Objeto de respuesta HTTP.
            * @returns Documento creado o mensaje de error.
        */

        try {
            const { productos } = req.body; // Recibimos un array de productos desde el request

            if (!Array.isArray(productos) || productos.length === 0) {
                return res
                    .status(400)
                    .send("El cuerpo de la petición debe contener un array 'productos'.");
            }

            // Creamos el documento en la base de datos con el array de productos
            const productoDocument = await this.model.insertMany(productos);

            res.status(201).send(productoDocument);
        } catch (error) {
            console.error("Error al crear el documento de productos:", error);
            res.status(500).send(`Error al crear el documento de productos: ${error}`);
        }
    }

    private async getTodos(req: Request, res: Response) {
        /**
            * Consulta y devuelve todos los productos del inventario.
            * 
            * @param - None
            * @returns - Lista de productos o mensaje de error.
        */

        try {
            const productos = await this.model.find();
            res.status(200).json(productos);
        } catch (error) {
            res.status(500).json({ error: `Error al consultar los productos: ${error}` });
        }
    }

    private async getPorId(req: Request, res: Response) {
        /**
            * Consulta un producto específico por su ID.
            * 
            * @param req - Objeto de solicitud HTTP que debe contener:
            *   - `id` (string en `req.params`): ID único del producto a consultar.
            *     Ejemplo: "/consultar/12345" donde `12345` es el ID.
            * @param res - Objeto de respuesta HTTP.
            * @returns Producto consultado o mensaje de error.
        */

        try {
            const { id } = req.params; // Obtenemos el ID del producto desde los parámetros de la URL
            const producto = await this.model.findById(id); // Buscar el producto por ID

            if (!producto) {
                return res.status(404).send("Producto no encontrado");
            }

            res.status(200).json(producto);
        } catch (error) {
            res.status(500).json({ error: `Error al consultar el producto: ${error}` });
        }
    }

    private async putActualizar(req: Request, res: Response) {
        /**
            * Actualiza un producto específico por su ID.
            * 
            * @param req - Objeto de solicitud HTTP que debe contener:
            *   - `id` (string en `req.params`): ID único del producto a actualizar.
            *   - `updateData` (object en `req.body`): Datos que se van a actualizar.
            *     Ejemplo: { nombre: "Producto Actualizado", precio: 150 }
            * @param res - Objeto de respuesta HTTP.
            * @returns Producto actualizado o mensaje de error.
        */

        try {
            const { id } = req.params;
            const updateData = req.body; // Los datos que se van a actualizar

            const productoActualizado = await this.model.findByIdAndUpdate(id, updateData, { new: true });

            if (!productoActualizado) {
                return res.status(404).send("Producto no encontrado");
            }

            res.status(200).json(productoActualizado);
        } catch (error) {
            res.status(500).json({ error: `Error al actualizar el producto: ${error}` });
        }
    }

    private async deletePorId(req: Request, res: Response) {
        /**
            * Elimina un producto específico por su ID.
            * 
            * @param req - Objeto de solicitud HTTP que debe contener:
            *   - `id` (string en `req.params`): ID único del producto a eliminar.
            * @param res - Objeto de respuesta HTTP.
            * @returns Mensaje de éxito si el producto fue eliminado o mensaje de error.
        */

        try {
            const { id } = req.params;
            const productoEliminado = await this.model.findByIdAndDelete(id);

            if (!productoEliminado) {
                return res.status(404).send("Producto no encontrado");
            }

            res.status(200).send("Producto eliminado con éxito");
        } catch (error) {
            res.status(500).json({ error: `Error al eliminar el producto: ${error}` });
        }
    }
}

export default InventarioFabricaController;