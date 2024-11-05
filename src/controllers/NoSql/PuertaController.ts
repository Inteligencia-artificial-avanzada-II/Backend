import e, { Request, Response } from "express";
import { MongoPuertasModel } from "../../models/NoSql/PuertaModel";
import AbstractController from "../AbstractController";
import { validateTokenMiddleware } from "../../middlewares/validateToken";

class PuertaController extends AbstractController {
  private static _instance: PuertaController;
  private model = MongoPuertasModel;

  public static get instance(): PuertaController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new PuertaController("puerta");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", validateTokenMiddleware, this.getTest.bind(this));
    this.router.post(
      "/crear",
      validateTokenMiddleware,
      this.postCrear.bind(this)
    );
    // this.router.get('/consultarTodos', this.getTodos.bind(this));
    // this.router.get('/consultar/:id', this.getPorId.bind(this));
    // this.router.put('/actualizar/:id', this.putActualizar.bind(this));
    // this.router.delete('/eliminar/:id', this.deletePorId.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).send("Puerta Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Puerta ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const { puertas } = req.body;

      if (!Array.isArray(puertas) || puertas.length === 0) {
        return res
          .status(400)
          .send("El cuerpo de la petición debe contener un array 'puertas'.");
      }

      const puertaDocument = await this.model.create({
        puertas,
      });

      res.status(201).send(puertaDocument);
    } catch (error) {
      console.error("Error al crear el documento de puertas:", error);
      res.status(500).send(`Error al crear el documento de puertas: ${error}`);
    }
  }
}

export default PuertaController;
