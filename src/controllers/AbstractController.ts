import { Router } from "express";

export default abstract class AbstractController {
  //Atributos de la instancia
  private _router: Router;
  private _prefix: string;
  //Metodos getter
  public get router(): Router {
    return this._router;
  }
  public get prefix(): string {
    return this._prefix;
  }
  //Metodo constructor
  protected constructor(prefix: string) {
    this._router = Router();
    this._prefix = prefix;
    this.initializeRoutes();
  }
  //Metodo abstracto (debe ser implementado en las clases hijas)
  protected abstract initializeRoutes(): void;
}
