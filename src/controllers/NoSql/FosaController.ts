import { Request, Response } from "express";
import { MongoFosasModel } from "../../models/NoSql/FosaModel";
import AbstractController from "../AbstractController";
import { number } from "joi";

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

  // Método protegido donde añadimos todas nuestras rutas y las ligamos con los métodos generados
  protected initializeRoutes(): void {
    this.router.get("/test", this.getTest.bind(this));
    this.router.post("/crear", this.postCrear.bind(this));
    this.router.get("/consultarTodos", this.getTodos.bind(this));
    // this.router.get('/consultar/:id', this.getPorId.bind(this));
    // this.router.put('/actualizar/:id', this.putActualizar.bind(this));
    // this.router.delete('/eliminar/:id', this.deletePorId.bind(this));
    this.router.post("/agregarContenedor", this.agregarContenedor.bind(this));
    this.router.put(
      "/actualizarEstadoContenedor",
      this.actualizarEstadoContenedor.bind(this)
    );
  }

  private async agregarContenedor(req: Request, res: Response) {
    /**
      * Agrega un contenedor a la estructura de datos de la fosa en la base de datos.
      * 
      * - Verifica que los parámetros `dateTime` e `idContenedor` estén presentes y sean válidos.
      * - Formatea la fecha y la hora para crear una clave única del contenedor.
      * - Actualiza dinámicamente la estructura de datos de la fosa con la nueva entrada.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `dateTime` (string): Fecha y hora en formato ISO (ejemplo: "2024-11-29T15:45:00").
      *   - `idContenedor` (string): ID único del contenedor.
      * @param res - Objeto de respuesta HTTP.
      * @returns Documento actualizado de la base de datos o un error.
    */


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
    /**
      * Crea un nuevo documento de fosa en la base de datos.
      * 
      * - Recibe un objeto `fosa` desde el cuerpo de la petición.
      * - Valida que el objeto sea válido antes de crear el documento.
      * - Devuelve el documento creado o un error en caso de fallo.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `fosa` (object): Objeto con la estructura de datos inicial de la fosa.
      * @param res - Objeto de respuesta HTTP.
      * @returns Documento creado o mensaje de error.
    */

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
    /**
      * Consulta y devuelve todos los documentos de fosas almacenados en la base de datos.
      * 
      * @param - None
      * @returns - Lista de documentos de fosas o mensaje de error.
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

  // Métodos Públicos
  public async agregarContenedorDirecto(
    dateTime: string,
    idContenedor: string
  ): Promise<any> {
    /**
      * Agrega un contenedor directamente a la estructura de datos de la fosa.
      * 
      * - Recibe `dateTime` e `idContenedor` como parámetros.
      * - Valida y formatea los datos antes de actualizar la base de datos.
      * - Actualiza dinámicamente el documento en la base de datos con la nueva entrada.
      * 
      * @param dateTime - Fecha y hora en formato ISO (ejemplo: "2024-11-29T15:45:00").
      * @param idContenedor - ID único del contenedor.
      * @returns Documento actualizado o lanza un error en caso de fallo.
    */

    try {
      // Validar que se reciban los parámetros necesarios
      if (!dateTime || !idContenedor) {
        throw new Error(
          "Los parámetros 'dateTime' e 'idContenedor' son obligatorios."
        );
      }

      // Dividir la fecha y hora del string ISO
      const [fechaISO, horaISO] = dateTime.split("T");
      if (!fechaISO || !horaISO) {
        throw new Error("El formato de 'dateTime' no es válido.");
      }

      // Formatear la fecha como "dd/mm/yy"
      const [year, month, day] = fechaISO.split("-");
      if (!year || !month || !day) {
        throw new Error("La fecha no tiene el formato esperado 'YYYY-MM-DD'.");
      }
      const fecha = `${day}/${month}/${year.slice(-2)}`;

      // Formatear la hora como "HH:MM"
      const [hour, minute] = horaISO.split(":");
      if (!hour || !minute) {
        throw new Error("La hora no tiene el formato esperado 'HH:MM:SS'.");
      }
      const hora = `${hour}:${minute}`;

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

      if (!updatedDocument) {
        throw new Error(
          "No se pudo actualizar el documento en la base de datos."
        );
      }

      return updatedDocument; // Devolver el documento actualizado
    } catch (error: any) {
      console.error("Error al agregar el contenedor:", error.message || error);
      throw new Error(
        `Error al agregar el contenedor: ${error.message || error}`
      );
    }
  }

  private async actualizarEstadoContenedor(req: Request, res: Response) {
    /**
      * Actualiza el estado de un contenedor en la base de datos.
      * 
      * - Cambia el estado de un contenedor de `true` a `false` en la estructura de datos.
      * - Utiliza la fecha actual para localizar la entrada correspondiente.
      * - Devuelve un mensaje de éxito o error según corresponda.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `idContenedor` (string): ID único del contenedor cuyo estado será actualizado.
      * @param res - Objeto de respuesta HTTP.
      * @returns Mensaje de éxito o error.
    */

    try {
      const { idContenedor } = req.body;

      if (!idContenedor) {
        return res
          .status(400)
          .send("La petición debe contener el campo 'idContenedor'.");
      }

      // Obtenemos la fecha de hoy en formato "dd/mm/yy"
      const hoy = new Date();
      const formatoFecha = (fecha: Date) =>
        fecha.toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          timeZone: "America/Mexico_City", // Asegúrate de usar el huso horario correcto
        });
      const fechaHoy = formatoFecha(hoy);

      // Construir el path dinámico para actualizar los contenedores
      const fosaDocument = await this.model.findOne();

      if (!fosaDocument) {
        return res.status(404).send("No se encontró la fosa.");
      }

      // Verificar y preparar la actualización
      const daily = fosaDocument.fosa.daily;
      let actualizado = false;

      if (daily[fechaHoy]) {
        Object.keys(daily[fechaHoy]).forEach((key) => {
          const [contenedorId, _] = key.split("-");
          if (contenedorId === idContenedor && daily[fechaHoy][key] === true) {
            daily[fechaHoy][key] = false;
            actualizado = true;
          }
        });
      }

      if (!actualizado) {
        return res
          .status(404)
          .send(
            `No se encontraron entradas para el contenedor ${idContenedor} con valor true en la fecha ${fechaHoy}.`
          );
      }

      // Actualización directa con this.model
      const updatedDocument = await this.model.findByIdAndUpdate(
        fosaDocument._id,
        { $set: { [`fosa.daily`]: daily } },
        { new: true }
      );

      console.log("updatedDocument", updatedDocument);

      res
        .status(200)
        .send(
          `El estado del contenedor ${idContenedor} fue actualizado exitosamente para la fecha ${fechaHoy}.`
        );
    } catch (error) {
      console.error("Error al actualizar el estado del contenedor:", error);
      res
        .status(500)
        .send(
          `Error al actualizar el estado del contenedor: ${error || error}`
        );
    }
  }

  public async actualizarEstadoContenedorPublic(idContenedor: string) {
    /**
      * Actualiza el estado de un contenedor de manera pública.
      * 
      * - Cambia el estado de un contenedor de `true` a `false`.
      * - Se usa principalmente para casos donde no se trabaja con una solicitud HTTP directa.
      * 
      * @param idContenedor - ID único del contenedor.
      * @returns Documento actualizado o un objeto vacío en caso de error.
    */

    try {

      if (!idContenedor) {
        return {};
      }

      // Obtenemos la fecha de hoy en formato "dd/mm/yy"
      const hoy = new Date();
      const formatoFecha = (fecha: Date) =>
        fecha.toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          timeZone: "America/Mexico_City", // Asegúrate de usar el huso horario correcto
        });
      const fechaHoy = formatoFecha(hoy);

      // Construir el path dinámico para actualizar los contenedores
      const fosaDocument = await this.model.findOne();

      if (!fosaDocument) {
        return {};
      }

      // Verificar y preparar la actualización
      const daily = fosaDocument.fosa.daily;
      let actualizado = false;

      if (daily[fechaHoy]) {
        Object.keys(daily[fechaHoy]).forEach((key) => {
          const [contenedorId, _] = key.split("-");
          if (contenedorId === idContenedor && daily[fechaHoy][key] === true) {
            daily[fechaHoy][key] = false;
            actualizado = true;
          }
        });
      }

      if (!actualizado) {
        return {};
      }

      // Actualización directa con this.model
      const updatedDocument = await this.model.findByIdAndUpdate(
        fosaDocument._id,
        { $set: { [`fosa.daily`]: daily } },
        { new: true }
      );

      console.log("updatedDocument", updatedDocument);

      return updatedDocument
    } catch (error) {
      console.error("Error al actualizar el estado del contenedor:", error);
      return {}
    }
  }

  public async obtenerContenedoresHoy(): Promise<{
    fecha: string;
    idContenedores: string[];
  }> {
    const hoy = new Date();
    const formatoFecha = (fecha: Date) =>
      fecha.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        timeZone: "America/Mexico_City", // Asegúrate de usar el huso horario correcto
      });
    const fechaHoy = formatoFecha(hoy);

    const fosaDocument = await this.model.findOne();
    if (!fosaDocument) {
      throw new Error("No se encontró la fosa.");
    }

    const daily = fosaDocument.fosa.daily;
    const contenedoresHoy = daily[fechaHoy] || {};

    // Filtrar los contenedores cuyos valores sean true
    const idContenedores = Array.from(
      new Set(
        Object.keys(contenedoresHoy)
          .filter((key) => contenedoresHoy[key] === true) // Solo incluir claves con valores true
          .map((key) => key.split("-")[0]) // Extraer solo el ID antes del guion
      )
    );

    return {
      fecha: fechaHoy,
      idContenedores,
    };
  }
}

export default FosaController;
