import { Model, Sequelize } from "sequelize";

// Interfaz que define los atributos del modelo Orden
interface OrdenAttributes {
  idOrden: number;
  idContenedor: number;
  idCamion: number;
  origen: string;
  idCedis: number;
  idMongoProductos: string;
}

// Exporta una función que define el modelo Orden
module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class Orden extends Model<OrdenAttributes> implements OrdenAttributes {
    public idOrden!: number;
    public idContenedor!: number;
    public idCamion!: number;
    public origen!: string;
    public idCedis!: number;
    public idMongoProductos!: string;

    // Relaciòn de pertenencia con el modelo Contenedor
    static associate(models: any) {
      Orden.belongsTo(models.Contenedor, {
        foreignKey: "idContenedor",
      });
      Orden.belongsTo(models.Camion, {
        foreignKey: "idCamion",
      });
      Orden.belongsTo(models.Cedis, {
        foreignKey: "idCedis",
      });
    }
  }

  Orden.init(
    {
      idOrden: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      idContenedor: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idCamion: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      origen: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      idCedis: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idMongoProductos: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Orden",
    }
  );

  return Orden;
};
