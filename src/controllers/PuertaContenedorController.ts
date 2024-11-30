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

  // Método protegido donde añadimos todas nuestras rutas y las ligamos con los métodos generados
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
    this.router.get(
      "/consultarPuerta/:idContenedor",
      validateTokenMiddleware,
      this.consultarPuerta.bind(this)
    );
  }

  private async getTest(req: Request, res: Response) {
    /**
      * Prueba de conexión con el controlador.
      *
      * @param req - Objeto de solicitud HTTP.
      * @param res - Objeto de respuesta HTTP.
      * @returns Mensaje indicando que la conexión funciona o mensaje de error.
    */

    try {
      res.status(200).send("PuertaContenedor Works");
    } catch (error) {
      res
        .status(500)
        .send(`Error al conectar con la PuertaContenedor ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    /**
      * Crea un nuevo registro de PuertaContenedor en la base de datos.
      *
      * @param req - Objeto de solicitud HTTP que debe contener en el cuerpo:
      *   - Los datos necesarios para crear un PuertaContenedor.
      * @param res - Objeto de respuesta HTTP.
      * @returns Registro creado o mensaje de error.
    */

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
    /**
      * Crea un nuevo registro de PuertaContenedor (método reutilizable).
      *
      * @param data - Objeto con los datos requeridos:
      *   - `idContenedor` (number): ID del contenedor.
      *   - `idPuerta` (number): ID de la puerta.
      *   - `fecha` (Date): Fecha del registro.
      * @returns Objeto creado o mensaje de error.
    */

    try {
      const puertacontenedor = await db.PuertaContenedor.create(data);
      return puertacontenedor; // Retorna el objeto sin enviar la respuesta
    } catch (error) {
      throw new Error(`Error al crear la PuertaContenedor: ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    /**
      * Obtiene todos los registros de PuertaContenedor de la base de datos.
      *
      * @param req - Objeto de solicitud HTTP.
      * @param res - Objeto de respuesta HTTP.
      * @returns Lista de todos los registros o mensaje de error.
    */

    try {
      const puertacontenedor = await db.PuertaContenedor.findAll();
      res.status(200).send(puertacontenedor);
    } catch (error) {
      res.status(500).send(`Error al consultar puertacontenedores ${error}`);
    }
  }

  private async getPorId(req: Request, res: Response) {
    /**
      * Obtiene un registro de PuertaContenedor por su ID.
      *
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID del registro a consultar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Registro encontrado o mensaje de error.
    */

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
    /**
      * Actualiza un registro de PuertaContenedor por su ID.
      *
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID del registro a actualizar.
      *   - Datos actualizados en el cuerpo de la solicitud (`req.body`).
      * @param res - Objeto de respuesta HTTP.
      * @returns Mensaje de éxito o mensaje de error.
    */

    try {
      await db.PuertaContenedor.update(req.body, {
        where: { idPuertaContenedor: req.params.id },
      });
      res.status(200).send("PuertaContenedor actualizada");
    } catch (error) {
      res.status(500).send(`Error al actualizar puertacontenedor ${error}`);
    }
  }

  public async actualizarPuertaContenedor(
    idPuerta: string,
    idContenedor: string
  ) {
    /**
      * Actualiza el estado de un registro activo de PuertaContenedor a inactivo.
      *
      * @param idPuerta - ID de la puerta asociada.
      * @param idContenedor - ID del contenedor asociado.
      * @returns Mensaje de éxito si la actualización es correcta o mensaje de error.
    */

    try {
      // Buscar el registro con isActive: true, idPuerta y idContenedor específicos
      const registro = await db.PuertaContenedor.findOne({
        where: {
          idPuerta,
          idContenedor,
          isActive: true,
        },
      });

      // Si no se encuentra el registro, arroja un error
      if (!registro) {
        throw new Error(
          "No se encontró un registro activo con los datos proporcionados."
        );
      }

      // Actualizar el campo isActive a false
      await registro.update({ isActive: false });

      return `Registro con idPuerta: ${idPuerta} y idContenedor: ${idContenedor} desactivado correctamente.`;
    } catch (error) {
      throw new Error(`Error al actualizar PuertaContenedor: ${error}`);
    }
  }

  private async deletePorId(req: Request, res: Response) {
    /**
      * Elimina un registro de PuertaContenedor por su ID.
      *
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID del registro a eliminar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Mensaje de éxito o mensaje de error.
    */

    try {
      await db.PuertaContenedor.destroy({ where: { id: req.params.id } });
      res.status(200).send("PuertaContenedor eliminada");
    } catch (error) {
      res.status(500).send(`Error al eliminar puertacontenedor ${error}`);
    }
  }

  private async consultarPuerta(req: Request, res: Response): Promise<void> {
    /**
      * Consulta la puerta asociada a un contenedor activo.
      *
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `idContenedor` (string en `req.params`): ID del contenedor.
      * @param res - Objeto de respuesta HTTP.
      * @returns Registro de PuertaContenedor activo o mensaje de error.
    */

    try {
      const { idContenedor } = req.params;

      // Validar que se reciba el parámetro idContenedor
      if (!idContenedor) {
        res
          .status(400)
          .json({ message: "El parámetro idContenedor es obligatorio." });
        return;
      }

      // Buscar el contenedor en la base de datos donde isActive sea true
      const contenedor = await db.PuertaContenedor.findOne({
        where: {
          idContenedor,
          isActive: true,
        },
      });

      // Validar si no se encontró ningún contenedor
      if (!contenedor) {
        res.status(404).json({
          message:
            "No se encontró ningún contenedor activo con el id proporcionado.",
        });
        return;
      }

      // Devolver el contenedor encontrado
      res.status(200).json(contenedor);
    } catch (error) {
      console.error("Error al consultar la puerta:", error);
      res
        .status(500)
        .json({ message: "Ocurrió un error al consultar la puerta.", error });
    }
  }
}

export default PuertaContenedorController;
