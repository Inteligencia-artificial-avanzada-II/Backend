import { Request, Response } from "express";
import AbstractController from "./AbstractController";

class ContenedorController extends AbstractController {
  private static _instance: ContenedorController;
  public static get instance(): ContenedorController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new ContenedorController("contenedor");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).send("Contenedor works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el Contenedor ${error}`);
    }
  }
}

export default ContenedorController;
