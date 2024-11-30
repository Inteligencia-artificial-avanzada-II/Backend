import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import MongoProductosController from "./NoSql/MongoProductosController";
import QrController from "./QrController";
import { validateTokenMiddleware } from "../middlewares/validateToken";
import UsuarioController from "./UsuarioController";
import { validateJWT } from "../utils/jwt";
import { upload } from "../config/multer";
import fs from "fs";
import { ConfigFileAuthenticationDetailsProvider } from "oci-common";
import { ObjectStorageClient } from "oci-objectstorage";
import { BUCKET_NAME, BUCKET_NAMESPACE } from "../config";
import ContenedorController from "./ContenedorController";
import CamionController from "./CamionController";

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

  // Método protegido donde añadimos todas nuestras rutas y las ligamos con los métodos generados
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
    this.router.get(
      "/ordenInactiva/:idOrden",
      this.putOrdenInactiva.bind(this)
    );
    this.router.put(
      "/actualizarCamion/:idOrden",
      this.actualizarEstadoCamion.bind(this)
    );
    this.router.get(
      "/obtenerOrdenesInfoContenedor",
      this.getOrdenesFront.bind(this)
    );
  }

  private async getTest(req: Request, res: Response) {
    /**
      * Prueba de conexión con el controlador.
      * 
      * @param - None
      * @returns - None
    */

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
    /**
      * Crea una nueva orden en la base de datos (SQL y MongoDB).
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `sqlData` (object): Datos para la orden en SQL, que incluye:
      *     - `idContenedor` (string): ID del contenedor asociado.
      *     - `idCamion` (string): ID del camión asociado.
      *     - `origen` (string): Origen de la orden.
      *     - `idCedis` (string): ID del CEDIS asociado.
      *     - `localization` (string): Localización de la orden.
      *   - `mongoData` (object): Datos para la orden en MongoDB, que incluye:
      *     - `orderNumber` (string): Número de la orden.
      *     - `createdBy` (string): Usuario creador de la orden.
      *     - `modifiedBy` (string): Usuario modificador de la orden.
      *     - `creationDate` (Date): Fecha de creación de la orden.
      *     - `products` (array): Lista de productos.
      * @param res - Objeto de respuesta HTTP.
      * @returns Orden creada o mensaje de error.
    */

    try {
      const { sqlData, mongoData } = req.body;
      const idContenedor = req.body.sqlData.idContenedor;

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

      const camionInstance = CamionController.instance;
      const camion = await camionInstance.actualizarOcupacionCamion(
        sqlData.idCamion,
        true
      );

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

      const ContenedorInstance = ContenedorController.instance;
      const nuevoStatus = await ContenedorInstance.ActualizarStatus(
        idContenedor,
        "En transito"
      );
      console.log("Contenedor Status:", nuevoStatus);

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
    /**
      * Obtiene todas las órdenes almacenadas en la base de datos.
      * 
      * @param - None
      * @returns Lista de órdenes o mensaje de error.
    */

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
    /**
      * Obtiene una orden por su ID.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID único de la orden a consultar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Orden consultada o mensaje de error.
    */

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
    /**
      * Obtiene los datos de una orden por su ID y su código QR.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID único de la orden a consultar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Datos de la orden (SQL y MongoDB) o mensaje de error.
    */

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
    /**
      * Actualiza los datos de una orden por su ID.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID único de la orden a actualizar.
      *   - `idContenedor` (string en `req.body`): Nuevo ID del contenedor.
      *   - `idCamion` (string en `req.body`): Nuevo ID del camión.
      *   - `origen` (string en `req.body`): Nuevo origen de la orden.
      *   - `idCedis` (string en `req.body`): Nuevo ID del CEDIS.
      *   - `idMongoProductos` (string en `req.body`): Nuevo ID de MongoDB para productos.
      * @param res - Objeto de respuesta HTTP.
      * @returns Orden actualizada o mensaje de error.
    */

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
    /**
      * Obtiene todas las órdenes activas por localización.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `localizacion` (string en `req.params`): Localización a filtrar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Lista de órdenes o mensaje de error.
    */

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
    /**
      * Actualiza la localización de una orden por su ID.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID único de la orden.
      *   - `localizacion` (string en `req.body`): Nueva localización de la orden.
      * @param res - Objeto de respuesta HTTP.
      * @returns Orden actualizada o mensaje de error.
    */

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
    /**
      * Elimina una orden por su ID.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID único de la orden a eliminar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Mensaje de éxito si se elimina correctamente o mensaje de error.
    */

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
    /**
      * Obtiene la URL del QR de una orden activa.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID único del contenedor.
      * @param res - Objeto de respuesta HTTP.
      * @returns URL del QR o mensaje de error.
    */

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
    /**
      * Sube un archivo CSV al almacenamiento en la nube.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - Archivo CSV en el campo `file`.
      * @param res - Objeto de respuesta HTTP.
      * @returns Información del archivo subido o mensaje de error.
    */

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
    /**
      * Obtiene órdenes dentro de un rango de fechas.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `startDate` (string en `req.query`): Fecha de inicio en formato ISO.
      *   - `endDate` (string en `req.query`): Fecha de fin en formato ISO.
      * @param res - Objeto de respuesta HTTP.
      * @returns Lista de órdenes dentro del rango de fechas o mensaje de error.
    */

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
    /**
      * Obtiene una orden utilizando su ID de MongoDB.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID único de MongoDB asociado a la orden.
      * @param res - Objeto de respuesta HTTP.
      * @returns Datos de la orden consultada o mensaje de error.
    */

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
    /**
      * Obtiene órdenes aplicando filtros opcionales (fechas, contenedor, camión, etc.).
      * 
      * @param req - Objeto de solicitud HTTP que puede contener:
      *   - `startDate` (string en `req.query`): Fecha de inicio en formato ISO.
      *   - `endDate` (string en `req.query`): Fecha de fin en formato ISO.
      *   - `idContenedor` (string en `req.query`): ID del contenedor a filtrar.
      *   - `idCamion` (string en `req.query`): ID del camión a filtrar.
      *   - `origen` (string en `req.query`): Origen de la orden.
      *   - `idCedis` (string en `req.query`): ID del CEDIS.
      * @param res - Objeto de respuesta HTTP.
      * @returns Lista combinada de órdenes SQL y MongoDB o mensaje de error.
    */

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

  private async getOrderCamionInEstatus(req: Request, res: Response) {
    /**
      * Obtiene camiones por estatus en las órdenes.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `estatus` (string en `req.params`): Estatus de la localización del camión.
      * @param res - Objeto de respuesta HTTP.
      * @returns Lista de órdenes relacionadas con el estatus del camión o mensaje de error.
    */

    try {
      // Obtener el estatus de los parámetros de la ruta
      const estatus = req.params.estatus;

      // Realizar la consulta al modelo Orden
      const orders = await db.Orden.findAll({
        where: {
          isActive: true,
          localization: estatus,
        },
      });

      // Enviar la respuesta con los datos obtenidos
      res.status(200).json({
        message: "Órdenes obtenidas exitosamente",
        data: orders,
      });
    } catch (error) {
      // Manejo de errores
      console.error("Error al obtener las órdenes:", error);
      res.status(500).json({
        message: `Hubo un error al obtener las órdenes: ${error}`,
        data: {},
      });
    }
  }

  private async putOrdenInactiva(req: Request, res: Response) {
    /**
      * Marca una orden como inactiva.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `idOrden` (string en `req.params`): ID único de la orden a inactivar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Mensaje de éxito con la orden inactivada o mensaje de error.
    */

    try {
      // Obtener el ID de la orden de los parámetros de la ruta
      const { idOrden } = req.params;

      // Realizar la consulta al modelo Orden
      const orden = await db.Orden.findByPk(idOrden);

      // Validar si no se encontró la orden
      if (!orden) {
        res.status(404).json({
          message: `No se encontró la orden con el ID ${idOrden}`,
          data: {},
        });
        return;
      }

      // Actualizar el campo isActive a false
      orden.isActive = false;
      await orden.save();

      // Enviar la respuesta con el mensaje de éxito
      res.status(200).json({
        message: "Orden inactivada exitosamente",
        data: orden,
      });
    } catch (error) {
      // Manejo de errores
      console.error("Error al inactivar la orden:", error);
      res.status(500).json({
        message: `Hubo un error al inactivar la orden: ${error}`,
        data: {},
      });
    }
  }

  public async ordenInactiva(idOrden: string) {
    /**
      * Marca una orden como inactiva (método reutilizable).
      * 
      * @param idOrden - ID único de la orden a inactivar.
      * @returns Objeto con la orden inactivada o mensaje de error.
    */

    try {
      // Realizar la consulta al modelo Orden
      const orden = await db.Orden.findByPk(idOrden);

      // Validar si no se encontró la orden
      if (!orden) {
        return null;
      }

      // Actualizar el campo isActive a false
      orden.isActive = false;
      await orden.save();

      return orden;
    } catch (error) {
      // Manejo de errores
      console.error("Error al inactivar la orden:", error);
      return null;
    }
  }

  public async getOrdenById(idOrden: string) {
    /**
      * Obtiene una orden por su ID (método reutilizable).
      * 
      * @param idOrden - ID único de la orden a consultar.
      * @returns Objeto con los datos de la orden o mensaje de error.
    */

    try {
      const orden = await db.Orden.findByPk(idOrden);
      if (!orden) {
        return {
          message: `Orden con id ${idOrden} no encontrada`,
          data: {},
        };
      }
      return {
        message: "Orden consultada exitosamente",
        data: orden,
      };
    } catch (error) {}
  }

  private async actualizarEstadoCamion(req: Request, res: Response) {
    /**
      * Actualiza el estado de ocupación de un camión asociado a una orden.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `idOrden` (string en `req.params`): ID único de la orden asociada al camión.
      * @param res - Objeto de respuesta HTTP.
      * @returns Datos de la orden y el camión actualizado o mensaje de error.
    */

    try {
      const { idOrden } = req.params;

      // Busca la orden por idOrden
      const orden = await db.Orden.findByPk(idOrden);
      if (!orden) {
        return res
          .status(404)
          .json({ message: `Orden con id ${idOrden} no encontrada.` });
      }

      // Obtiene el idCamion asociado
      const { idCamion } = orden;

      // Busca el camión por idCamion
      const camion = await db.Camion.findByPk(idCamion);
      if (!camion) {
        return res
          .status(404)
          .json({ message: `Camion con id ${idCamion} no encontrado.` });
      }

      // Actualiza el estado de isOccupied a false
      camion.isOccupied = false;
      await camion.save();

      // Devuelve la orden completa junto con el estado actualizado del camión
      res.status(200).json({
        message: "Estado del camión actualizado exitosamente.",
        orden,
        camion,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error al actualizar el estado del camión: ${error}`,
      });
    }
  }

  public async actualizarEstadoCamionFinal(idOrden: string) {
    /**
      * Actualiza el estado de ocupación de un camión (método reutilizable).
      * 
      * @param idOrden - ID único de la orden asociada al camión.
      * @returns Mensaje de éxito con los datos de la orden y camión actualizados o mensaje de error.
    */

    try {
      // Busca la orden por idOrden
      const orden = await db.Orden.findByPk(idOrden);
      if (!orden) {
        return { message: `Orden con id ${idOrden} no encontrada.` };
      }

      // Obtiene el idCamion asociado
      const { idCamion } = orden;

      // Busca el camión por idCamion
      const camion = await db.Camion.findByPk(idCamion);
      if (!camion) {
        return { message: `Camion con id ${idCamion} no encontrado.` };
      }

      // Verifica el estado actual de isOccupied
      if (!camion.isOccupied) {
        return {
          message: `El camión con id ${idCamion} ya está marcado como no ocupado.`,
          camion,
        };
      }

      // Actualiza el estado de isOccupied a false
      camion.isOccupied = false;
      await camion.save();

      // Devuelve la orden completa junto con el estado actualizado del camión
      return {
        message: "Estado del camión actualizado exitosamente.",
        orden,
        camion,
      };
    } catch (error) {
      return { message: `Error al actualizar el estado del camión: ${error}` };
    }
  }

  private async getOrdenesFront(req: Request, res: Response) {
    /**
      * Obtiene órdenes activas con datos adicionales para el frontend.
      * 
      * @param req - None.
      * @param res - Objeto de respuesta HTTP.
      * @returns Lista de órdenes activas con datos de contenedores y productos o mensaje de error.
    */

    try {
      // Obtén todas las órdenes activas
      const ordenes = await db.Orden.findAll({
        where: {
          isActive: true,
        },
      });

      // Si no hay órdenes, devuelve una respuesta vacía
      if (ordenes.length === 0) {
        return res
          .status(404)
          .json({ message: "No se encontraron órdenes activas." });
      }

      // Recorre las órdenes y llama a `porId` y busca el contenedor asociado
      const resultados = await Promise.all(
        ordenes.map(async (orden: any) => {
          const MongoProductosControllerInstance =
            MongoProductosController.instance;

          // Obtiene los datos de `idMongoProductos`
          const idMongoProductos = await MongoProductosControllerInstance.porId(
            orden.idMongoProductos
          );

          // Obtiene los datos del contenedor asociado
          const contenedor = await db.Contenedor.findByPk(orden.idContenedor);

          // Elimina el campo "contraseña" del contenedor si existe
          if (contenedor) {
            delete contenedor.dataValues.contraseña;
          }

          return {
            ...orden.toJSON(), // Incluye los datos originales de la orden
            idMongoProductos, // Agrega los datos de `idMongoProductos`
            contenedor, // Agrega los datos del contenedor (sin contraseña)
          };
        })
      );

      // Responde con la lista combinada
      res.status(200).json(resultados);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar las órdenes: ${error}` });
    }
  }
}

export default OrdenController;
