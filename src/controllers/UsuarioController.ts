import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
import { createJWT, validateJWT, createJWTAdmin } from "../utils/jwt";
import { validateTokenMiddleware } from "../middlewares/validateToken";

class UsuarioController extends AbstractController {
  private static _instance: UsuarioController;
  public static get instance(): UsuarioController {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new UsuarioController("usuario");
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
    this.router.post("/login", this.postLogin.bind(this));
    this.router.post("/validatoken", this.postValidaToken.bind(this));
    this.router.post(
      "/admintoken",
      validateTokenMiddleware,
      this.postTokenSinExpiracion.bind(this)
    );
    this.router.post("/loginCaseta", this.postLoginCaseta.bind(this));
  }

  private async getTest(req: Request, res: Response) {
    /**
      * Prueba de conexión con el controlador.
      *
      * @param req - Objeto de solicitud HTTP.
      * @param res - Objeto de respuesta HTTP.
      * @returns Mensaje indicando que la conexión funciona o un mensaje de error.
    */

    try {
      res.status(200).send("Usuario Works");
    } catch (error) {
      res.status(500).send(`Error al conectar con el Usuario ${error}`);
    }
  }

  private async postCrear(req: Request, res: Response) {
    /**
      * Crea un nuevo usuario en la base de datos.
      *
      * @param req - Objeto de solicitud HTTP que debe contener en `req.body`:
      *   - `nombre` (string): Nombre del usuario.
      *   - `apellidoPaterno` (string): Apellido paterno del usuario.
      *   - `apellidoMaterno` (string): Apellido materno del usuario.
      *   - `userName` (string): Nombre de usuario.
      *   - `contraseña` (string): Contraseña del usuario.
      *   - `rol` (string): Rol del usuario.
      * @param res - Objeto de respuesta HTTP.
      * @returns El registro creado o un mensaje de error.
    */

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
    /**
      * Obtiene todos los usuarios almacenados en la base de datos.
      *
      * @param req - Objeto de solicitud HTTP.
      * @param res - Objeto de respuesta HTTP.
      * @returns Lista de usuarios o un mensaje de error.
    */

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
    /**
      * Obtiene un usuario por su ID.
      *
      * @param req - Objeto de solicitud HTTP que debe contener en `req.params`:
      *   - `id` (number): ID del usuario a buscar.
      * @param res - Objeto de respuesta HTTP.
      * @returns El usuario encontrado o un mensaje de error si no se encuentra.
    */

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
    /**
      * Actualiza un usuario existente por su ID.
      *
      * @param req - Objeto de solicitud HTTP que debe contener:
      *   - En `req.params`:
      *     - `id` (number): ID del usuario a actualizar.
      *   - En `req.body`:
      *     - `nombre` (string): Nuevo nombre del usuario.
      *     - `apellidoPaterno` (string): Nuevo apellido paterno del usuario.
      *     - `apellidoMaterno` (string): Nuevo apellido materno del usuario.
      *     - `userName` (string): Nuevo nombre de usuario.
      *     - `contraseña` (string): Nueva contraseña del usuario.
      *     - `rol` (string): Nuevo rol del usuario.
      * @param res - Objeto de respuesta HTTP.
      * @returns El usuario actualizado o un mensaje de error si no se encuentra.
    */

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
    /**
      * Elimina un usuario por su ID.
      *
      * @param req - Objeto de solicitud HTTP que debe contener en `req.params`:
      *   - `id` (number): ID del usuario a eliminar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Un mensaje de confirmación si se elimina correctamente o un mensaje de error si no se encuentra.
    */

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
    /**
      * Inicia sesión de un usuario utilizando `userName` y `contraseña`.
      *
      * @param req - Objeto de solicitud HTTP que debe contener en `req.body`:
      *   - `userName` (string): Nombre de usuario.
      *   - `contraseña` (string): Contraseña del usuario.
      * @param res - Objeto de respuesta HTTP.
      * @returns Un token JWT si las credenciales son correctas o un mensaje de error.
    */

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
        data: { isValid: true, token: token, rolUsuario: rolUsuario },
      });
    } catch (error) {
      res.status(500).send(`Error al hacer login: ${error}`);
    }
  }

  private async postValidaToken(req: Request, res: Response) {
    /**
      * Valida un token JWT enviado en el cuerpo de la solicitud.
      *
      * @param req - Objeto de solicitud HTTP que debe contener en `req.body`:
      *   - `token` (string): Token JWT a validar.
      * @param res - Objeto de respuesta HTTP.
      * @returns Respuesta indicando si el token es válido o no.
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
    /**
      * Genera un token JWT sin expiración para el usuario.
      *
      * @param req - Objeto de solicitud HTTP que debe contener en `req.body`:
      *   - `userName` (string): Nombre de usuario.
      *   - `contraseña` (string): Contraseña del usuario.
      * @param res - Objeto de respuesta HTTP.
      * @returns Un token JWT sin expiración si las credenciales son correctas o un mensaje de error.
    */

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
    /**
      * Inicia sesión de un usuario con rol "Caseta".
      *
      * @param req - Objeto de solicitud HTTP que debe contener en `req.body`:
      *   - `userName` (string): Nombre de usuario.
      *   - `contraseña` (string): Contraseña del usuario.
      * @param res - Objeto de respuesta HTTP.
      * @returns Un token JWT si las credenciales son correctas y el rol es "Caseta", o un mensaje de error.
    */

    try {
      const { userName, contraseña } = req.body;
      const usuario = await db.Usuario.findOne({ where: { userName } });
      const idUsuario = usuario.idUsuario;
      const rolUsuario = usuario.rol;
      console.log(req.body);
      console.log(usuario);
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

  public async getPublicPorId(id: number): Promise<number | null> {
    /**
      * Obtiene el ID de un usuario por su ID público.
      *
      * @param id - ID del usuario a buscar.
      * @returns El ID del usuario si se encuentra, o null si no se encuentra o ocurre un error.
    */

    try {
      const usuario = await db.Usuario.findByPk(id);
      return usuario ? usuario.dataValues.idUsuario : null; // Devuelve solo el id si se encuentra, o null si no
    } catch (error) {
      console.error(`Error al consultar el Usuario: ${error}`);
      return null; // Devuelve null en caso de error
    }
  }
}

export default UsuarioController;
