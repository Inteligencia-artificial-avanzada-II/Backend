import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

class OrdenController extends AbstractController {
  private static _instance: OrdenController;
  public static get instance(): OrdenController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new OrdenController("orden");
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
      res.status(200).send("Orden Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Orden ${error}`);
    }
  }
  private async postCrear(req: Request, res: Response) {
    try {
      const { idContenedor, idCamion, origen, idCedis, idMongoProductos } =
        req.body;
      const orden = await db.Orden.create({
        idContenedor,
        idCamion,
        origen,
        idCedis,
        idMongoProductos,
      });

      res.status(201).send(orden);
    } catch (error) {
      res.status(500).send(`Error al crear la Orden ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const ordenes = await db.Orden.findAll();
      res.status(200).json(ordenes);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar las Ordenes: ${error}` });
    }
  }

  private async getPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orden = await db.Orden.findByPk(id);
      if (!orden) {
        res.status(404).send(`Orden con id ${id} no encontrada`);
        return;
      }
      res.status(200).send(orden);
    } catch (error) {
      res.status(500).send(`Error al consultar la Orden: ${error}`);
    }
  }

  private async putActualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { idContenedor, idCamion, origen, idCedis, idMongoProductos } =
        req.body;
      const orden = await db.Orden.findByPk(id);
      if (!orden) {
        res.status(404).send(`Orden con id ${id} no encontrada`);
        return;
      }
      orden.idContenedor = idContenedor;
      orden.idCamion = idCamion;
      orden.origen = origen;
      orden.idCedis = idCedis;
      orden.idMongoProductos = idMongoProductos;
      await orden.save();
      res.status(200).send(orden);
    } catch (error) {
      res.status(500).send(`Error al actualizar la Orden: ${error}`);
    }
  }

  private async deletePorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orden = await db.Orden.findByPk(id);
      if (!orden) {
        res.status(404).send(`Orden con id ${id} no encontrada`);
        return;
      }
      await orden.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).send(`Error al eliminar la Orden: ${error}`);
    }
  }
}

export default OrdenController;
