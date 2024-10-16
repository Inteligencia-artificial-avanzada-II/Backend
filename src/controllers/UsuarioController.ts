import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

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
    this.router.get("/test", this.getTest.bind(this));
    this.router.post("/crear", this.postCrear.bind(this));
    this.router.get("/consultarTodos", this.getTodos.bind(this));
    this.router.get("/consultar/:id", this.getPorId.bind(this));
    this.router.put("/actualizar/:id", this.putActualizar.bind(this));
    this.router.delete("/eliminar/:id", this.deletePorId.bind(this));
    this.router.post("/login", this.postLogin.bind(this));
  }

  private async getTest(req: Request, res: Response) {
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
      if (!usuario) {
        res.status(404).send("Usuario no encontrado");
        return;
      }
      const isPasswordValid = await usuario.validatePassword(contraseña);
      if (!isPasswordValid) {
        res.status(401).send("Contraseña incorrecta");
        return;
      }
      res.status(200).send(true);
    } catch (error) {
      res.status(500).send(`Error al hacer login: ${error}`);
    }
  }
}

export default UsuarioController;
