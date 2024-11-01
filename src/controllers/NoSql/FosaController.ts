import { Request, Response } from "express";
import { MongoFosasModel } from "../../models/NoSql/FosaModel";
import AbstractController from "../AbstractController";

class FosaController extends AbstractController {
  private static _instance: FosaController;
  private model = MongoFosasModel;

  public static get instance(): FosaController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new FosaController("fosa");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
    this.router.post("/crear", this.postCrear.bind(this));
    // this.router.get('/consultarTodos', this.getTodos.bind(this));
    // this.router.get('/consultar/:id', this.getPorId.bind(this));
    // this.router.put('/actualizar/:id', this.putActualizar.bind(this));
    // this.router.delete('/eliminar/:id', this.deletePorId.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    /**
     * Prueba de conexión con el controlador
     * @param - None
     * @returns - None
     */
    try {
      res.status(200).send("Fosa works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Fosa: ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const { fosas } = req.body; // Recibimos un array de fosas desde el request

      if (!Array.isArray(fosas) || fosas.length === 0) {
        return res
          .status(400)
          .send("El cuerpo de la petición debe contener un array 'fosas'.");
      }

      // Creamos el documento en la base de datos con el array de fosas
      const fosaDocument = await this.model.create({
        fosas,
      });

      res.status(201).send(fosaDocument);
    } catch (error) {
      console.error("Error al crear el documento de fosas:", error);
      res.status(500).send(`Error al crear el documento de fosas: ${error}`);
    }
  }
}

export default FosaController;
