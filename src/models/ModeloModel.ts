import { Model, Sequelize } from "sequelize";

// Interfaz que define los atributos del modelo ModeloIA
interface ModeloAttributes {
  idModeloIA: number;
}

// Exporta una función que define el modelo ModeloIA
module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class ModeloIA extends Model<ModeloAttributes> implements ModeloAttributes {
    public idModeloIA!: number;
  }

  ModeloIA.init(
    {
      idModeloIA: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "ModeloIA",
    }
  );

  return ModeloIA;
};
