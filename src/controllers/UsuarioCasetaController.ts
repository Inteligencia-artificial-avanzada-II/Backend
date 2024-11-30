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

  // Método protegido donde añadimos todas nuestras rutas y las ligamos con los métodos generados
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
    /**
      * Prueba de conexión con el backend de Python.
      *
      * @param req - Objeto de solicitud HTTP.
      *   - Headers:
      *     - `Authorization`: Token necesario para la autenticación con el backend de Python.
      * @param res - Objeto de respuesta HTTP.
      * @returns Respuesta del backend de Python o un mensaje de error si no se puede conectar.
    */

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
      * Prueba de conexión con el controlador.
      *
      * @param req - Objeto de solicitud HTTP.
      * @param res - Objeto de respuesta HTTP.
      * @returns Mensaje indicando que la conexión funciona o un mensaje de error.
    */

    try {
      res.status(200).send("UsuarioCaseta Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el UsuarioCaseta ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    /**
      * Crea un nuevo registro de UsuarioCaseta en la base de datos.
      *
      * @param req - Objeto de solicitud HTTP que debe contener en `req.body`:
      *   - `idUsuario` (number): ID del usuario relacionado.
      *   - `idCaseta` (number): ID de la caseta relacionada.
      * @param res - Objeto de respuesta HTTP.
      * @returns El registro creado o un mensaje de error.
    */

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
    /**
      * Obtiene todos los registros de UsuarioCaseta almacenados en la base de datos.
      *
      * @param req - Objeto de solicitud HTTP.
      * @param res - Objeto de respuesta HTTP.
      * @returns Lista de registros de UsuarioCaseta o un mensaje de error.
    */

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
    /**
      * Obtiene un registro de UsuarioCaseta por su ID.
      *
      * @param req - Objeto de solicitud HTTP que debe contener en `req.params`:
      *   - `id` (number): ID del registro de UsuarioCaseta a buscar.
      * @param res - Objeto de respuesta HTTP.
      * @returns El registro encontrado o un mensaje de error si no se encuentra.
    */

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
    /**
      * Actualiza un registro de UsuarioCaseta existente por su ID.
      *
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - En `req.params`:
      *     - `id` (number): ID del registro de UsuarioCaseta a actualizar.
      *   - En `req.body`:
      *     - `idUsuario` (number): Nuevo ID del usuario relacionado.
      *     - `idCaseta` (number): Nuevo ID de la caseta relacionada.
      * @param res - Objeto de respuesta HTTP.
      * @returns El registro actualizado o un mensaje de error si no se encuentra.
    */

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
    /**
      * Elimina un registro de UsuarioCaseta por su ID.
      *
      * @param req - Objeto de solicitud HTTP que debe contener en `req.params`:
      *   - `id` (number): ID del registro de UsuarioCaseta a eliminar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Un mensaje de confirmación si se elimina correctamente o un mensaje de error si no se encuentra.
    */

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
