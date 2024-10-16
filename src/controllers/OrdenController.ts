import { Request, Response } from "express";
import AbstractController from "./AbstractController";

class OrdenController extends AbstractController {
  private static _instance: OrdenController;
  public static get instance(): OrdenController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new OrdenController("orden");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).send("Orden Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Orden ${error}`);
    }
  }
}

export default OrdenController;
