import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { validateTokenMiddleware } from "../middlewares/validateToken";

class PuertaController extends AbstractController {
  private static _instance: PuertaController;
  public static get instance(): PuertaController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new PuertaController("puerta");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", validateTokenMiddleware, this.getTest.bind(this));
    this.router.post(
      "/crear",
      validateTokenMiddleware,
      this.postCrear.bind(this)
    );
    this.router.get(
      "/consultarTodos",
      validateTokenMiddleware,
      this.getTodos.bind(this)
    );
    this.router.get(
      "/consultar/:id",
      validateTokenMiddleware,
      this.getPorId.bind(this)
    );
    this.router.put(
      "/actualizar/:id",
      validateTokenMiddleware,
      this.putActualizar.bind(this)
    );
    this.router.delete(
      "/eliminar/:id",
      validateTokenMiddleware,
      this.deletePorId.bind(this)
    );
    this.router.put(
      "/actualizarOcupado/:id",
      validateTokenMiddleware,
      this.putActualizarOcupado.bind(this)
    );
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).send("Puerta Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Puerta ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const puerta = await db.Puerta.create(req.body);
      res.status(201).json(puerta);
    } catch (error) {
      res.status(500).send(`Error al crear la Puerta ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const puertas = await db.Puerta.findAll();
      res.status(200).json(puertas);
    } catch (error) {
      res.status(500).send(`Error al consultar las Puertas ${error}`);
    }
  }

  private async getPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const puerta = await db.Puerta.findByPk(id);
      res.status(200).json(puerta);
    } catch (error) {
      res.status(500).send(`Error al consultar la Puerta ${error}`);
    }
  }

  private async putActualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const puerta = await db.Puerta.findByPk(id);
      if (puerta) {
        await puerta.update(req.body);
        res.status(200).json(puerta);
      } else {
        res.status(404).send("Puerta no encontrada");
      }
    } catch (error) {
      res.status(500).send(`Error al actualizar la Puerta ${error}`);
    }
  }

  private async deletePorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const puerta = await db.Puerta.findByPk(id);
      if (puerta) {
        await puerta.destroy();
        res.status(204).send();
      } else {
        res.status(404).send("Puerta no encontrada");
      }
    } catch (error) {
      res.status(500).send(`Error al eliminar la Puerta ${error}`);
    }
  }

  private async putActualizarOcupado(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const puerta = await db.Puerta.findByPk(id);
      if (puerta) {
        await puerta.update({ isOcuppied: !puerta.isOcuppied });
        res.status(200).json(puerta);
      } else {
        res.status(404).send("Puerta no encontrada");
      }
    } catch (error) {
      res.status(500).send(`Error al actualizar la Puerta ${error}`);
    }
  }
}

export default PuertaController;
