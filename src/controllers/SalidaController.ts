import { Request, Response } from "express";
import AbstractController from "./AbstractController";

class SalidaController extends AbstractController {
  private static _instance: SalidaController;
  public static get instance(): SalidaController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new SalidaController("salida");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).send("Salida Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Salida ${error}`);
    }
  }
}

export default SalidaController;
