//const express = require("express"); JS
import express from "express"; //TS
import AbstractController from "../controllers/AbstractController";
import db from "../models";
import connectToMongoDb from "../models/NoSql";

class Server {
  //Atributos de la clase
  public app!: express.Application;
  private port!: number;
  private env!: string;

  constructor(appInit: {
    port: number;
    env: string;
    middlewares: any[];
    controllers: AbstractController[];
  }) {
    this.app = express();
    this.port = appInit.port;
    this.env = appInit.env;
    this.loadMiddlewares(appInit.middlewares);
    this.loadRoutes(appInit.controllers);
    this.connectDB();
  }

  private loadRoutes(controllers: AbstractController[]) {
    controllers.forEach((controller) => {
      this.app.use(`/${controller.prefix}`, controller.router);
    });
    this.app.get("/", (req, res) => {
      res.send("root works");
    });
  }

  private loadMiddlewares(middlewares: any[]) {
    middlewares.forEach((middleware) => {
      this.app.use(middleware);
    });
  }

  // Conectar tanto a la base de datos SQL (Sequelize) como a MongoDB (NoSQL)
  private async connectDB() {
    try {
      // Conectar a la base de datos SQL usando Sequelize
      await db.sequelize.sync();

      // Conectar a MongoDB
      await connectToMongoDb();
    } catch (error) {
      console.error("Error conectando a las bases de datos:", error);
    }
  }

  public init() {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}
export default Server;
