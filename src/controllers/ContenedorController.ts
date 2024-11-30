import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { createJWT, validateJWT, createJWTAdmin } from "../utils/jwt";
import { validateTokenMiddleware } from "../middlewares/validateToken";
import FosaController from "./NoSql/FosaController";

class ContenedorController extends AbstractController {
  private static _instance: ContenedorController;
  public static get instance(): ContenedorController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new ContenedorController("contenedor");
    return this._instance;
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
      "/disponibles",
      validateTokenMiddleware,
      this.getDisponibles.bind(this)
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
    this.router.put(
      "/actualizarStatus/:idContenedor",
      validateTokenMiddleware,
      this.putActualizarStatus.bind(this)
    );
    this.router.delete(
      "/eliminar/:id",
      validateTokenMiddleware,
      this.deletePorId.bind(this)
    );
    this.router.post("/login", this.postLogin.bind(this));
    this.router.post(
      "/validatoken",
      validateTokenMiddleware,
      this.postValidaToken.bind(this)
    );
    this.router.post(
      "/admintoken",
      validateTokenMiddleware,
      this.postTokenSinExpiracion.bind(this)
    );
    this.router.get(
      "/enTransitoDescargandoFosa",
      validateTokenMiddleware,
      this.getEnTransitoDescargandoFosa.bind(this)
    );
    this.router.post("/obtenerContenedoresList", this.postObtenerContenedoresInfoList.bind(this));
  }

  private async getTest(req: Request, res: Response) {
  /**
    * Prueba de conexión con el controlador.
    * 
    * @param - None
    * @returns - None
  */

    try {
      res.status(200).send("Contenedor works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el Contenedor ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    /**
      * Crea un nuevo contenedor en la base de datos.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `userName` (string en `req.body`): Nombre de usuario asociado al contenedor.
      *   - `capacidad` (number en `req.body`): Capacidad del contenedor.
      *   - `contraseña` (string en `req.body`): Contraseña del contenedor.
      *   - `tipo` (string en `req.body`): Tipo de contenedor.
      *   - `status` (string en `req.body`): Estado del contenedor.
      *   - `rental` (boolean en `req.body`): Indica si es de alquiler.
      * @param res - Objeto de respuesta HTTP.
      * @returns Contenedor creado o mensaje de error.
    */

    try {
      const { userName, capacidad, contraseña, tipo, status, rental } =
        req.body;
      const contenedor = await db.Contenedor.create({
        userName,
        capacidad,
        contraseña,
        tipo,
        status,
        rental,
      });

      res.status(201).send(contenedor);
    } catch (error) {
      res.status(500).send(`Error al crear el Contenedor ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    /**
      * Obtiene todos los contenedores almacenados en la base de datos.
      * 
      * @param - None
      * @returns Lista de contenedores o mensaje de error.
    */

    try {
      const contenedores = await db.Contenedor.findAll();
      res.status(200).json(contenedores);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar los Contenedores: ${error}` });
    }
  }

  private async getDisponibles(req: Request, res: Response) {
    /**
      * Obtiene todos los contenedores disponibles.
      * 
      * @param - None
      * @returns Lista de contenedores disponibles o mensaje de error.
    */

    try {
      const contenedores = await db.Contenedor.findAll({
        where: { status: "Disponible" },
      });
      res.status(200).json(contenedores);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar los Contenedores: ${error}` });
    }
  }

  private async getPorId(req: Request, res: Response) {
    /**
      * Obtiene un contenedor por su ID.
      *   
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID único del contenedor a consultar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Contenedor encontrado o mensaje de error.
    */

    try {
      const { id } = req.params;
      const contenedor = await db.Contenedor.findByPk(id);
      if (!contenedor) {
        res.status(404).send(`Contenedor con id ${id} no encontrado`);
        return;
      }
      res.status(200).send(contenedor);
    } catch (error) {
      res.status(500).send(`Error al consultar el Contenedor ${error}`);
    }
  }

  private async putActualizar(req: Request, res: Response) {
    /**
      * Actualiza los datos de un contenedor por su ID.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID único del contenedor a actualizar.
      *   - `capacidad` (number en `req.body`): Nueva capacidad del contenedor.
      * @param res - Objeto de respuesta HTTP.
      * @returns Contenedor actualizado o mensaje de error.
    */

    try {
      const { id } = req.params;
      const { capacidad } = req.body;
      const contenedor = await db.Contenedor.findByPk(id);
      if (!contenedor) {
        res.status(404).send(`Contenedor con id ${id} no encontrado`);
        return;
      }
      contenedor.capacidad = capacidad;
      await contenedor.save();
      res.status(200).send(contenedor);
    } catch (error) {
      res.status(500).send(`Error al actualizar el Contenedor: ${error}`);
    }
  }

  private async putActualizarStatus(req: Request, res: Response) {
    /**
      * Actualiza el estado de un contenedor por su ID.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `idContenedor` (string en `req.params`): ID único del contenedor a actualizar.
      *   - `status` (string en `req.body`): Nuevo estado del contenedor.
      * @param res - Objeto de respuesta HTTP.
      * @returns Contenedor actualizado o mensaje de error.
    */

    try {
      const { idContenedor } = req.params;
      const { status } = req.body;
      const contenedor = await db.Contenedor.findByPk(idContenedor);
      if (!contenedor) {
        res.status(404).send(`Contenedor con id ${idContenedor} no encontrado`);
        return;
      }
      contenedor.status = status;
      await contenedor.save();
      res.status(200).send(contenedor);
    } catch (error) {
      res.status(500).send(`Error al actualizar el Contenedor: ${error}`);
    }
  }

  public async ActualizarStatus(id: number, status: string) {
    /**
      * Actualiza el estado de un contenedor por su ID.
      * 
      * @param id - ID único del contenedor a actualizar.
      * @param status - Nuevo estado del contenedor.
      * @returns `true` si el estado fue actualizado exitosamente, `false` si no se encontró el contenedor o ocurrió un error.
    */

    try {
      const contenedor = await db.Contenedor.findByPk(id);
      if (!contenedor) {
        return false;
      }
      contenedor.status = status;
      await contenedor.save();
      return true;
    } catch (error) {
      return false;
    }
  }

  private async deletePorId(req: Request, res: Response) {
    /**
      * Elimina un contenedor por su ID.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `id` (string en `req.params`): ID único del contenedor a eliminar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Mensaje de éxito o error.
    */

    try {
      const { id } = req.params;
      const contenedor = await db.Contenedor.findByPk(id);
      if (!contenedor) {
        res.status(404).send(`Contenedor con id ${id} no encontrado`);
        return;
      }
      await contenedor.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).send(`Error al eliminar el Contenedor ${error}`);
    }
  }

  private async postLogin(req: Request, res: Response) {
    /**
      * Realiza el login para un contenedor.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `userName` (string en `req.body`): Nombre de usuario asociado al contenedor.
      *   - `contraseña` (string en `req.body`): Contraseña del contenedor.
      * @param res - Objeto de respuesta HTTP.
      * @returns Token de autenticación o mensaje de error.
    */

    try {
      const { userName, contraseña } = req.body;
      const contenedor = await db.Contenedor.findOne({ where: { userName } });
      if (!contenedor) {
        res.status(404).send("Las credenciales ingresadas son incorrectas");
        return;
      }
      const isPasswordValid = await contenedor.validatePassword(contraseña);
      if (!isPasswordValid) {
        res.status(404).json({
          message: "Las credenciales ingresadas son incorrectas",
          data: {},
        });
        return;
      }
      const token = createJWT({
        idContenedor: contenedor.idContenedor,
        userName: contenedor.userName,
        tipo: contenedor.tipo,
      });
      res.status(200).json({
        message: "Datos validados exitosamente",
        data: {
          isValid: true,
          token: token,
          idContenedor: contenedor.idContenedor,
        },
      });
    } catch (error) {
      res.status(500).send(`Error al hacer login: ${error}`);
    }
  }

  private async postValidaToken(req: Request, res: Response) {
    /**
      * Valida un token proporcionado.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `token` (string en `req.body`): Token a validar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Validación del token o mensaje de error.
    */

    try {
      const { token } = req.body;

      if (!token) {
        return res
          .status(401)
          .json({ message: "Token no proporcionado", data: {} });
      }

      const decodedToken = validateJWT(token);

      if (decodedToken) {
        // Si el token es válido, devolver una respuesta exitosa
        return res.status(200).json({
          message: "Datos validados exitosamente",
          data: { userName: decodedToken.userName, tipo: decodedToken.tipo },
        });
      } else {
        return res.status(401).json({ message: "Token inválido", data: {} });
      }
    } catch (error) {
      // Manejo del error para que no se corte el backend
      console.error("Error en el controlador:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  private async postTokenSinExpiracion(req: Request, res: Response) {
    /**
      * Genera un token sin expiración para un contenedor.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `userName` (string en `req.body`): Nombre de usuario asociado al contenedor.
      *   - `contraseña` (string en `req.body`): Contraseña del contenedor.
      * @param res - Objeto de respuesta HTTP.
      * @returns Token sin expiración o mensaje de error.
    */

    try {
      const { userName, contraseña } = req.body;
      const contenedor = await db.Contenedor.findOne({ where: { userName } });
      if (!contenedor) {
        res.status(404).send("Las credenciales ingresadas son incorrectas");
        return;
      }
      const isPasswordValid = await contenedor.validatePassword(contraseña);
      if (!isPasswordValid) {
        res.status(404).send("Las credenciales ingresadas son incorrectas");
        return;
      }
      const token = createJWTAdmin({
        idContenedor: contenedor.idContenedor,
        userName: contenedor.userName,
        tipo: contenedor.tipo,
      });
      res.status(200).json({
        message: "Datos validados exitosamente",
        data: { isValid: true, token: token },
      });
    } catch (error) {
      res.status(500).send(`Error al hacer login: ${error}`);
    }
  }

  private async getEnTransitoDescargandoFosa(req: Request, res: Response) {
    /**
      * Obtiene los contenedores en tránsito, descargando, y los asignados a la fosa.
      * 
      * @param - None
      * @returns Lista de contenedores en tránsito, descargando, y en la fosa o mensaje de error.
    */

    try {
      const transito = await db.Contenedor.findAll({
        where: {
          status: ["En transito"],
        },
      });

      const descargando = await db.Contenedor.findAll({
        where: {
          status: "Descargando",
        },
      });

      const fosaInstance = FosaController.instance;
      const fosa = await fosaInstance.obtenerContenedoresHoy();

      res.status(200).json({ transito, descargando, fosa });
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar los Contenedores: ${error}` });
    }
  }

  private async postObtenerContenedoresInfoList(req: Request, res: Response) {
    /**
      * Obtiene información de una lista específica de contenedores.
      * 
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - `contenedoresList` (array en `req.body`): Lista de IDs de contenedores a consultar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Lista de contenedores encontrados o mensaje de error.
    */

    try {

      const { contenedoresList } = req.body;

      if (!Array.isArray(contenedoresList)) {
        return res.status(400).json({ error: "La lista de contenedores es inválida o está vacía" });
      }

      if (contenedoresList.length === 0) {
        return res.status(200).json({ data: [] });
      }

      // Consultar los contenedores cuyos IDs están en la lista
      const contenedores = await db.Contenedor.findAll({
        where: {
          idContenedor: contenedoresList, // Filtrar por los IDs recibidos en la lista
        },
      });

      if (contenedores.length === 0) {
        return res.status(404).json({ message: "No se encontraron contenedores disponibles con los IDs proporcionados" });
      }

      // Ordenar los contenedores según el orden de contenedoresList
      const contenedoresOrdenados = contenedores.sort((a: any, b: any) => {
        const indexA = contenedoresList.indexOf(a.dataValues.idContenedor.toString());
        const indexB = contenedoresList.indexOf(b.dataValues.idContenedor.toString());
        return indexA - indexB;
      });

      // Devolver los contenedores encontrados y ordenados
      return res.status(200).json({ data: contenedoresOrdenados });
    } catch (error) {
      return res.status(500).json({ error: `Error al consultar los Contenedores: ${error}` });
    }
  }


}

export default ContenedorController;
