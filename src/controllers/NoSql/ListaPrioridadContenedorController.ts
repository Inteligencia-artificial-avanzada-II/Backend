// Importamos los modelos y dependencias necesarias
import { Request, Response } from "express";
import { ListaPrioridadContenedorModel, ListaPrioridadContenedor } from "../../models/NoSql/ListaPrioridadContenedorModel";
import AbstractController from "../AbstractController";
import { validateTokenMiddleware } from "../../middlewares/validateToken";

class ListaPrioridadContenedorController extends AbstractController {
    private static _instance: ListaPrioridadContenedorController;
    private model = ListaPrioridadContenedorModel;

    public static get instance(): ListaPrioridadContenedorController {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new ListaPrioridadContenedorController("listaprioridadcontenedor");
        return this._instance;
    }

    constructor(name: string) {
        super(name);
        this.model = ListaPrioridadContenedorModel;
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
            res.status(200).send("Lista Prioridad Contenedor Controller funciona correctamente");
        } catch (error) {
            res.status(500).send(`Error en la prueba de conexión: ${error}`);
        }
    }

    private async postCrear(req: Request, res: Response) {
        /**
            * Crea una nueva lista de prioridad de contenedores.
            * 
            * @param req - Objeto de solicitud HTTP que debe contener:
            *   - `contenedores` (array en `req.body`): Lista de contenedores a crear. 
            *     Si está vacío o no es un array, se inicializará como un array vacío.
            *     Ejemplo: ["Contenedor1", "Contenedor2"]
            * @param res - Objeto de respuesta HTTP.
            * @returns Documento creado o mensaje de error.
        */


        try {
            const { contenedores } = req.body;

            // Verificar si 'contenedores' es un array; si no, inicializarlo como un array vacío
            const contenedoresList = Array.isArray(contenedores) ? contenedores : [];

            // Eliminar cualquier documento existente en la colección para mantener solo uno
            await ListaPrioridadContenedorModel.deleteMany({});

            // Crear un nuevo documento, incluso si 'contenedoresList' está vacío
            const newListaPrioridadContenedor = new ListaPrioridadContenedorModel({
                contenedores: contenedoresList
            });

            // Guardar el nuevo documento en la base de datos
            const savedContenedorList = await newListaPrioridadContenedor.save();

            // Enviar la lista de contenedores guardada (vacía o no) como respuesta
            res.status(201).send(savedContenedorList);
        } catch (error) {
            res.status(500).send(`Error al crear la lista de prioridad de contenedores: ${error}`);
        }
    }

    private async getTodos(req: Request, res: Response) {
        /**
            * Consulta y devuelve todas las listas de prioridad de contenedores.
            * 
            * @param - None
            * @returns - Lista de documentos de listas de prioridad de contenedores o mensaje de error.
        */

        try {
            const listas = await this.model.find();
            res.status(200).json({ message: "Datos obtenidos exitosamente", data: listas });
        } catch (error) {
            res.status(500).json({ error: `Error al consultar las listas de prioridad de contenedores: ${error}` });
        }
    }

    private async getPorId(req: Request, res: Response) {
        /**
            * Consulta una lista de prioridad de contenedores específica por su ID.
            * 
            * @param req - Objeto de solicitud HTTP que debe contener:
            *   - `id` (string en `req.params`): ID único de la lista a consultar.
            *     Ejemplo: "/consultar/12345" donde `12345` es el ID.
            * @param res - Objeto de respuesta HTTP.
            * @returns Lista de prioridad de contenedores o mensaje de error.
        */


        try {
            const { id } = req.params;
            const lista = await this.model.findById(id);
            if (!lista) {
                res.status(404).json({ message: `Lista de prioridad de contenedores con id ${id} no encontrada`, data: {} });
                return;
            }
            res.status(200).json({ message: "Lista obtenida exitosamente", data: lista });
        } catch (error) {
            res.status(500).json({ message: `Error al consultar la lista: ${error}`, data: {} });
        }
    }

    private async putActualizar(req: Request, res: Response) {
        /**
            * Actualiza una lista de prioridad de contenedores específica por su ID.
            * 
            * @param req - Objeto de solicitud HTTP que debe contener:
            *   - `id` (string en `req.params`): ID único de la lista a actualizar.
            *   - `updateData` (object en `req.body`): Datos que se van a actualizar.
            *     Ejemplo: { contenedores: ["NuevoContenedor1", "NuevoContenedor2"] }
            * @param res - Objeto de respuesta HTTP.
            * @returns Lista actualizada o mensaje de error.
        */


        try {
            const { id } = req.params;
            const updatedLista = await this.model.findByIdAndUpdate(id, req.body, { new: true });
            if (!updatedLista) {
                res.status(404).send(`Lista de prioridad de contenedores con id ${id} no encontrada`);
                return;
            }
            res.status(200).send(updatedLista);
        } catch (error) {
            res.status(500).send(`Error al actualizar la lista: ${error}`);
        }
    }

    private async deletePorId(req: Request, res: Response) {
        /**
            * Elimina una lista de prioridad de contenedores específica por su ID.
            * 
            * @param req - Objeto de solicitud HTTP que debe contener:
            *   - `id` (string en `req.params`): ID único de la lista a eliminar.
            * @param res - Objeto de respuesta HTTP.
            * @returns Mensaje de éxito si la lista fue eliminada o mensaje de error.
        */


        try {
            const { id } = req.params;
            const deletedLista = await this.model.findByIdAndDelete(id);
            if (!deletedLista) {
                res.status(404).send(`Lista de prioridad de contenedores con id ${id} no encontrada`);
                return;
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).send(`Error al eliminar la lista: ${error}`);
        }
    }

    // Métodos públicos
    public async createListaPrioridadContenedor(data: ListaPrioridadContenedor): Promise<ListaPrioridadContenedor & { _id: string }> {
        /**
            * Crea una nueva lista de prioridad de contenedores y la guarda en la base de datos.
            * 
            * @param data - Objeto que representa la lista de contenedores a guardar.
            *     Ejemplo: { contenedores: ["Contenedor1", "Contenedor2"] }
            * @returns Lista creada y guardada en la base de datos.
        */


        const newLista = new this.model(data);
        const savedLista = await newLista.save();
        return savedLista as ListaPrioridadContenedor & { _id: string };
    }

    public async getListaPrioridadContenedorById(id: string): Promise<ListaPrioridadContenedor | null> {
        /**
            * Consulta una lista de prioridad de contenedores por su ID.
            * 
            * @param id - ID único de la lista a consultar.
            * @returns Lista de prioridad de contenedores o `null` si no se encuentra.
        */


        try {
            const lista = await this.model.findById(id).select('-__v -_id').exec();
            return lista;
        } catch (error) {
            console.error("Error obteniendo la lista por ID:", error);
            return null;
        }
    }

    public async consultarListaPrioridadContenedor(): Promise<string[]> {
        /**
            * Consulta la lista actual de prioridad de contenedores.
            * 
            * @returns Un array con los IDs de los contenedores en la lista.
            *     Si no hay listas, devuelve un array vacío.
        */


        try {
            // Obtener solo el primer documento con su campo 'contenedores'
            const lista = await this.model.findOne().select('contenedores').exec();

            // Si no hay documentos, devolver un arreglo vacío
            return lista ? lista.contenedores : [];
        } catch (error) {
            console.error("Error al consultar la lista de prioridad de contenedores:", error);
            throw new Error("Error al consultar la lista de prioridad de contenedores.");
        }
    }

    public async eliminarContenedor(contenedor: string): Promise<string[]> {
        /**
            * Elimina un contenedor específico de la lista de prioridad.
            * 
            * @param contenedor - ID del contenedor que se desea eliminar.
            *     Ejemplo: "Contenedor1"
            * @returns Lista actualizada de contenedores después de la eliminación.
        */


        try {

            if (contenedor === 'noContainer') {
                return [];
            }

            // Buscar el documento con la lista de prioridad
            const lista = await this.model.findOne();

            if (!lista) {
                throw new Error("No se encontró una lista de prioridad de contenedores.");
            }

            // Filtrar el contenedor que se desea eliminar
            const nuevosContenedores = lista.contenedores.filter(c => c !== contenedor);

            // Actualizar el documento en la base de datos
            lista.contenedores = nuevosContenedores;
            await lista.save();

            return nuevosContenedores;
        } catch (error) {
            console.error("Error al eliminar el contenedor:", error);
            throw new Error("Error al eliminar el contenedor.");
        }
    }


}

export default ListaPrioridadContenedorController;