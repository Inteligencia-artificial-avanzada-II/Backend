import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { validateTokenMiddleware } from "../middlewares/validateToken";

class PuertaContenedorController extends AbstractController {
  private static _instance: PuertaContenedorController;

  public static get instance(): PuertaContenedorController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new PuertaContenedorController("puertacontenedor");
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
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).send("PuertaContenedor Works");
    } catch (error) {
      res
        .status(500)
        .send(`Error al conectar con la PuertaContenedor ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const puertacontenedor = await db.PuertaContenedor.create(req.body);
      res.status(201).send(puertacontenedor);
    } catch (error) {
      res.status(500).send(`Error al crear la puertacontenedor ${error}`);
    }
  }

  // En PuertaContenedorController
  public async ContenedorEnPuerta(data: {
    idContenedor: number;
    idPuerta: number;
    fecha: Date;
  }) {
    try {
      const puertacontenedor = await db.PuertaContenedor.create(data);
      return puertacontenedor; // Retorna el objeto sin enviar la respuesta
    } catch (error) {
      throw new Error(`Error al crear la PuertaContenedor: ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const puertacontenedor = await db.PuertaContenedor.findAll();
      res.status(200).send(puertacontenedor);
    } catch (error) {
      res.status(500).send(`Error al consultar puertacontenedores ${error}`);
    }
  }

  private async getPorId(req: Request, res: Response) {
    try {
      const puertacontenedor = await db.PuertaContenedor.findByPk(
        req.params.id
      );
      res.status(200).send(puertacontenedor);
    } catch (error) {
      res.status(500).send(`Error al consultar puertacontenedor ${error}`);
    }
  }

  private async putActualizar(req: Request, res: Response) {
    try {
      await db.PuertaContenedor.update(req.body, {
        where: { id: req.params.id },
      });
      res.status(200).send("PuertaContenedor actualizada");
    } catch (error) {
      res.status(500).send(`Error al actualizar puertacontenedor ${error}`);
    }
  }

  private async deletePorId(req: Request, res: Response) {
    try {
      await db.PuertaContenedor.destroy({ where: { id: req.params.id } });
      res.status(200).send("PuertaContenedor eliminada");
    } catch (error) {
      res.status(500).send(`Error al eliminar puertacontenedor ${error}`);
    }
  }
}

export default PuertaContenedorController;
