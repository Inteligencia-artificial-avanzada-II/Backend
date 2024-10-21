import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

class QrController extends AbstractController {
  private static _instance: QrController;
  public static get instance(): QrController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new QrController("qr");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
    this.router.post("/crear", this.postCrear.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).send("Qr Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el Qr ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      console.log(req.body);
    } catch (error) {
      console.log(error);
    }
  }
}

export default QrController.instance;
