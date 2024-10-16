import { Model, Sequelize } from "sequelize";

// Interfaz que define los atributos del modelo Caseta
interface CasetaAttributes {
  idCaseta: number;
  idCedis: number;
  number: number;
  name: string;
}

// Exporta una función que define el modelo Caseta
module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class Caseta extends Model<CasetaAttributes> implements CasetaAttributes {
    public idCaseta!: number;
    public idCedis!: number;
    public number!: number;
    public name!: string;

    // Relación de oertenencia con el modelo Cedis
    static associate(models: any) {
      Caseta.belongsTo(models.Cedis, {
        foreignKey: "idCedis",
      });
    }
  }

  Caseta.init(
    {
      idCaseta: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      idCedis: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Caseta",
    }
  );
  return Caseta;
};
