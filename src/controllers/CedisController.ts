import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { validateTokenMiddleware } from "../middlewares/validateToken";

class CedisController extends AbstractController {
  /**
   * Controlador para gestionar las operaciones relacionadas con los CEDIS en la base de datos.
   * 
   * * Métodos:
   * @method getTest Prueba de conexión con el controlador.
   * @method postCrear Crea un nuevo CEDIS en la base de datos.
   * @method getTodos Obtiene todos los CEDIS almacenados.
   * @method getPorId Obtiene un CEDIS por su ID.
   * @method putActualizar Actualiza los detalles de un CEDIS por su ID.
   * @method deletePorId Elimina un CEDIS de la base de datos por su ID.
   */

  private static _instance: CedisController;
  public static get instance(): CedisController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new CedisController("cedis");
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
      res.status(200).send("Cedis Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el Cedis ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    /**
     * Crea un nuevo CEDIS en la base de datos.
     * 
     * @param {Request} req - Petición HTTP que contiene los datos del CEDIS en `req.body`.
     * @param {string} req.body.name - El nombre del CEDIS.
     * @param {string} req.body.address - La dirección del CEDIS.
     * @param {string} req.body.phone - El número de teléfono del CEDIS.
     * @returns {dict} - Diccionario con los detalles del CEDIS creado.
     */


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
    /**
     * Obtiene todos los CEDIS de la base de datos.
     * 
     * @param req - None.
     * @returns {dict} - Diccionario con todos los CEDIS.
     */

    try {
      const cedis = await db.Cedis.findAll();
      res.status(200).json(cedis);
    } catch (error) {
      res.status(500).json({ error: `Error al consultar los Cedis: ${error}` });
    }
  }

  private async getPorId(req: Request, res: Response) {
    /**
     * Obtiene un CEDIS de la base de datos por su ID.
     * 
     * @param req - Contiene el ID del CEDIS en los parámetros de la URL.
     * @returns {dict} - Diccionario con los detalles del CEDIS, o un mensaje de error si no se encuentra.
     */

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
    /**
     * Actualiza un CEDIS en la base de datos por su ID.
     * 
     * @param req - Contiene el ID del CEDIS en los parámetros de la URL y los datos actualizados en el cuerpo de la petición.
     * @returns {dict} - Diccionario con los detalles del CEDIS actualizado o un mensaje de error si no se encuentra.
     */

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
    /**
     * Elimina un CEDIS de la base de datos por su ID.
     * 
     * @param req - Contiene el ID del CEDIS en los parámetros de la URL.
     * @returns {dict} - Diccionario vacío si la eliminación es exitosa o un mensaje de error si no se encuentra.
     */

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
