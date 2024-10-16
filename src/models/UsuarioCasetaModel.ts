import { Model, Sequelize } from "sequelize";

// Interfaz que define los atributos del modelo UsuarioCaseta
interface UsuarioCasetaAttributes {
  idUsuario: number;
  idCaseta: number;
}

module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class UsuarioCaseta
    extends Model<UsuarioCasetaAttributes>
    implements UsuarioCasetaAttributes
  {
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
