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
      "/enTransitoYDescargando",
      validateTokenMiddleware,
      this.getEnTransitoDescargandoFosa.bind(this)
    );
  }

  private async getTest(req: Request, res: Response) {
    /**
     * Prueba de conexión con el controlador
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
}

export default ContenedorController;
