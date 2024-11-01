import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import MongoProductosController from "./NoSql/MongoProductosController";
import { or } from "sequelize";

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
    this.router.post("/crear", this.postCrear.bind(this));
    this.router.get("/consultarTodos", this.getTodos.bind(this));
    this.router.get("/consultar/:id", this.getPorId.bind(this));
    this.router.get("/consultarqr/:id", this.getPorIdCodigoQr.bind(this));
    this.router.put("/actualizar/:id", this.putActualizar.bind(this));
    this.router.delete("/eliminar/:id", this.deletePorId.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    /**
    * Prueba de conexión con el controlador
    * @param - None
    * @returns - None
    */
    try {
      res.status(200).send("Orden Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Orden ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const { sqlData, mongoData } = req.body;

      // Validaciones de sqlData
      const sqlRequiredFields = ["idContenedor", "idCamion", "origen", "idCedis"];
      for (const field of sqlRequiredFields) {
        if (!sqlData || !sqlData[field]) {
          return res.status(400).send(`El campo ${field} es obligatorio en sqlData.`);
        }
      }

      // Validaciones de mongoData
      const mongoRequiredFields = ["orderNumber", "createdBy", "modifiedBy", "creationDate", "products"];
      for (const field of mongoRequiredFields) {
        if (!mongoData || !mongoData[field]) {
          return res.status(400).send(`El campo ${field} es obligatorio en mongoData.`);
        }
      }

      // Validación adicional para los productos en mongoData
      if (!Array.isArray(mongoData.products) || mongoData.products.length === 0) {
        return res.status(400).send("El campo products debe ser un arreglo no vacío en mongoData.");
      }

      // Validaciones para cada producto dentro del arreglo products
      const productRequiredFields = [
        "itemCode", "itemDescription", "originalOrderQuantity", "requestedQuantity", "assignedQuantity",
        "packedQuantity", "orderDetailStatus", "expirationDateComprobante", "barcode", "salePrice",
        "alternativeItemCodes", "unitOfMeasure"
      ];

      for (const product of mongoData.products) {
        for (const field of productRequiredFields) {
          if (!product[field]) {
            return res.status(400).send(`El campo ${field} es obligatorio en cada producto de mongoData.products.`);
          }
        }
      }

      // Crear la orden en MongoDB usando el controlador
      const mongoController = MongoProductosController.instance;
      const mongoOrder = await mongoController.createOrder(mongoData);

      if (!mongoOrder) {
        return res.status(500).send("Error al crear la Orden en MongoDB");
      }

      // Crear la orden en SQL e incluir el idMongoProductos
      const orden = await db.Orden.create({
        ...sqlData,
        idMongoProductos: mongoOrder._id.toString() // Guardamos el ID de MongoDB en SQL
      });

      // Respuesta con las órdenes creadas en SQL y MongoDB
      res.status(201).send({
        message: "Orden generada exitosamente",
        data: { sqlOrden: orden, mongoOrden: mongoOrder }
      });
    } catch (error) {
      res.status(500).send(`Error al crear la Orden: ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const ordenes = await db.Orden.findAll();
      res.status(200).json(ordenes);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar las Ordenes: ${error}` });
    }
  }

  private async getPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orden = await db.Orden.findByPk(id);
      if (!orden) {
        res.status(404).send(`Orden con id ${id} no encontrada`);
        return;
      }
      res.status(200).send(orden);
    } catch (error) {
      res.status(500).send(`Error al consultar la Orden: ${error}`);
    }
  }

  private async getPorIdCodigoQr(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orden = await db.Orden.findByPk(id);

      const mongoController = MongoProductosController.instance;
      const ordenMongo = await mongoController.getOrderById(orden.idMongoProductos)

      if (!orden) {
        res.status(404).send(`Orden con id ${id} no encontrada`);
        return;
      }
      res.status(200).json({
        sqlData: orden,
        mongoData: ordenMongo
      });
    } catch (error) {
      res.status(500).send(`Error al consultar la Orden: ${error}`);
    }
  }

  private async putActualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { idContenedor, idCamion, origen, idCedis, idMongoProductos } =
        req.body;
      const orden = await db.Orden.findByPk(id);
      if (!orden) {
        res.status(404).send(`Orden con id ${id} no encontrada`);
        return;
      }
      orden.idContenedor = idContenedor;
      orden.idCamion = idCamion;
      orden.origen = origen;
      orden.idCedis = idCedis;
      orden.idMongoProductos = idMongoProductos;
      await orden.save();
      res.status(200).send(orden);
    } catch (error) {
      res.status(500).send(`Error al actualizar la Orden: ${error}`);
    }
  }

  private async deletePorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orden = await db.Orden.findByPk(id);
      if (!orden) {
        res.status(404).send(`Orden con id ${id} no encontrada`);
        return;
      }
      await orden.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).send(`Error al eliminar la Orden: ${error}`);
    }
  }
}

export default OrdenController;
