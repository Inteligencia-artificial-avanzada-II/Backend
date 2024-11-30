import { Model, Sequelize } from "sequelize";

// Interfaz que define los atributos del modelo UsuarioCaseta
interface UsuarioCasetaAttributes {
  idUsuarioCaseta: number;
  idUsuario: number;
  idCaseta: number;
}

// Exporta una función que define el modelo UsuarioCaseta
module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class UsuarioCaseta
    extends Model<UsuarioCasetaAttributes>
    implements UsuarioCasetaAttributes
  {
    public idUsuarioCaseta!: number;
    public idUsuario!: number;
    public idCaseta!: number;
    // Relación de oertenencia con el modelo Usuario
    static associate(models: any) {
      UsuarioCaseta.belongsTo(models.Usuario, {
        foreignKey: "idUsuario",
      });
      UsuarioCaseta.belongsTo(models.Caseta, {
        foreignKey: "idCaseta",
      });
    }
  }

  UsuarioCaseta.init(
    {
      idUsuarioCaseta: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      idCaseta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "UsuarioCaseta",
    }
  );
  return UsuarioCaseta;
};
