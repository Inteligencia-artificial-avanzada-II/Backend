import { Model, Sequelize } from "sequelize";

// Interfaz que define los atributos del modelo Cedis
interface CedisAttributes {
  idCedis: number;
  name: string;
  address: string;
  phone: string;
}

// Exporta una función que define el modelo Cedis
module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class Cedis extends Model<CedisAttributes> implements CedisAttributes {
    public idCedis!: number;
    public name!: string;
    public address!: string;
    public phone!: string;
  }

  Cedis.init(
    {
      idCedis: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Cedis",
    }
  );

  return Cedis;
};
