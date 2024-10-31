import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { createJWT, validateJWT, createJWTAdmin } from "../utils/jwt";
import { validateTokenMiddleware } from "../middlewares/validateToken";
import { where } from "sequelize";
import { isValid } from "date-fns";

class UsuarioController extends AbstractController {
  private static _instance: UsuarioController;
  public static get instance(): UsuarioController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new UsuarioController("usuario");
    return this._instance;
  }

  protected initializeRoutes(): void {
    this.router.get("/test", validateTokenMiddleware, this.getTest.bind(this));
    this.router.post("/crear", this.postCrear.bind(this));
    this.router.get("/consultarTodos", this.getTodos.bind(this));
    this.router.get("/consultar/:id", this.getPorId.bind(this));
    this.router.put("/actualizar/:id", this.putActualizar.bind(this));
    this.router.delete("/eliminar/:id", this.deletePorId.bind(this));
    this.router.post("/login", this.postLogin.bind(this));
    this.router.post("/validatoken", this.postValidaToken.bind(this));
    this.router.post("/admintoken", this.postTokenSinExpiracion.bind(this));
    this.router.post("/loginCaseta", this.postLoginCaseta.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    /**
     * Prueba de conexión con el controlador
     * @param - None
     * @returns - None
     */
    try {
      res.status(200).send("Usuario Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el Usuario ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    try {
      const {
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        userName,
        contraseña,
        rol,
      } = req.body;
      const usuario = await db.Usuario.create({
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        userName,
        contraseña,
        rol,
      });

      res.status(201).send(usuario);
    } catch (error) {
      res.status(500).send(`Error al crear el Usuario ${error}`);
    }
  }

  private async getTodos(req: Request, res: Response) {
    try {
      const usuarios = await db.Usuario.findAll();
      res.status(200).json(usuarios);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al consultar los Usuarios: ${error}` });
    }
  }

  private async getPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const usuario = await db.Usuario.findByPk(id);
      if (!usuario) {
        res.status(404).send(`Usuario con id ${id} no encontrado`);
        return;
      }
      res.status(200).send(usuario);
    } catch (error) {
      res.status(500).send(`Error al consultar el Usuario: ${error}`);
    }
  }

  private async putActualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        userName,
        contraseña,
        rol,
      } = req.body;
      const usuario = await db.Usuario.findByPk(id);
      if (!usuario) {
        res.status(404).send(`Usuario con id ${id} no encontrado`);
        return;
      }
      usuario.nombre = nombre;
      usuario.apellidoPaterno = apellidoPaterno;
      usuario.apellidoMaterno = apellidoMaterno;
      usuario.userName = userName;
      usuario.contraseña = contraseña;
      usuario.rol = rol;
      await usuario.save();
      res.status(200).send(usuario);
    } catch (error) {
      res.status(500).send(`Error al actualizar el Usuario: ${error}`);
    }
  }

  private async deletePorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const usuario = await db.Usuario.findByPk(id);
      if (!usuario) {
        res.status(404).send(`Usuario con id ${id} no encontrado`);
        return;
      }
      await usuario.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).send(`Error al eliminar el Usuario: ${error}`);
    }
  }

  private async postLogin(req: Request, res: Response) {
    try {
      const { userName, contraseña } = req.body;
      const usuario = await db.Usuario.findOne({ where: { userName } });
      const idUsuario = usuario.idUsuario;
      const rolUsuario = usuario.rol;
      if (!usuario) {
        res.status(404).json({
          message: "Las credenciales ingresadas son incorrectas",
          data: {},
        });
        return;
      }
      const isPasswordValid = await usuario.validatePassword(contraseña);
      if (!isPasswordValid) {
        res.status(401).json({
          message: "Las credenciales ingresadas son incorrectas",
          data: {},
        });
        return;
      }
      const token = createJWT({ idUsuario: idUsuario, rolUsuario: rolUsuario });
      res.status(200).json({
        message: "Datos validados exitosamente",
        data: { isValid: true, token: token },
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
          data: { rolUsuario: decodedToken.rolUsuario },
        });
      } else {
        // Si el token es inválido, devolver una respuesta de error
        return res.status(401).json({ message: "Token no válido", data: {} });
      }
    } catch (err) {
      // Manejo del error para que no se corte el backend
      console.error("Error en el controlador:", err);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  private async postTokenSinExpiracion(req: Request, res: Response) {
    try {
      const { userName, contraseña } = req.body;
      const usuario = await db.Usuario.findOne({ where: { userName } });
      const idUsuario = usuario.idUsuario;
      const rolUsuario = usuario.rol;
      if (!usuario) {
        res.status(404).json({
          message: "Las credenciales ingresadas son incorrectas",
          data: {},
        });
        return;
      }
      const isPasswordValid = await usuario.validatePassword(contraseña);
      if (!isPasswordValid) {
        res.status(401).json({
          message: "Las credenciales ingresadas son incorrectas",
          data: {},
        });
        return;
      }
      const token = createJWTAdmin({
        idUsuario: idUsuario,
        rolUsuario: rolUsuario,
      });
      res.status(200).json({
        message: "Datos validados exitosamente",
        data: { isValid: true, token: token },
      });
    } catch (error) {
      res.status(500).send(`Error al hacer login: ${error}`);
    }
  }

  private async postLoginCaseta(req: Request, res: Response) {
    try {
      const { userName, contraseña } = req.body;
      const usuario = await db.Usuario.findOne({ where: { userName } });
      const idUsuario = usuario.idUsuario;
      const rolUsuario = usuario.rol;

      if (!usuario) {
        res.status(404).json({
          message: "Las credenciales ingresadas son incorrectas",
          data: {},
        });
        return;
      }

      if (usuario.rol !== "Caseta") {
        res.status(403).json({
          message: "Las credenciales ingresadas son incorrectas",
          data: {},
        });
        return;
      }

      const isPasswordValid = await usuario.validatePassword(contraseña);
      if (!isPasswordValid) {
        res.status(401).json({
          message: "Las credenciales ingresadas son incorrectas",
          data: {},
        });
        return;
      }

      const token = createJWT({ idUsuario: idUsuario, rolUsuario: rolUsuario });
      res.status(200).json({
        message: "Datos validados exitosamente",
        data: { isValid: true, token: token },
      });
    } catch (error) {
      res.status(500).send(`Error al hacer login: ${error}`);
    }
  }
}

export default UsuarioController;
