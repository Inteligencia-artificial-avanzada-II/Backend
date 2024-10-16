import { DateTime } from "aws-sdk/clients/devicefarm";
import { Model, Sequelize } from "sequelize";

// Interfaz que define los atributos del modelo Entrada
interface EntradaAttributes {
  idEntrada: number;
  idCamion: number;
  idContenedor: number;
  idUsuarioCaseta: number;
  fecha: DateTime;
}

// Exporta una función que define el modelo Entrada
module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class Entrada extends Model<EntradaAttributes> implements EntradaAttributes {
    public idEntrada!: number;
    public idCamion!: number;
    public idContenedor!: number;
    public idUsuarioCaseta!: number;
    public fecha!: DateTime;

    // Relación de oertenencia con el modelo Camion
    static associate(models: any) {
      Entrada.belongsTo(models.Camion, {
        foreignKey: "idCamion",
      });
      Entrada.belongsTo(models.UsuarioCaseta, {
        foreignKey: "idUsuarioCaseta",
      });
      Entrada.belongsTo(models.Contenedor, {
        foreignKey: "idContenedor",
      });
    }
  }

  Entrada.init(
    {
      idEntrada: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      idCamion: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idContenedor: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idUsuarioCaseta: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Entrada",
    }
  );

  return Entrada;
};
