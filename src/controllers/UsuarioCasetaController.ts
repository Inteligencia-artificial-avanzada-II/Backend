import { Request, Response } from "express";
import axios from "axios";
import AbstractController from "./AbstractController";
import db from "../models";
import { validateTokenMiddleware } from "../middlewares/validateToken";
import { BACK_PYTHON } from "../config";

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
    this.router.get("/test", validateTokenMiddleware, this.getTest.bind(this));
    this.router.post("/crear", validateTokenMiddleware, this.postCrear.bind(this));
    this.router.get("/consultarTodos", validateTokenMiddleware, this.getTodos.bind(this));
    this.router.get("/consultar/:id", validateTokenMiddleware, this.getPorId.bind(this));
    this.router.put("/actualizar/:id", validateTokenMiddleware, this.putActualizar.bind(this));
    this.router.delete("/eliminar/:id", validateTokenMiddleware, this.deletePorId.bind(this));
    this.router.get("/pruebapython", validateTokenMiddleware, this.testPythonBack.bind(this))
  }

  private async testPythonBack(req: Request, res: Response) {
    try {
      console.log("RequestPython recibido")
      const token = req.headers.authorization || "{{Token}}";

      const response = await axios.get(`${BACK_PYTHON}/predictions/test`,  {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      console.log("Si pasó")
      // Enviar la respuesta del backend de Python al cliente
      res.status(response.status).json({"Message": "OK"});
    } catch (error: any) {
      // Manejo de errores
      res.status(error.response?.status || 500).json({
        message: "Error al conectar con el backend de Python",
        error: error.message
      });
    }
  };

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
