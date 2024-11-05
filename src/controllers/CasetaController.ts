import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { validateTokenMiddleware } from "../middlewares/validateToken";

class CasetaController extends AbstractController {
  /**
   * Controlador para gestionar las operaciones relacionadas con casetas en la base de datos.
   * 
   * * Métodos:
   * @method getTest Prueba de conexión con el controlador.
   * @method postCrear Crea una nueva caseta en la base de datos.
   * @method getTodos Obtiene todas las casetas almacenadas.
   * @method getPorId Obtiene una caseta por su ID.
   * @method putActualizar Actualiza los detalles de una caseta por su ID.
   * @method deletePorId Elimina una caseta de la base de datos por su ID.
   */

  private static _instance: CasetaController;
  public static get instance(): CasetaController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new CasetaController("caseta");
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
      res.status(200).send("Caseta Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Caseta ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    /**
     * Crea una nueva caseta en la base de datos.
     * 
     * @param {Request} req - Petición HTTP que contiene los datos de la caseta en `req.body`.
     * @param {string} req.body.idCedis - El ID del Cedis al que pertenece la caseta.
     * @param {number} req.body.number - El número de la caseta.
     * @param {string} req.body.name - El nombre de la caseta.
     * @param {Response} res - Objeto de la respuesta HTTP utilizado para enviar la respuesta al cliente.
     * @returns {Promise<void>} No devuelve ningún valor directamente. Envía una respuesta HTTP al cliente.
     */

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
    /**
     * Obtiene todas las casetas de la base de datos.
     * 
     * @param req - None.
     * @returns {dict} - Diccionario con todas las casetas.
     */

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
    /**
     * Obtiene una caseta de la base de datos por su ID.
     * 
     * @param req - Contiene el ID de la caseta en los parámetros de la URL.
     * @returns {dict} - Diccionario con los detalles de la caseta, o un mensaje de error si no se encuentra.
     */

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
    /**
     * Actualiza una caseta en la base de datos por su ID.
     * 
     * @param req - Contiene el ID de la caseta en los parámetros de la URL y los datos actualizados en el cuerpo de la petición.
     * @returns {dict} - Diccionario con los detalles de la caseta actualizada o un mensaje de error si no se encuentra.
     */

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
    /**
     * Elimina una caseta de la base de datos por su ID.
     * 
     * @param req - Contiene el ID de la caseta en los parámetros de la URL.
     * @returns {void} - No devuelve contenido si la eliminación es exitosa o un mensaje de error si no se encuentra.
     */

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
