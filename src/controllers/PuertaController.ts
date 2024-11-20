import e, { Request, Response } from "express";
import axios from "axios";
import AbstractController from "./AbstractController";
import db from "../models";
import { validateTokenMiddleware } from "../middlewares/validateToken";
import PuertaContenedorController from "./PuertaContenedorController";
import FosaController from "./NoSql/FosaController";
import config from "../config/config";

class PuertaController extends AbstractController {
  private static _instance: PuertaController;
  public static get instance(): PuertaController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new PuertaController("puerta");
    return this._instance;
  }

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
    this.router.put(
      "/actualizarOcupado/:id",
      validateTokenMiddleware,
      this.putActualizarOcupado.bind(this)
    );
    this.router.post(
      "/acomodar",
      validateTokenMiddleware,
      this.postAcomodar.bind(this)
    );
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).send("Puerta Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Puerta ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const puerta = await db.Puerta.create(req.body);
      res.status(201).json(puerta);
    } catch (error) {
      res.status(500).send(`Error al crear la Puerta ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const puertas = await db.Puerta.findAll();
      res.status(200).json(puertas);
    } catch (error) {
      res.status(500).send(`Error al consultar las Puertas ${error}`);
    }
  }

  private async getPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const puerta = await db.Puerta.findByPk(id);
      res.status(200).json(puerta);
    } catch (error) {
      res.status(500).send(`Error al consultar la Puerta ${error}`);
    }
  }

  private async putActualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const puerta = await db.Puerta.findByPk(id);
      if (puerta) {
        await puerta.update(req.body);
        res.status(200).json(puerta);
      } else {
        res.status(404).send("Puerta no encontrada");
      }
    } catch (error) {
      res.status(500).send(`Error al actualizar la Puerta ${error}`);
    }
  }

  private async deletePorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const puerta = await db.Puerta.findByPk(id);
      if (puerta) {
        await puerta.destroy();
        res.status(204).send();
      } else {
        res.status(404).send("Puerta no encontrada");
      }
    } catch (error) {
      res.status(500).send(`Error al eliminar la Puerta ${error}`);
    }
  }

  private async putActualizarOcupado(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const puerta = await db.Puerta.findByPk(id);
      if (puerta) {
        await puerta.update({ isOcuppied: !puerta.isOcuppied });
        res.status(200).json(puerta);
      } else {
        res.status(404).send("Puerta no encontrada");
      }
    } catch (error) {
      res.status(500).send(`Error al actualizar la Puerta ${error}`);
    }
  }

  private async postAcomodar(req: Request, res: Response) {
    try {
      const pythonUrl = config.development.backPython;
      const authorizationToken =
        req.headers["authorization"]?.split("Token ")[1];
      const headersForSent = {
        "Content-Type": "application/json",
        Authorization: `Token ${authorizationToken}`,
      };
      const dataForSent = {
        extraData: [],
      };

      const { idContenedor, dateTime } = req.body;

      // Validar los parámetros de entrada
      if (!idContenedor || !dateTime) {
        return res.status(400).json({
          message: "Los parámetros 'idContenedor' y 'dateTime' son obligatorios.",
        });
      }

      // Validar formato de dateTime
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          message: "El formato de 'dateTime' no es válido. Debe ser ISO 8601.",
        });
      }

      // Obtener puertas disponibles
      const puertas = await db.Puerta.findAll({
        where: { isOccupied: false },
      });

      if (puertas.length === 0) {

        const fosaControlador = FosaController.instance;

        try {
          // Añadimos el contenedor a la fosa
          const agregarContenedor =
            await fosaControlador.agregarContenedorDirecto(
              dateTime,
              idContenedor
            );

          // Realizamos la petición al modelo de predicción
          const responseModelo = await axios.post(
            `${pythonUrl}/predictions/predict`,
            dataForSent,
            { headers: headersForSent }
          );

          const lista = responseModelo.data.data;

          res.status(200).json({
            message: "Ordenamiento generado exitosamente",
            data: lista,
          });
        } catch (error) {
          console.error("Error en el modelo de predicción o la fosa:", error);
          res.status(400).json({
            message: `Lo sentimos, ocurrió un error con el modelo o la fosa: ${error}`,
            data: {},
          });
        }
      } else {
        try {
          // Asignar contenedor a una puerta disponible
          const puerta = puertas[0];
          const PuertaContenedorControllerInstance =
            PuertaContenedorController.instance;

          const puertacontenedor =
            await PuertaContenedorControllerInstance.ContenedorEnPuerta({
              idContenedor,
              idPuerta: puerta.idPuerta,
              fecha: new Date(),
            });

          // Actualizar la puerta como ocupada
          await puerta.update({ isOccupied: true });

          res.status(200).json({ puerta, puertacontenedor });
        } catch (error) {
          console.error("Error al asignar contenedor a la puerta:", error);
          res.status(400).json({
            message: `Error al asignar contenedor a la puerta: ${error}`,
          });
        }
      }
    } catch (error) {
      console.error("Error general en postAcomodar:", error);
      res.status(500).send(`Error al acomodar la puerta: ${error}`);
    }
  }

}

export default PuertaController;
