import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { validateTokenMiddleware } from "../middlewares/validateToken";

class SalidaController extends AbstractController {
  private static _instance: SalidaController;
  public static get instance(): SalidaController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new SalidaController("salida");
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
      res.status(200).send("Salida Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Salida ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const { idCamion, idContenedor, idUsuarioCaseta, fecha } = req.body;
      const salida = await db.Salida.create({
        idCamion,
        idContenedor,
        idUsuarioCaseta,
        fecha,
      });

      res.status(201).send(salida);
    } catch (error) {
      res.status(500).send(`Error al crear la Salida ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const salidas = await db.Salida.findAll();
      res.status(200).json(salidas);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar las Salidas: ${error}` });
    }
  }

  private async getPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const salida = await db.Usuario.findByPk(id);
      if (!salida) {
        res.status(404).send(`Salida con id ${id} no encontrada`);
        return;
      }
      res.status(200).send(salida);
    } catch (error) {
      res.status(500).send(`Error al consultar la Salida: ${error}`);
    }
  }

  private async putActualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { idCamion, idContenedor, idUsuarioCaseta, fecha } = req.body;
      const salida = await db.Salida.findByPk(id);
      if (!salida) {
        res.status(404).send(`Salida con id ${id} no encontrada`);
        return;
      }
      salida.idCamion = idCamion;
      salida.idContenedor = idContenedor;
      salida.idUsuarioCaseta = idUsuarioCaseta;
      salida.fecha = fecha;
      await salida.save();
      res.status(200).send(salida);
    } catch (error) {
      res.status(500).send(`Error al actualizar la Salida: ${error}`);
    }
  }

  private async deletePorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const salida = await db.Salida.findByPk(id);
      if (!salida) {
        res.status(404).send(`Salida con id ${id} no encontrada`);
        return;
      }
      await salida.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).send(`Error al eliminar la Salida: ${error}`);
    }
  }
}

export default SalidaController;
