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

  // Método protegido donde añadimos todas nuestras rutas y las ligamos con los métodos generados
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
      * Prueba de conexión con el controlador.
      *
      * @param req - Objeto de solicitud HTTP.
      * @param res - Objeto de respuesta HTTP.
      * @returns Mensaje indicando que la conexión funciona o un mensaje de error.
    */

    try {
      res.status(200).send("Salida Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Salida ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    /**
      * Crea un nuevo registro de salida en la base de datos.
      *
      * @param req - Objeto de solicitud HTTP que debe contener en `req.body`:
      *   - `idCamion` (number): ID del camión relacionado.
      *   - `idContenedor` (number): ID del contenedor relacionado.
      *   - `idUsuarioCaseta` (number): ID del usuario que realiza la operación.
      *   - `fecha` (string): Fecha de la salida.
      * @param res - Objeto de respuesta HTTP.
      * @returns El registro creado o un mensaje de error.
    */

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
    /**
      * Obtiene todos los registros de salida almacenados en la base de datos.
      *
      * @param req - Objeto de solicitud HTTP.
      * @param res - Objeto de respuesta HTTP.
      * @returns Lista de registros de salida o un mensaje de error.
    */

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
    /**
      * Obtiene un registro de salida por su ID.
      *
      * @param req - Objeto de solicitud HTTP que debe contener en `req.params`:
      *   - `id` (number): ID del registro de salida a buscar.
      * @param res - Objeto de respuesta HTTP.
      * @returns El registro encontrado o un mensaje de error si no se encuentra.
    */

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
    /**
      * Actualiza un registro de salida existente por su ID.
      *
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - En `req.params`:
      *     - `id` (number): ID del registro de salida a actualizar.
      *   - En `req.body`:
      *     - `idCamion` (number): ID del camión relacionado.
      *     - `idContenedor` (number): ID del contenedor relacionado.
      *     - `idUsuarioCaseta` (number): ID del usuario que realiza la operación.
      *     - `fecha` (string): Fecha de la salida.
      * @param res - Objeto de respuesta HTTP.
      * @returns El registro actualizado o un mensaje de error si no se encuentra.
    */

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
    /**
      * Elimina un registro de salida por su ID.
      *
      * @param req - Objeto de solicitud HTTP que debe contener en `req.params`:
      *   - `id` (number): ID del registro de salida a eliminar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Un mensaje de confirmación si se elimina correctamente o un mensaje de error si no se encuentra.
    */

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
