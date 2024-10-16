import { Request, Response } from "express";
import AbstractController from "./AbstractController";

class UsuarioCasetaController extends AbstractController {
  private static _instance: UsuarioCasetaController;
  public static get instance(): UsuarioCasetaController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new UsuarioCasetaController("usuarioCaseta");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).send("UsuarioCaseta Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el UsuarioCaseta ${error}`);
    }
  }
}

export default UsuarioCasetaController;
