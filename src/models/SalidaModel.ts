import { DateTime } from "aws-sdk/clients/devicefarm";
import { Model, Sequelize } from "sequelize";

// Interfaz que define los atributos del modelo Salida
interface SalidaAttributes {
  idSalida: number;
  idCamion: number;
  idContenedor: number;
  idUsuarioCaseta: number;
  fecha: DateTime;
}

// Exporta una función que define el modelo Salida
module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class Salida extends Model<SalidaAttributes> implements SalidaAttributes {
    public idSalida!: number;
    public idCamion!: number;
    public idContenedor!: number;
    public idUsuarioCaseta!: number;
    public fecha!: DateTime;

    // Relación de oertenencia con el modelo Camion
    static associate(models: any) {
      Salida.belongsTo(models.Camion, {
        foreignKey: "idCamion",
      });
      Salida.belongsTo(models.UsuarioCaseta, {
        foreignKey: "idUsuarioCaseta",
      });
      Salida.belongsTo(models.Contenedor, {
        foreignKey: "idContenedor",
      });
    }
  }

  Salida.init(
    {
      idSalida: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      idCamion: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      idContenedor: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      modelName: "Salida",
    }
  );

  return Salida;
};
