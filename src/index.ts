import Server from "./providers/Server";
import { PORT, NODE_ENV } from "./config";
import express from "express";
import cors from "cors";
import CedisController from "./controllers/CedisController";
import CamionController from "./controllers/CamionController";
import CasetaController from "./controllers/CasetaController";
import ContenedorController from "./controllers/ContenedorController";
import EntradaController from "./controllers/EntradaController";
import ModeloController from "./controllers/ModeloController";
import OrdenController from "./controllers/OrdenController";
import SalidaController from "./controllers/SalidaController";
import UsuarioCasetaController from "./controllers/UsuarioCasetaController";
import UsuarioController from "./controllers/UsuarioController";
import QrController from "./controllers/QrController";
import MongoProductosController from "./controllers/NoSql/MongoProductosController";
import FosaController from "./controllers/NoSql/FosaController";
import PriorityProductController from "./controllers/NoSql/ProductoPrioridadController";
import InventarioFabricaController from "./controllers/NoSql/InventarioFabricaController";
import PuertaController from "./controllers/PuertaController";
import PuertaContenedorController from "./controllers/PuertaContenedorController";

const server = new Server({
  port: PORT,
  env: NODE_ENV,
  middlewares: [express.json(), express.urlencoded({ extended: true }), cors()],
  controllers: [
    CedisController.instance,
    CamionController.instance,
    CasetaController.instance,
    ContenedorController.instance,
    EntradaController.instance,
    ModeloController.instance,
    OrdenController.instance,
    SalidaController.instance,
    UsuarioCasetaController.instance,
    UsuarioController.instance,
    MongoProductosController.instance,
    QrController.instance,
    FosaController.instance,
    PriorityProductController.instance,
    InventarioFabricaController.instance,
    PuertaController.instance,
    PuertaContenedorController.instance,
  ],
});

server.init();
