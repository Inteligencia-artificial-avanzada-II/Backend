import e, { Request, Response } from "express";
import axios from "axios";
import moment from "moment-timezone";
import AbstractController from "./AbstractController";
import db from "../models";
import { validateTokenMiddleware } from "../middlewares/validateToken";
import PuertaContenedorController from "./PuertaContenedorController";
import ListaPrioridadContenedorController from "./NoSql/ListaPrioridadContenedorController";
import FosaController from "./NoSql/FosaController";
import config from "../config/config";
import OrdenController from "./OrdenController";
import ContenedorController from "./ContenedorController";
import { getIo, getClients, getFrontendAdmins } from "../io/io";

class PuertaController extends AbstractController {
  // Variables globales para manejar la cola de acomodo de contenedores en puertas disponibles
  private static processingQueue: number[] = [];
  private static isProcessing = false;

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
      const { idOrden } = req.body;
      const { idContenedor } = req.body;
      const { status } = req.body;
      const puerta = await db.Puerta.findByPk(id);
      if (puerta) {
        await puerta.update({ isOccupied: false }, { where: { idPuerta: id } });
        const ordenInstance = OrdenController.instance;
        const ordenInactiva = await ordenInstance.ordenInactiva(idOrden);
        const contenedorInstance = ContenedorController.instance;
        const contenedorDisponible = await contenedorInstance.ActualizarStatus(
          idContenedor,
          status
        );
        const puertaContenedorInstance = PuertaContenedorController.instance;
        const puertaContenedor =
          await puertaContenedorInstance.actualizarPuertaContenedor(
            id,
            idContenedor
          );

        const camionDesocupado =
          ordenInstance.actualizarEstadoCamionFinal(idOrden);
        console.log(camionDesocupado);
        console.log(puertaContenedor);
        console.log(ordenInactiva);
        console.log(contenedorDisponible);
        return res.status(200).json(puerta);
      } else {
        return res.status(404).send("Puerta no encontrada");
      }
    } catch (error) {
      return res.status(500).send(`Error al actualizar la Puerta ${error}`);
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
          message:
            "Los parámetros 'idContenedor' y 'dateTime' son obligatorios.",
        });
      }

      // Validar formato de dateTime
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          message: "El formato de 'dateTime' no es válido. Debe ser ISO 8601.",
        });
      }

      // Esperar mientras isProcessing es true
      await this.waitForProcessing();

      // Obtener puertas disponibles
      const puertas = await db.Puerta.findAll({
        where: { isOccupied: false },
      });

      if (puertas.length === 0) {
        const fosaControlador = FosaController.instance;

        try {
          // Añadimos el contenedor a la fosa
          console.log(dateTime, idContenedor);
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

  // Función auxiliar para esperar mientras isProcessing es true
  private async waitForProcessing() {
    while (PuertaController.isProcessing) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Esperar 500ms
    }
  }

  // Métodos públicos

  public async puertaDisponible(idPuerta: number): Promise<void> {
    // Agregar a la cola
    PuertaController.processingQueue.push(idPuerta);
    console.log(`Puerta ${idPuerta} agregada a la cola.`);

    // Si ya hay un proceso en ejecución, salimos
    if (PuertaController.isProcessing) {
      return;
    }

    // Procesar la cola
    PuertaController.isProcessing = true;
    while (PuertaController.processingQueue.length > 0) {
      const currentPuerta = PuertaController.processingQueue.shift();
      console.log(`Procesando Puerta ${currentPuerta}...`);

      // Obteniendo el siguiente contenedor a acomodar
      const listaPrioridadContenedor =
        ListaPrioridadContenedorController.instance;
      const listasPrioridadContenedor =
        await listaPrioridadContenedor.consultarListaPrioridadContenedor();

      // Verificar que haya elementos en la lista y obtener el primer elemento
      const contenedorPrioritario =
        listasPrioridadContenedor.length > 0
          ? listasPrioridadContenedor[0].toString()
          : null;

      if (contenedorPrioritario && typeof contenedorPrioritario === "string") {
        try {
          await listaPrioridadContenedor.eliminarContenedor(
            contenedorPrioritario ? contenedorPrioritario : "noContainer"
          );

          const dateTimeForSend = moment
            .tz("America/Mexico_City")
            .format("YYYY-MM-DDTHH:mm:ss[Z]");

          const contenedorPrioritarioNumero = Number(contenedorPrioritario);

          if (isNaN(contenedorPrioritarioNumero)) {
            console.log("El contenedor prioritario no es un número válido.");
          } else {
            const acomodaContenedorObject = await this.acomodarContenedor(
              contenedorPrioritarioNumero,
              dateTimeForSend,
              config.development.tokenNoExp
            );

            if (!acomodaContenedorObject) {
              console.log("No se pudo acomodar el contenedor")
              return;
            }
          }

          // Inicialización de IO
          const io = getIo();
          const clients = getClients(); // Obtener el mapa de clientes registrados
          const frontendAdmins = getFrontendAdmins(); // Obtenemos todos los clientes que estén conectados desde la web

          // Buscar el socket ID del cliente basado en el uniqueId (contenedorPrioritario)
          const socketId = clients.get(
            `contenedor-${contenedorPrioritarioNumero}`
          );

          if (socketId) {
            // Emitir el evento solo al cliente específico
            io.to(socketId).emit("puertaDesocupada", {
              idPuerta: currentPuerta,
            });
            console.log(
              `Evento 'puertaDesocupada' emitido al cliente ${contenedorPrioritario} para la puerta ${currentPuerta}`
            );
            frontendAdmins.forEach((socketId) => {
              io.to(socketId).emit("puertaDesocupada", { idPuerta: currentPuerta });
              console.log(`Evento 'puertaDesocupada' enviado al frontend-admin con socket ID: ${socketId}`);
            });
          } else {
            console.log(
              `Cliente con ID único ${contenedorPrioritario} no encontrado.`
            );
          }
        } catch (error) {
          console.error(`Error al procesar la Puerta ${currentPuerta}:`, error);
        }
      }
    }

    // Liberar el bloqueo
    PuertaController.isProcessing = false;
    console.log("Procesamiento de cola completado.");

    return;
  }

  public async acomodarContenedor(
    idContenedor: number,
    dateTime: string,
    authorizationToken: string
  ): Promise<any> {
    const pythonUrl = config.development.backPython;

    // Validar los parámetros de entrada
    if (!idContenedor || !dateTime) {
      throw new Error(
        "Los parámetros 'idContenedor' y 'dateTime' son obligatorios."
      );
    }

    // Validar formato de dateTime
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
      throw new Error(
        "El formato de 'dateTime' no es válido. Debe ser ISO 8601."
      );
    }

    // Obtener puertas disponibles
    const puertas = await db.Puerta.findAll({
      where: { isOccupied: false },
    });

    if (puertas.length === 0) {
      const fosaControlador = FosaController.instance;

      try {
        console.log(dateTime, idContenedor.toString());
        // Añadir el contenedor a la fosa
        await fosaControlador.agregarContenedorDirecto(
          dateTime,
          idContenedor.toString()
        );

        // Realizar la petición al modelo de predicción
        const headersForSent = {
          "Content-Type": "application/json",
          Authorization: `Token ${authorizationToken}`,
        };

        const dataForSent = {
          extraData: [],
        };

        const responseModelo = await axios.post(
          `${pythonUrl}/predictions/predict`,
          dataForSent,
          { headers: headersForSent }
        );

        const lista = responseModelo.data.data;

        return {
          message: "Ordenamiento generado exitosamente",
          data: lista,
        };
      } catch (error) {
        console.error("Error en el modelo de predicción o la fosa:", error);
        throw new Error(
          `Lo sentimos, ocurrió un error con el modelo o la fosa: ${error}`
        );
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

        return { puerta, puertacontenedor };
      } catch (error) {
        console.error("Error al asignar contenedor a la puerta:", error);
        throw new Error(`Error al asignar contenedor a la puerta: ${error}`);
      }
    }
  }
}

export default PuertaController;
