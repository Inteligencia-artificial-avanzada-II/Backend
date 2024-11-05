import e, { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { validateTokenMiddleware } from "../middlewares/validateToken";

class EntradaController extends AbstractController {
  private static _instance: EntradaController;
  public static get instance(): EntradaController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new EntradaController("entrada");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", validateTokenMiddleware, this.getTest.bind(this));
    this.router.post("/crear", validateTokenMiddleware, this.postCrear.bind(this));
    this.router.get("/consultarTodos", validateTokenMiddleware, this.getTodos.bind(this));
    this.router.get("/consultar/:id", validateTokenMiddleware, this.getPorId.bind(this));
    this.router.put("/actualizar/:id", validateTokenMiddleware, this.putActualizar.bind(this));
    this.router.delete("/eliminar/:id", validateTokenMiddleware, this.deletePorId.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    /**
     * Prueba de conexión con el controlador
     * @param - None
     * @returns - None
     */
    try {
      res.status(200).send("Entrada Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Entrada ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const { idCamion, idContenedor, idUsuarioCaseta, fecha } = req.body;
      const entrada = await db.Entrada.create({
        idCamion,
        idContenedor,
        idUsuarioCaseta,
        fecha,
      });

      res.status(201).send(entrada);
    } catch (error) {
      res.status(500).send(`Error al crear la Entrada ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const entradas = await db.Entrada.findAll();
      res.status(200).json(entradas);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar las Entradas: ${error}` });
    }
  }

  private async getPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const entrada = await db.Entrada.findByPk(id);
      if (!entrada) {
        res.status(404).send(`Entrada con id ${id} no encontrada`);
        return;
      }
      res.status(200).send(entrada);
    } catch (error) {
      res.status(500).send(`Error al consultar la Entrada: ${error}`);
    }
  }

  private async putActualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { idCamion, idContenedor, idUsuarioCaseta, fecha } = req.body;
      const entrada = await db.Entrada.findByPk(id);
      if (!entrada) {
        res.status(404).send(`Entrada con id ${id} no encontrada`);
        return;
      }
      entrada.idCamion = idCamion;
      entrada.idContenedor = idContenedor;
      entrada.idUsuarioCaseta = idUsuarioCaseta;
      entrada.fecha = fecha;
      await entrada.save();
      res.status(200).send(entrada);
    } catch (error) {
      res.status(500).send(`Error al actualizar la Entrada: ${error}`);
    }
  }

  private async deletePorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const entrada = await db.Entrada.findByPk(id);
      if (!entrada) {
        res.status(404).send(`Entrada con id ${id} no encontrada`);
        return;
      }
      await entrada.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).send(`Error al eliminar la Entrada: ${error}`);
    }
  }
}

export default EntradaController;
