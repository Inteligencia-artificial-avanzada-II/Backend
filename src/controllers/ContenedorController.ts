import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

class ContenedorController extends AbstractController {
  private static _instance: ContenedorController;
  public static get instance(): ContenedorController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new ContenedorController("contenedor");
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
      res.status(200).send("Contenedor works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el Contenedor ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const { capacidad } = req.body;
      const contenedor = await db.Contenedor.create({
        capacidad,
      });

      res.status(201).send(contenedor);
    } catch (error) {
      res.status(500).send(`Error al crear el Contenedor ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const contenedores = await db.Contenedor.findAll();
      res.status(200).json(contenedores);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar los Contenedores: ${error}` });
    }
  }

  private async getPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contenedor = await db.Contenedor.findByPk(id);
      if (!contenedor) {
        res.status(404).send(`Contenedor con id ${id} no encontrado`);
        return;
      }
      res.status(200).send(contenedor);
    } catch (error) {
      res.status(500).send(`Error al consultar el Contenedor ${error}`);
    }
  }

  private async putActualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { capacidad } = req.body;
      const contenedor = await db.Contenedor.findByPk(id);
      if (!contenedor) {
        res.status(404).send(`Contenedor con id ${id} no encontrado`);
        return;
      }
      contenedor.capacidad = capacidad;
      await contenedor.save();
      res.status(200).send(contenedor);
    } catch (error) {
      res.status(500).send(`Error al actualizar el Contenedor: ${error}`);
    }
  }

  private async deletePorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contenedor = await db.Contenedor.findByPk(id);
      if (!contenedor) {
        res.status(404).send(`Contenedor con id ${id} no encontrado`);
        return;
      }
      await contenedor.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).send(`Error al eliminar el Contenedor ${error}`);
    }
  }
}

export default ContenedorController;
