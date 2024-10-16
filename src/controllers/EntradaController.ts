import { Request, Response } from "express";
import AbstractController from "./AbstractController";

class EntradaController extends AbstractController {
  private static _instance: EntradaController;
  public static get instance(): EntradaController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new EntradaController("entrada");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).send("Entrada Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Entrada ${error}`);
    }
  }
}

export default EntradaController;
