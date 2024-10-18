import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

class CasetaController extends AbstractController {
  private static _instance: CasetaController;
  public static get instance(): CasetaController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new CasetaController("caseta");
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
      res.status(200).send("Caseta Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Caseta ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const { idCedis, number, name } = req.body;
      const caseta = await db.Caseta.create({
        idCedis,
        number,
        name,
      });

      res.status(201).send(caseta);
    } catch (error) {
      res.status(500).send(`Error al crear la Caseta ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const casetas = await db.Caseta.findAll();
      res.status(200).json(casetas);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar las Casetas: ${error}` });
    }
  }

  private async getPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const caseta = await db.Caseta.findByPk(id);
      if (!caseta) {
        res.status(404).send(`Caseta con id ${id} no encontrada`);
        return;
      }
      res.status(200).send(caseta);
    } catch (error) {
      res.status(500).send(`Error al consultar la Caseta: ${error}`);
    }
  }

  private async putActualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { idCedis, number, name } = req.body;
      const caseta = await db.Caseta.findByPk(id);
      if (!caseta) {
        res.status(404).send(`Caseta con id ${id} no encontrado`);
        return;
      }
      caseta.idCedis = idCedis;
      caseta.number = number;
      caseta.name = name;
      await caseta.save();
      res.status(200).send(caseta);
    } catch (error) {
      res.status(500).send(`Error al actualizar la Caseta: ${error}`);
    }
  }

  private async deletePorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const caseta = await db.Caseta.findByPk(id);
      if (!caseta) {
        res.status(404).send(`Caseta con id ${id} no encontrado`);
        return;
      }
      await caseta.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).send(`Error al eliminar la Caseta: ${error}`);
    }
  }
}

export default CasetaController;
