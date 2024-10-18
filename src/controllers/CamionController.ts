import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { afterEach } from "node:test";

class CamionController extends AbstractController {
  private static _instance: CamionController;
  public static get instance(): CamionController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new CamionController("camion");
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
    try {
      res.status(200).send("Camion works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el Camion ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const { placas, modelo, idMongoLocalzacion } = req.body;
      const camion = await db.Camion.create({
        placas,
        modelo,
        idMongoLocalzacion,
      });

      res.status(201).send(camion);
    } catch (error) {
      res.status(500).send(`Error al crear el Camion ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const camiones = await db.Camion.findAll();
      res.status(200).json(camiones);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar los Camiones: ${error}` });
    }
  }

  private async getPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const camion = await db.Camion.findByPk(id);
      if (!camion) {
        res.status(404).send(`Camion con id ${id} no encontrado`);
        return;
      }
      res.status(200).send(camion);
    } catch (error) {
      res.status(500).send(`Error al consultar al Camion: ${error}`);
    }
  }

  private async putActualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { placas, modelo, idMongoLocalzacion } = req.body;
      const camion = await db.Camion.findByPk(id);
      if (!camion) {
        res.status(404).send(`Camion con id ${id} no encontrado`);
        return;
      }

      camion.placas = placas;
      camion.modelo = modelo;
      camion.idMongoLocalzacion = idMongoLocalzacion;
      await camion.save();
      res.status(200).send(camion);
    } catch (error) {
      res.status(500).send(`Error al actualizar el Camion: ${error}`);
    }
  }

  private async deletePorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const camion = await db.Camion.findByPk(id);
      if (!camion) {
        res.status(404).send(`Usuario con id ${id} no encontrado`);
      }
      await camion.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).send(`Error al eliminar al Camion: ${error}`);
    }
  }
}

export default CamionController;
