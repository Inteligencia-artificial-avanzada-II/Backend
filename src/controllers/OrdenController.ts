import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import MongoProductosController from "./NoSql/MongoProductosController";
import QrController from "./QrController";
import { validateTokenMiddleware } from "../middlewares/validateToken";
import UsuarioController from "./UsuarioController";
import { validateJWT } from "../utils/jwt";
import { upload } from "../config/multer";
import path from "path";
import fs from "fs";
import { ConfigFileAuthenticationDetailsProvider } from "oci-common";
import { ObjectStorageClient } from "oci-objectstorage";
import { BUCKET_NAME, BUCKET_NAMESPACE } from "../config";

class OrdenController extends AbstractController {
  private static _instance: OrdenController;
  public static get instance(): OrdenController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new OrdenController("orden");
    return this._instance;
  }

  private provider = new ConfigFileAuthenticationDetailsProvider();
  private client = new ObjectStorageClient({
    authenticationDetailsProvider: this.provider,
  });

  private namespace = BUCKET_NAMESPACE;
  private bucketName = BUCKET_NAME;

  protected initializeRoutes(): void {
    this.router.get("/test", validateTokenMiddleware, this.getTest.bind(this));
    this.router.post(
      "/crear",
      validateTokenMiddleware,
      this.postCrear.bind(this)
    );
    this.router.get(
      "/consultarTodos",
      validateTokenMiddleware,
      this.getTodos.bind(this)
    );
    this.router.get(
      "/consultar/:id",
      validateTokenMiddleware,
      this.getPorId.bind(this)
    );
    this.router.get(
      "/consultarqr/:id",
      validateTokenMiddleware,
      this.getPorIdCodigoQr.bind(this)
    );
    this.router.put(
      "/actualizar/:id",
      validateTokenMiddleware,
      this.putActualizar.bind(this)
    );
    this.router.get(
      "/localizacion/:localizacion",
      validateTokenMiddleware,
      this.getLocalizacion.bind(this)
    );
    this.router.put(
      "/actualizarLocalizacion/:id",
      validateTokenMiddleware,
      this.putActualizarLocalizacion.bind(this)
    );
    this.router.delete(
      "/eliminar/:id",
      validateTokenMiddleware,
      this.deletePorId.bind(this)
    );
    this.router.get(
      "/consultarQrUrl/:id",
      validateTokenMiddleware,
      this.getQrUrl.bind(this)
    );

    this.router.post(
      "/csvUpload",
      validateTokenMiddleware,
      upload.single("file"),
      this.postCsvUpload.bind(this)
    );

    this.router.get(
      "/consultarPorFecha",
      validateTokenMiddleware,
      this.getOrdersByDateRange.bind(this)
    );

    this.router.get(
      "/consultarIdMongo/:id",
      validateTokenMiddleware,
      this.getOrdersByIdMongo.bind(this)
    );
    this.router.get(
      "/consultarConFiltros",
      validateTokenMiddleware,
      this.getOrdersWithFilters.bind(this)
    );
  }

  private async getTest(req: Request, res: Response) {
    try {
      res.status(200).json({
        message: "Orden Works",
        data: {},
      });
    } catch (error) {
      res.status(500).json({
        message: `Error al conectar con la Orden ${error}`,
        data: {},
      });
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
        "localization",
      ];
      for (const field of sqlRequiredFields) {
        if (!sqlData || !sqlData[field]) {
          return res.status(400).json({
            message: `El campo ${field} es obligatorio en sqlData.`,
            data: {},
          });
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
          return res.status(400).json({
            message: `El campo ${field} es obligatorio en mongoData.`,
            data: {},
          });
        }
      }

      // Validación adicional para los productos en mongoData
      if (
        !Array.isArray(mongoData.products) ||
        mongoData.products.length === 0
      ) {
        return res.status(400).json({
          message:
            "El campo products debe ser un arreglo no vacío en mongoData.",
          data: {},
        });
      }

      const jwtDecoded = await validateJWT(mongoData.createdBy);
      const idUser = jwtDecoded ? jwtDecoded.idUsuario : null;
      if (!idUser) {
        return res.status(400).json({
          message: "El token enviado no es válido",
          data: {},
        });
      }

      const userInstance = UsuarioController.instance;
      const userId = await userInstance.getPublicPorId(idUser);

      if (!userId) {
        return res.status(400).json({
          message: "El usuario no fue encontrado",
          data: {},
        });
      }

      mongoData.createdBy = userId;
      mongoData.modifiedBy = userId;

      // Crear la orden en MongoDB usando el controlador
      const mongoController = MongoProductosController.instance;
      const mongoOrder = await mongoController.createOrder(mongoData);

      if (!mongoOrder) {
        return res.status(500).json({
          message: "Error al crear la Orden en MongoDB",
          data: {},
        });
      }

      console.log(sqlData);

      // Crear la orden en SQL e incluir el idMongoProductos
      const orden = await db.Orden.create({
        ...sqlData,
        idMongoProductos: mongoOrder._id.toString(), // Guardamos el ID de MongoDB en SQL
      });

      const instanceQrController = QrController.instance;

      const qrCodeResponse = await instanceQrController.postCrearYSubirPublic(
        orden.idOrden.toString(),
        res
      );

      res.status(201).json({
        message: "Orden generada exitosamente",
        data: {
          sqlOrden: orden,
          mongoOrden: mongoOrder,
          qrCode: qrCodeResponse,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: `Error al crear la Orden: ${error}`,
        data: {},
      });
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const ordenes = await db.Orden.findAll();
      res.status(200).json({
        message: "Órdenes consultadas exitosamente",
        data: ordenes,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error al consultar las Ordenes: ${error}`,
        data: {},
      });
    }
  }

  private async getPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orden = await db.Orden.findByPk(id);
      if (!orden) {
        return res.status(404).json({
          message: `Orden con id ${id} no encontrada`,
          data: {},
        });
      }
      res.status(200).json({
        message: "Orden consultada exitosamente",
        data: orden,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error al consultar la Orden: ${error}`,
        data: {},
      });
    }
  }

  private async getPorIdCodigoQr(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orden = await db.Orden.findByPk(id);
      const mongoController = MongoProductosController.instance;
      const ordenMongo = await mongoController.getOrderById(
        orden?.idMongoProductos
      );

      if (!orden) {
        return res.status(404).json({
          message: `Orden con id ${id} no encontrada`,
          data: {},
        });
      }
      res.status(200).json({
        message: "Datos obtenidos exitosamente",
        data: {
          sqlData: orden,
          mongoData: ordenMongo,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: `Error al consultar la Orden: ${error}`,
        data: {},
      });
    }
  }

  private async putActualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { idContenedor, idCamion, origen, idCedis, idMongoProductos } =
        req.body;
      const orden = await db.Orden.findByPk(id);
      if (!orden) {
        return res.status(404).json({
          message: `Orden con id ${id} no encontrada`,
          data: {},
        });
      }
      orden.idContenedor = idContenedor;
      orden.idCamion = idCamion;
      orden.origen = origen;
      orden.idCedis = idCedis;
      orden.idMongoProductos = idMongoProductos;
      await orden.save();
      res.status(200).json({
        message: "Orden actualizada exitosamente",
        data: orden,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error al actualizar la Orden: ${error}`,
        data: {},
      });
    }
  }

  private async getLocalizacion(req: Request, res: Response) {
    try {
      const { localizacion } = req.params;
      const ordenes = await db.Orden.findAll({
        where: {
          localizacion,
          isActive: true,
        },
      });
      res.status(200).json({
        message: "Órdenes consultadas exitosamente",
        data: ordenes,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error al consultar las Ordenes: ${error}`,
        data: {},
      });
    }
  }

  private async putActualizarLocalizacion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { localizacion } = req.body;
      const orden = await db.Orden.findByPk(id);
      if (!orden) {
        return res.status(404).json({
          message: `Orden con id ${id} no encontrada`,
          data: {},
        });
      }
      orden.localizacion = localizacion;
      await orden.save();
      res.status(200).json({
        message: "Localización de la orden actualizada exitosamente",
        data: orden,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error al actualizar la Orden: ${error}`,
        data: {},
      });
    }
  }

  private async deletePorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orden = await db.Orden.findByPk(id);
      if (!orden) {
        return res.status(404).json({
          message: `Orden con id ${id} no encontrada`,
          data: {},
        });
      }
      await orden.destroy();
      res.status(200).json({
        message: "Orden eliminada exitosamente",
        data: {},
      });
    } catch (error) {
      res.status(500).json({
        message: `Error al eliminar la Orden: ${error}`,
        data: {},
      });
    }
  }

  private async getQrUrl(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const ordenesActivas = await db.Orden.findAll({
        where: {
          idContenedor: id,
          isActive: true,
        },
        order: [["idOrden", "DESC"]],
      });

      if (ordenesActivas.length === 0) {
        return res.status(404).json({
          message: "No hay órdenes activas para el ID proporcionado.",
          data: {},
        });
      }

      const ordenMayorValor = ordenesActivas[0];
      res.status(200).json({
        message: "Orden activa encontrada",
        data: ordenMayorValor,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error al consultar las órdenes activas: ${error}`,
        data: {},
      });
    }
  }

  private async postCsvUpload(req: Request, res: Response) {
    try {
      const file = req.file;

      console.log(file); // Debería mostrar los detalles del archivo correctamente

      // Verifica si el archivo fue subido
      if (!file) {
        return res.status(400).json({
          message: "No se subió ningún archivo CSV.",
          data: {},
        });
      }

      // Usa directamente `file.path` para leer el archivo
      const csvFile = fs.readFileSync(file.path);

      // Configuración para la solicitud de subida a Oracle Cloud
      const putObjectRequest = {
        bucketName: this.bucketName,
        namespaceName: this.namespace,
        objectName: `LibroOrdenes.csv`, // Nombre del archivo en el bucket
        putObjectBody: csvFile,
        contentLength: csvFile.length,
      };

      // Sube el archivo CSV al bucket
      const putObject = await this.client.putObject(putObjectRequest);

      // Elimina el archivo temporal del sistema de archivos local
      fs.unlinkSync(file.path);

      res.status(200).json({
        message: "Archivo CSV subido exitosamente a Oracle Cloud.",
        data: {
          opcRequestId: putObject.opcRequestId,
          eTag: putObject.eTag,
        },
      });
    } catch (error) {
      console.error("Error al subir el archivo CSV:", error);
      res.status(500).json({
        message: `Error al subir el archivo CSV: ${error}`,
        data: {},
      });
    }
  }

  private async getOrdersByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      // Validar fechas
      if (!startDate || !endDate) {
        return res.status(400).json({
          message: "Los parámetros startDate y endDate son obligatorios",
          data: {},
        });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      const mongoController = MongoProductosController.instance;
      const ordersInRange = await mongoController.getOrdersByDateRange(
        start,
        end
      );

      if (!ordersInRange.length) {
        return res.status(404).json({
          message:
            "No se encontraron órdenes en el rango de fechas especificado",
          data: {},
        });
      }

      res.status(200).json({
        message: "Órdenes consultadas exitosamente",
        data: ordersInRange,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error al consultar las órdenes por rango de fecha: ${error}`,
        data: {},
      });
    }
  }

  private async getOrdersByIdMongo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await db.Orden.findOne({ where: { idMongoProductos: id } });

      if (!order) {
        return res.status(404).json({
          message: `Orden con idMongoProductos ${id} no encontrada`,
          data: {},
        });
      }
      res.status(200).json({
        message: "Datos obtenidos exitosamente",
        data: order,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error al consultar la Orden: ${error}`,
        data: {},
      });
    }
  }

  private async getOrdersWithFilters(req: Request, res: Response) {
    try {
      const { startDate, endDate, idContenedor, idCamion, origen, idCedis } =
        req.query;

      // Construir filtros para SQL (agregar solo si tienen valor)
      const sqlFilters: any = {};
      if (idContenedor) sqlFilters.idContenedor = idContenedor;
      if (idCamion) sqlFilters.idCamion = idCamion;
      if (origen) sqlFilters.origen = origen;
      if (idCedis) sqlFilters.idCedis = idCedis;

      let sqlOrders;
      let mongoOrders;
      const mongoController = MongoProductosController.instance;

      // Si no hay fechas ni filtros, obtener todas las órdenes
      if (!startDate && !endDate && Object.keys(sqlFilters).length === 0) {
        // Obtener todas las órdenes de SQL sin filtro
        sqlOrders = await db.Orden.findAll();

        // Obtener todas las órdenes de MongoDB sin filtro
        mongoOrders = await mongoController.getAllOrders();
      } else {
        // Convertir las fechas a Date si están presentes
        const start = startDate ? new Date(startDate as string) : undefined;
        const end = endDate ? new Date(endDate as string) : undefined;

        // Consulta a SQL con los filtros especificados
        sqlOrders = await db.Orden.findAll({
          where: sqlFilters,
        });

        // Obtener los IDs de Mongo relacionados a las órdenes encontradas en SQL
        const mongoIds = sqlOrders.map((order: any) => order.idMongoProductos);

        // Consulta a MongoDB usando los IDs y el rango de fechas (si se especifican)
        mongoOrders = await mongoController.getOrdersByIdsAndDateRange(
          mongoIds,
          start,
          end
        );
      }

      const combinedOrders = sqlOrders.map((sqlOrder: any) => {
        const mongoOrder =
          mongoOrders.find(
            (m: any) => m._id.toString() === sqlOrder.idMongoProductos
          ) || {}; // Asegura que siempre haya mongoData

        return { sqlData: sqlOrder, mongoData: mongoOrder };
      });

      res.status(200).json({
        message: "Órdenes consultadas exitosamente",
        data: combinedOrders,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error al consultar las órdenes con filtros: ${error}`,
        data: {},
      });
    }
  }
}

export default OrdenController;
