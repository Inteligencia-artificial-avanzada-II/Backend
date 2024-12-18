import { Request, Response } from "express";
import {
  MongoProductosModel,
  Order,
} from "../../models/NoSql/MongoProductosModel"; // Importamos la interfaz Order también
import AbstractController from "../AbstractController";
import { validateTokenMiddleware } from "../../middlewares/validateToken";
import OrdenController from "../OrdenController";
import { read } from "fs";

class MongoProductosController extends AbstractController {
  // Cambiamos 'typeof OrderModel' a 'Order'
  private static _instance: MongoProductosController;
  private model = MongoProductosModel;

  public static get instance(): MongoProductosController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new MongoProductosController("ordenmongo");
    return this._instance;
  }

  constructor(name: string) {
    super(name);
    this.model = MongoProductosModel; // Asignación del modelo MongoProductosModel
  }

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
    this.router.put(
      "/actualizar/:id",
      validateTokenMiddleware,
      this.putActualizar.bind(this)
    );
    this.router.delete(
      "/eliminar/:id",
      validateTokenMiddleware,
      this.deletePorId.bind(this)
    );
    this.router.put(
      "/guardarPosicionPatio",
      validateTokenMiddleware,
      this.putGuardarPosicionPatio.bind(this)
    );
  }

  // Métodos privados
  private async getTest(req: Request, res: Response) {
    /**
      * Prueba de conexión con el controlador.
      * 
      * @param - None
      * @returns - None
    */

    try {
      res.status(200).send("Orden Mongo works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Orden: ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    /**
      * Crea una nueva orden en la base de datos.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `orderNumber` (string en `req.body`): Número único de la orden.
      *   - `createdBy` (string en `req.body`): Usuario que crea la orden.
      *   - `modifiedBy` (string en `req.body`): Usuario que modifica la orden.
      *   - `creationDate` (Date en `req.body`): Fecha de creación de la orden.
      *   - `products` (array en `req.body`): Lista de productos asociados a la orden.
      * @param res - Objeto de respuesta HTTP.
      * @returns Orden creada o mensaje de error.
    */

    try {
      // Obtenemos los datos del cuerpo de la petición
      const { orderNumber, createdBy, modifiedBy, creationDate, products } =
        req.body;

      // Validamos que todos los campos requeridos estén presentes (opcional)
      if (!orderNumber || !createdBy || !products || products.length === 0) {
        return res
          .status(400)
          .send("Faltan datos requeridos para crear la orden.");
      }

      // Creamos una nueva instancia del modelo con los datos proporcionados
      const newOrder = new this.model({
        orderNumber,
        createdBy,
        modifiedBy,
        creationDate,
        products,
      });

      // Guardamos la nueva orden en la base de datos
      const savedOrder = await newOrder.save();

      // Enviamos la orden guardada como respuesta
      res.status(201).send(savedOrder);
    } catch (error) {
      res.status(500).send(`Error al crear la Orden: ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    /**
      * Consulta y devuelve todas las órdenes almacenadas en la base de datos.
      * 
      * @param - None
      * @returns - Lista de órdenes o mensaje de error.
    */

    try {
      const orders = await this.model.find();
      res.status(200).json(orders);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar las Órdenes: ${error}` });
    }
  }

  private async getPorId(req: Request, res: Response) {
    /**
      * Consulta una orden específica por su ID.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID único de la orden a consultar.
      *     Ejemplo: "/consultar/12345" donde `12345` es el ID.
      * @param res - Objeto de respuesta HTTP.
      * @returns Orden consultada o mensaje de error.
    */

    try {
      const { id } = req.params;
      if (id) {
        const order = await this.model.findById(id);
        if (!order) {
          res
            .status(404)
            .json({ message: `Orden con id ${id} no encontrada`, data: {} });
          return;
        }
        res
          .status(200)
          .json({ message: "Datos obtenidos exitosamente", data: order });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error al consultar la Orden: ${error}`, data: {} });
    }
  }

  public async porId(id: string) {
    /**
      * Consulta un producto específico en MongoDB por su ID.
      * 
      * @param id - ID único del producto a consultar.
      * @returns El producto encontrado si existe, o un mensaje de error si no se encuentra o ocurre un fallo.
    */

    try {
      const idMongoProductos = await this.model.findById(id);
      if (!idMongoProductos) {
        return "No se encontró el id";
      }
      return idMongoProductos;
    } catch (error) {
      return "Error al consultar el id";
    }
  }

  private async putGuardarPosicionPatio(req: Request, res: Response) {
    /**
      * Actualiza la posición en el patio de una orden específica.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `idOrden` (string en `req.body`): ID único de la orden.
      *   - `posicionPatio` (string en `req.body`): Nueva posición en el patio.
      * @param res - Objeto de respuesta HTTP.
      * @returns Mensaje de éxito o error.
    */

    const { idOrden, posicionPatio } = req.body;

    try {
      const controladorOrden = OrdenController.instance;
      const ordenObject = await controladorOrden.getOrdenById(idOrden);

      if (ordenObject?.data) {
        console.log(ordenObject.data);
        const mongoIdContenedor = ordenObject.data.idMongoProductos;

        const actualizaPatio = await this.ActualizarPosicionPatio(
          mongoIdContenedor,
          posicionPatio
        );

        const responseToSend = {
          idOrden: idOrden,
          ordenMongo: actualizaPatio,
        };

        res
          .status(200)
          .json({
            message: "Datos Modificados Correctamente",
            data: responseToSend,
          });
      }
    } catch (error) {
      res
        .status(404)
        .json({
          message: `Ocurrió un error al guardar la posición en el patio ${error}`,
        });
    }
  }


  public async getOrdersByDateRange(startDate: Date, endDate: Date) {
    /**
      * Consulta órdenes dentro de un rango de fechas.
      * 
      * @param startDate - Fecha inicial del rango en formato Date.
      * @param endDate - Fecha final del rango en formato Date.
      * @returns Lista de órdenes dentro del rango o lanza un error en caso de fallo.
    */

    try {
      // Convertir las fechas a cadenas en formato ISO
      const start = startDate.toISOString();
      const end = endDate.toISOString();

      console.log("startDate", start, "endDate", end);

      const orders = await this.model
        .find({
          creationDate: { $gte: start, $lte: end }, // Usa las fechas como cadenas
        })
        .select("-__v"); // Excluir campos como '__v' si no los necesitas

      return orders;
    } catch (error) {
      console.error("Error al obtener las órdenes por rango de fecha:", error);
      throw new Error("Error al obtener las órdenes por rango de fecha");
    }
  }

  private async putActualizar(req: Request, res: Response) {
    /**
      * Actualiza una orden específica por su ID.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID único de la orden a actualizar.
      *   - `req.body` (object): Datos que se van a actualizar en la orden.
      * @param res - Objeto de respuesta HTTP.
      * @returns Orden actualizada o mensaje de error.
    */

    try {
      const { id } = req.params;
      const updatedOrder = await this.model.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!updatedOrder) {
        res.status(404).send(`Orden con id ${id} no encontrada`);
        return;
      }
      res.status(200).send(updatedOrder);
    } catch (error) {
      res.status(500).send(`Error al actualizar la Orden: ${error}`);
    }
  }

  public async ActualizarPosicionPatio(id: string, posicion: string) {
    /**
      * Actualiza la posición de una orden en el patio.
      * 
      * @param id - ID único de la orden a actualizar.
      * @param posicion - Nueva posición en el patio.
      * @returns Orden actualizada o lanza un error en caso de fallo.
    */


    try {
      // Cambia 'posicion' por 'posicionPatio' para coincidir con el esquema
      const updatedOrder = await this.model.findByIdAndUpdate(
        id,
        { posicionPatio: posicion }, // Campo correcto
        { new: true } // Devuelve el documento actualizado
      );
      return updatedOrder;
    } catch (error) {
      throw new Error(`Error al actualizar la posición de la Orden: ${error}`);
    }
  }

  private async deletePorId(req: Request, res: Response) {
    /**
      * Elimina una orden específica por su ID.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID único de la orden a eliminar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Mensaje de éxito si la orden fue eliminada o mensaje de error.
    */


    try {
      const { id } = req.params;
      const deletedOrder = await this.model.findByIdAndDelete(id);
      if (!deletedOrder) {
        res.status(404).send(`Orden con id ${id} no encontrada`);
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).send(`Error al eliminar la Orden: ${error}`);
    }
  }

  // Métodos públicos
  public async createOrder(data: Order): Promise<Order & { _id: string }> {
    /**
      * Crea una nueva orden en la base de datos.
      * 
      * @param data - Objeto que representa la orden a crear.
      *     Ejemplo: { orderNumber: "12345", createdBy: "Usuario", products: [...] }
      * @returns Orden creada y guardada en la base de datos.
    */


    const newOrder = new this.model(data);
    const savedOrder = await newOrder.save();
    return savedOrder as Order & { _id: string };
  }

  public async getOrderById(id: string): Promise<Order | null> {
    /**
      * Consulta una orden específica por su ID.
      * 
      * @param id - ID único de la orden a consultar.
      * @returns Orden consultada o `null` si no se encuentra.
    */

    try {
      const order = await this.model.findById(id).select("-__v -_id").exec();
      return order;
    } catch (error) {
      console.error("Error obteniendo la orden por ID:", error);
      return null;
    }
  }

  public async getOrdersByDateRangeWithIds(
    startDate: Date,
    endDate: Date,
    ids: string[]
  ) {
    /**
      * Consulta órdenes dentro de un rango de fechas y por IDs específicos.
      * 
      * @param startDate - Fecha inicial del rango en formato Date.
      * @param endDate - Fecha final del rango en formato Date.
      * @param ids - Array de IDs de las órdenes a consultar.
      * @returns Lista de órdenes o lanza un error en caso de fallo.
    */
    try {
      const orders = await this.model
        .find({
          _id: { $in: ids },
          creationDate: { $gte: startDate, $lte: endDate },
        })
        .select("-__v"); // Excluir campos como '__v' si no los necesitas

      return orders;
    } catch (error) {
      console.error(
        "Error al obtener las órdenes por rango de fecha e IDs:",
        error
      );
      throw new Error("Error al obtener las órdenes por rango de fecha e IDs");
    }
  }

  public async getAllOrders() {
    /**
      * Consulta todas las órdenes almacenadas en la base de datos.
      * 
      * @returns Lista de órdenes o lanza un error en caso de fallo.
    */

    try {
      const orders = await this.model.find().select("-__v"); // Excluir campos como '__v' si no los necesitas
      return orders;
    } catch (error) {
      console.error("Error al obtener todas las órdenes:", error);
      throw new Error("Error al obtener todas las órdenes");
    }
  }

  public async getOrdersByIdsAndDateRange(
    ids: string[],
    startDate?: Date,
    endDate?: Date
  ) {
    /**
      * Consulta órdenes por IDs y opcionalmente por rango de fechas.
      * 
      * @param ids - Array de IDs de las órdenes a consultar.
      * @param startDate - (Opcional) Fecha inicial del rango en formato Date.
      * @param endDate - (Opcional) Fecha final del rango en formato Date.
      * @returns Lista de órdenes o lanza un error en caso de fallo.
    */

    try {
      const filter: any = { _id: { $in: ids } };

      // Agregar rango de fechas solo si startDate y endDate están definidos
      if (startDate && endDate) {
        const orders = await this.model.find({
          creationDate: {
            $gte: startDate.toISOString(),
            $lte: endDate.toISOString(),
          }, // Usa las fechas como cadenas
        });

        return orders;
      }

      const orders = await this.model.find(filter).select("-__v"); // Excluir '__v' si no es necesario
      return orders;
    } catch (error) {
      console.error(
        "Error al obtener órdenes por IDs y rango de fechas:",
        error
      );
      throw new Error("Error al obtener órdenes por IDs y rango de fechas");
    }
  }
}

export default MongoProductosController;
