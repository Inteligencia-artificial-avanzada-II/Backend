import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import MongoProductosController from "./NoSql/MongoProductosController";
import QrController from "./QrController";
import { toString } from "qrcode";
import { validateTokenMiddleware } from "../middlewares/validateToken";
import UsuarioController from "./UsuarioController";
import { validateJWT } from "../utils/jwt";

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
    this.router.get("/test", validateTokenMiddleware, this.getTest.bind(this));
    this.router.post("/crear", validateTokenMiddleware, this.postCrear.bind(this));
    this.router.get("/consultarTodos", validateTokenMiddleware, this.getTodos.bind(this));
    this.router.get("/consultar/:id", validateTokenMiddleware, this.getPorId.bind(this));
    this.router.get("/consultarqr/:id", validateTokenMiddleware, this.getPorIdCodigoQr.bind(this));
    this.router.put("/actualizar/:id", validateTokenMiddleware, this.putActualizar.bind(this));
    this.router.delete("/eliminar/:id", validateTokenMiddleware, this.deletePorId.bind(this));
    this.router.get("/consultarQrUrl/:id", validateTokenMiddleware, this.getQrUrl.bind(this));
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
      const sqlRequiredFields = [
        "idContenedor",
        "idCamion",
        "origen",
        "idCedis",
      ];
      for (const field of sqlRequiredFields) {
        if (!sqlData || !sqlData[field]) {
          return res
            .status(400)
            .send(`El campo ${field} es obligatorio en sqlData.`);
        }
      }

      // Validaciones de mongoData
      const mongoRequiredFields = [
        "orderNumber",
        "createdBy",
        "modifiedBy",
        "creationDate",
        "products",
      ];
      for (const field of mongoRequiredFields) {
        if (!mongoData || !mongoData[field]) {
          return res
            .status(400)
            .send(`El campo ${field} es obligatorio en mongoData.`);
        }
      }

      // Validación adicional para los productos en mongoData
      if (
        !Array.isArray(mongoData.products) ||
        mongoData.products.length === 0
      ) {
        return res
          .status(400)
          .send("El campo products debe ser un arreglo no vacío en mongoData.");
      }

      // Validaciones para cada producto dentro del arreglo products
      const productRequiredFields = [
        "itemCode",
        "itemDescription",
        "requestedQuantity",
        "salePrice",
      ];

      for (const product of mongoData.products) {
        for (const field of productRequiredFields) {
          if (!product[field]) {
            return res
              .status(400)
              .send(
                `El campo ${field} es obligatorio en cada producto de mongoData.products.`
              );
          }
        }
      }

      const jwtDecoded = await validateJWT(mongoData.createdBy)
      const idUser = jwtDecoded ? jwtDecoded.idUsuario : null
      if (!idUser){
        res.json({message: "El token enviado no es válido", data: {}})
      }
      const userInstance = UsuarioController.instance;
      const userId = await userInstance.getPublicPorId(idUser)

      if (!userId){
        res.json({message: "El usuario no fue encontrado", data: {}})
      }

      mongoData.createdBy = userId
      mongoData.modifiedBy = userId

      // Crear la orden en MongoDB usando el controlador
      const mongoController = MongoProductosController.instance;
      const mongoOrder = await mongoController.createOrder(mongoData);

      if (!mongoOrder) {
        return res.status(500).send("Error al crear la Orden en MongoDB");
      }

      // Crear la orden en SQL e incluir el idMongoProductos
      const orden = await db.Orden.create({
        ...sqlData,
        idMongoProductos: mongoOrder._id.toString(), // Guardamos el ID de MongoDB en SQL
      });

      const instanceQrController = QrController.instance;

      const qrCodeResponse = await instanceQrController.postCrearYSubirPublic(orden.idOrden.toString(), res)

      // Respuesta con las órdenes creadas en SQL y MongoDB
      res.status(201).send({
        message: "Orden generada exitosamente",
        data: { sqlOrden: orden, mongoOrden: mongoOrder, qrCode: qrCodeResponse },
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
      const ordenMongo = await mongoController.getOrderById(
        orden.idMongoProductos
      );

      if (!orden) {
        res
          .status(404)
          .json({ message: `Orden con id ${id} no encontrada`, data: {} });
        return;
      }
      res.status(200).json({
        message: "Datos obtenidos exitosamente",
        data: {
          sqlData: orden,
          mongoData: ordenMongo,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error al consultar la Orden: ${error}`, data: {} });
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

  private async getQrUrl(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Busca todas las órdenes activas con el ID dado
      const ordenesActivas = await db.Orden.findAll({
        where: {
          idContenedor: id,
          isActive: true,
        },
        order: [["idOrden", "DESC"]]
      });

      // Verifica si no existen órdenes activas
      if (ordenesActivas.length === 0) {
        return res
          .status(404)
          .json({message: "No hay órdenes activas para el ID proporcionado.", data: {}});
      }

      // Si existen varias órdenes activas, selecciona la de mayor valor (primer resultado)
      const ordenMayorValor = ordenesActivas[0];

      // Devuelve la URL o los datos de la orden de mayor valor
      res.status(200).json({
        message: "Orden activa encontrada",
        data: ordenMayorValor,
      });
    } catch (error) {
      res.status(500).json({message: `Error al consultar las órdenes activas: ${error}`, data: {}});
    }
  }
}

export default OrdenController;
