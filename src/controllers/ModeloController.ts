import { Request, Response } from "express";
import AbstractController from "./AbstractController";

class ModeloController extends AbstractController {
  private static _instance: ModeloController;
  public static get instance(): ModeloController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new ModeloController("modelo");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).send("Modelo Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el Modelo ${error}`);
    }
  }
}

export default ModeloController;
