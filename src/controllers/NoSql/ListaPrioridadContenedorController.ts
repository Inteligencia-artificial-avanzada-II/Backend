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
        try {
            res.status(200).send("Lista Prioridad Contenedor Controller funciona correctamente");
        } catch (error) {
            res.status(500).send(`Error en la prueba de conexión: ${error}`);
        }
    }

    private async postCrear(req: Request, res: Response) {
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
        try {
            const listas = await this.model.find();
            res.status(200).json({ message: "Datos obtenidos exitosamente", data: listas });
        } catch (error) {
            res.status(500).json({ error: `Error al consultar las listas de prioridad de contenedores: ${error}` });
        }
    }

    private async getPorId(req: Request, res: Response) {
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
        const newLista = new this.model(data);
        const savedLista = await newLista.save();
        return savedLista as ListaPrioridadContenedor & { _id: string };
    }

    public async getListaPrioridadContenedorById(id: string): Promise<ListaPrioridadContenedor | null> {
        try {
            const lista = await this.model.findById(id).select('-__v -_id').exec();
            return lista;
        } catch (error) {
            console.error("Error obteniendo la lista por ID:", error);
            return null;
        }
    }
}

export default ListaPrioridadContenedorController;