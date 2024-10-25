import { Router } from "express";
import { Model, Document } from "mongoose";

export default abstract class AbstractNoSqlController<T extends Document> {
    // Atributos de la instancia
    private _router: Router;
    private _prefix: string;
    protected model: Model<T>;

    // Métodos getter
    public get router(): Router {
        return this._router;
    }

    public get prefix(): string {
        return this._prefix;
    }

    // Método constructor
    protected constructor(prefix: string, model: Model<T>) {
        this._router = Router();
        this._prefix = prefix;
        this.model = model;
        this.initializeRoutes();
    }

    // Método abstracto (debe ser implementado en las clases hijas)
    protected abstract initializeRoutes(): void;
}
