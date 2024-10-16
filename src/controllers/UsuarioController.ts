import { Request, Response } from "express";
import AbstractController from "./AbstractController";

class UsuarioController extends AbstractController {
  private static _instance: UsuarioController;
  public static get instance(): UsuarioController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new UsuarioController("usuario");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).send("Usuario Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el Usuario ${error}`);
    }
  }
}

export default UsuarioController;
