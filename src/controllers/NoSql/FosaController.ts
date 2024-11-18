import { Request, Response } from "express";
import { MongoFosasModel } from "../../models/NoSql/FosaModel";
import AbstractController from "../AbstractController";

class FosaController extends AbstractController {
  private static _instance: FosaController;
  private model = MongoFosasModel;

  public static get instance(): FosaController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new FosaController("fosa");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
    this.router.post("/crear", this.postCrear.bind(this));
    this.router.get("/consultarTodos", this.getTodos.bind(this));
    // this.router.get('/consultar/:id', this.getPorId.bind(this));
    // this.router.put('/actualizar/:id', this.putActualizar.bind(this));
    // this.router.delete('/eliminar/:id', this.deletePorId.bind(this));
    this.router.post("/agregarContenedor", this.agregarContenedor.bind(this));
  }

  private async agregarContenedor(req: Request, res: Response) {
    try {
      const { dateTime, idContenedor } = req.body;

      if (!dateTime || !idContenedor) {
        return res
          .status(400)
          .send("La petición debe contener 'dateTime' e 'idContenedor'.");
      }

      // Creamos el objeto Date a partir de `dateTime` en formato ISO
      const date = new Date(dateTime);

      // Verificamos que `date` es válido
      if (isNaN(date.getTime())) {
        return res.status(400).send("El formato de 'dateTime' no es válido.");
      }

      // Formateamos la fecha como "dd/mm/yy"
      const fecha = date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });

      // Formateamos la hora como "HH:MM"
      const hora = date.toTimeString().slice(0, 5);

      // Formato del contenedor a agregar: "idContenedor-hora"
      const contenedorKey = `${idContenedor}-${hora}`;

      // Encuentra la fosa actual (suponiendo que solo hay una)
      const fosaDocument = await this.model.findOne();

      if (!fosaDocument) {
        return res.status(404).send("No se encontró la fosa.");
      }

      // Usa `findByIdAndUpdate` para actualizar la parte específica del documento
      const updatePath = `fosa.daily.${fecha}.${contenedorKey}`;
      const updatedDocument = await this.model.findByIdAndUpdate(
        fosaDocument._id,
        { $set: { [updatePath]: true } },
        { new: true } // Devuelve el documento actualizado
      );

      res.status(200).send(updatedDocument);
    } catch (error) {
      console.error("Error al agregar el contenedor:", error);
      res.status(500).send(`Error al agregar el contenedor: ${error}`);
    }
  }

  private async getTest(req: Request, res: Response) {
    /**
     * Prueba de conexión con el controlador
     * @param - None
     * @returns - None
     */
    try {
      res.status(200).send("Fosa works");
    } catch (error) {
      res.status(500).send(`Error al conectar con la Fosa: ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const { fosa } = req.body; // Recibimos un objeto `fosa` desde el request

      if (!fosa || typeof fosa !== "object") {
        return res
          .status(400)
          .send("El cuerpo de la petición debe contener un objeto 'fosa'.");
      }

      // Creamos el documento en la base de datos con la fosa recibida
      const fosaDocument = await this.model.create({ fosa });

      res.status(201).send(fosaDocument);
    } catch (error) {
      console.error("Error al crear el documento de fosa:", error);
      res.status(500).send(`Error al crear el documento de fosa: ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const orders = await this.model.find();
      res.status(200).json(orders);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar las Órdenes: ${error}` });
    }
  }

  // Métodos Públicos
  public async agregarContenedorDirecto(
    dateTime: string,
    idContenedor: string
  ): Promise<any> {
    try {
      // Validar que se reciban los parámetros necesarios
      if (!dateTime || !idContenedor) {
        throw new Error("Los parámetros 'dateTime' e 'idContenedor' son obligatorios.");
      }

      // Crear el objeto Date a partir de `dateTime` en formato ISO
      const date = new Date(dateTime);

      // Validar que la fecha sea válida
      if (isNaN(date.getTime())) {
        throw new Error("El formato de 'dateTime' no es válido.");
      }

      // Formatear la fecha como "dd/mm/yy"
      const fecha = date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });

      // Formatear la hora como "HH:MM"
      const hora = date.toTimeString().slice(0, 5);

      // Formato del contenedor a agregar: "idContenedor-hora"
      const contenedorKey = `${idContenedor}-${hora}`;

      // Encontrar la fosa actual (suponiendo que solo hay una)
      const fosaDocument = await this.model.findOne();

      if (!fosaDocument) {
        throw new Error("No se encontró la fosa.");
      }

      // Construir la ruta de actualización dinámica
      const updatePath = `fosa.daily.${fecha}.${contenedorKey}`;

      // Actualizar el documento en la base de datos
      const updatedDocument = await this.model.findByIdAndUpdate(
        fosaDocument._id,
        { $set: { [updatePath]: true } },
        { new: true } // Devuelve el documento actualizado
      );

      return updatedDocument; // Devolver el documento actualizado
    } catch (error) {
      throw new Error(`Error al agregar el contenedor: ${error}`);
    }
  }

}

export default FosaController;
