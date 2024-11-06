import e, { Request, Response } from "express";
import { MongoPuertasModel } from "../../models/NoSql/PuertaModel";
import AbstractController from "../AbstractController";
import { validateTokenMiddleware } from "../../middlewares/validateToken";
import moment from "moment";

class PuertaController extends AbstractController {
  private static _instance: PuertaController;
  private model = MongoPuertasModel;

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
    this.router.put(
      "/acomodar",
      validateTokenMiddleware,
      this.putAcomodar.bind(this)
    );
    this.router.get("/consultarTodos", this.getTodos.bind(this));
    // this.router.get('/consultar/:id', this.getPorId.bind(this));
    // this.router.put('/actualizar/:id', this.putActualizar.bind(this));
    // this.router.delete('/eliminar/:id', this.deletePorId.bind(this));
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
      const { puertas } = req.body;

      if (!Array.isArray(puertas) || puertas.length === 0) {
        return res
          .status(400)
          .send("El cuerpo de la petición debe contener un array 'puertas'.");
      }

      const puertaDocument = await this.model.create({
        puertas,
      });

      res.status(201).send(puertaDocument);
    } catch (error) {
      console.error("Error al crear el documento de puertas:", error);
      res.status(500).send(`Error al crear el documento de puertas: ${error}`);
    }
  }

  private async putAcomodar(req: Request, res: Response) {
    try {
      const { idContenedor } = req.body;

      if (!idContenedor) {
        return res.status(400).send("Debe proporcionar un 'idContenedor'.");
      }

      const fechaHoy = moment().format("DD/MM/YY");
      const horaActual = moment().format("HH:mm");

      // Busca el documento único que contiene todas las puertas
      const puertasDocument = await MongoPuertasModel.findOne();

      if (!puertasDocument) {
        return res.status(404).send("No se encontraron documentos de puertas.");
      }

      let anyUpdated = false; // Bandera para saber si se realizó alguna actualización

      // Recorre cada puerta y revisa si no está ocupada
      puertasDocument.puertas.forEach((puerta) => {
        if (!puerta.isOccupied) {
          // Inicializa el objeto daily si la fecha de hoy no existe
          if (!puerta.daily[fechaHoy]) {
            puerta.daily[fechaHoy] = {};
          }

          // Añade la entrada en daily con el formato "idContenedor-HH:MM"
          puerta.daily[fechaHoy][`${idContenedor}-${horaActual}`] = true;
          anyUpdated = true;
        }
      });

      // Guarda el documento solo si se realizó alguna actualización
      if (anyUpdated) {
        await puertasDocument.save();
        res.status(200).send("Contenedores acomodados correctamente.");
      } else {
        res
          .status(200)
          .send(
            "No se encontraron puertas desocupadas para acomodar contenedores."
          );
      }
    } catch (error) {
      console.error("Error al acomodar los contenedores:", error);
      res.status(500).send(`Error al acomodar los contenedores: ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const puertas = await this.model.find();
      res.status(200).json(puertas);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar las Puertas: ${error}` });
    }
  }
}

export default PuertaController;
