import { Request, Response } from "express";
import AbstractController from "./AbstractController";

class CasetaController extends AbstractController {
  private static _instance: CasetaController;
  public static get instance(): CasetaController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new CasetaController("caseta");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).send("Caseta Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Caseta ${error}`);
    }
  }
}

export default CasetaController;
