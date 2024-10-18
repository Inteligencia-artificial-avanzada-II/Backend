import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

class CedisController extends AbstractController {
  private static _instance: CedisController;
  public static get instance(): CedisController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new CedisController("cedis");
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
      res.status(200).send("Cedis Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el Cedis ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const { name, address, phone } = req.body;
      const cedis = await db.Cedis.create({
        name,
        address,
        phone,
      });

      res.status(201).send(cedis);
    } catch (error) {
      res.status(500).send(`Error al crear Cedis ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const cedis = await db.Cedis.findAll();
      res.status(200).json(cedis);
    } catch (error) {
      res.status(500).json({ error: `Error al consultar los Cedis: ${error}` });
    }
  }

  private async getPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cedis = await db.Cedis.findByPk(id);
      if (!cedis) {
        res.status(404).send(`Cedis con id ${id} no encontrado`);
        return;
      }
      res.status(200).send(cedis);
    } catch (error) {
      res.status(500).send(`Error al consultar el Cedis: ${error}`);
    }
  }

  private async putActualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, address, phone } = req.body;
      const cedis = await db.Cedis.findByPk(id);
      if (!cedis) {
        res.status(404).send(`Cedis con id ${id} no encontrado`);
        return;
      }
      cedis.name = name;
      cedis.address = address;
      cedis.phone = phone;
      await cedis.save();
      res.status(200).send(cedis);
    } catch (error) {
      res.status(500).send(`Error al actualizar el Cedis: ${error}`);
    }
  }

  private async deletePorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cedis = await db.Cedis.findByPk(id);
      if (!cedis) {
        res.status(404).send(`Cedis con id ${id} no encontrado`);
        return;
      }
      await cedis.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).send(`Error al eliminar el Cedis: ${error}`);
    }
  }
}

export default CedisController;
