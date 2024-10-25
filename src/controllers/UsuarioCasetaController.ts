import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

class UsuarioCasetaController extends AbstractController {
  private static _instance: UsuarioCasetaController;
  public static get instance(): UsuarioCasetaController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new UsuarioCasetaController("usuarioCaseta");
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
      res.status(200).send("UsuarioCaseta Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el UsuarioCaseta ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const { idUsuario, idCaseta } = req.body;
      const usuarioCaseta = await db.UsuarioCaseta.create({
        idUsuario,
        idCaseta,
      });

      res.status(201).send(usuarioCaseta);
    } catch (error) {
      res.status(500).send(`Error al crear el UsuarioCaseta ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const usuariosCaseta = await db.UsuarioCaseta.findAll();
      res.status(200).json(usuariosCaseta);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar los Usuarios Caseta: ${error}` });
    }
  }

  private async getPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const usuarioCaseta = await db.UsuarioCaseta.findByPk(id);
      if (!usuarioCaseta) {
        res.status(404).send(`UsuarioCaseta con id ${id} no encontrado`);
        return;
      }
      res.status(200).send(usuarioCaseta);
    } catch (error) {
      res.status(500).send(`Error al consultar el UsuarioCaseta: ${error}`);
    }
  }

  private async putActualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { idUsuario, idCaseta } = req.body;
      const usuarioCaseta = await db.UsuarioCaseta.findByPk(id);
      if (!usuarioCaseta) {
        res.status(404).send(`UsuarioCaseta con id ${id} no encontrado`);
        return;
      }
      usuarioCaseta.idUsuario = idUsuario;
      usuarioCaseta.idCaseta = idCaseta;
      await usuarioCaseta.save();
      res.status(200).send(usuarioCaseta);
    } catch (error) {
      res.status(500).send(`Error al actualizar el UsuarioCaseta: ${error}`);
    }
  }

  private async deletePorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const usuarioCaseta = await db.UsuarioCaseta.findByPk(id);
      if (!usuarioCaseta) {
        res.status(404).send(`UsuarioCaseta con id ${id} no encontrado`);
        return;
      }
      await usuarioCaseta.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).send(`Error al eliminar el UsuarioCaseta: ${error}`);
    }
  }
}

export default UsuarioCasetaController;
