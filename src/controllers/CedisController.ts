import { Request, Response } from "express";
import AbstractController from "./AbstractController";
// import CedisModel from "../models/CedisModel";

class CedisController extends AbstractController {
  private static _instance: CedisController;
  public static get instance(): CedisController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new CedisController("cedis");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).send("Cedis Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el Cedis ${error}`);
    }
  }
}

export default CedisController;
