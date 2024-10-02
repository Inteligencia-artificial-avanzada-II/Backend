"use strict";

import fs from "fs";
import path from "path";
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
import config from "../config/config";
const db: any = {};

let sequelize: any;

if (env === "development") {
  sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    {
      dialect: "mysql",
      host: config.development.host,
      define: {
        // Evitar que nos ponga createdAT y updatedAt
        timestamps: false,
        // Evitar que agregue una s al final
        freezeTableName: true,
      },
    }
  );

  // Verificar la conexión a la base de datos
  sequelize
    .authenticate()
    .then(() => {
      console.log("Conexión a la base de datos establecida correctamente.");
    })
    .catch((err: any) => {
      console.error("No se pudo conectar a la base de datos:", err);
    });
}

// Cargar los modelos de base de datos

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    console.log(file);
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    console.log(model.name);
    db[model.name] = model;
  });

// Generar las relaciones entre las tablas

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
