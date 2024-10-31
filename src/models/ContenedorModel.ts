import { Model, Sequelize } from "sequelize";
import bcrypt from "bcrypt";

// Interfaz que define los atributos del modelo Contenedor
interface ContenedorAttributes {
  idContenedor: number;
  userNaname: string;
  capacidad: number;
  contraseña: string;
  tipo: string;
}

// Exporta una función que define el modelo Contenedor
module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class Contenedor
    extends Model<ContenedorAttributes>
    implements ContenedorAttributes
  {
    public idContenedor!: number;
    public userNaname!: string;
    public capacidad!: number;
    public contraseña!: string;
    public tipo!: string;
  }

  Contenedor.init(
    {
      idContenedor: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userNaname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      capacidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      contraseña: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tipo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Contenedor",
      hooks: {
        beforeCreate: async (usuario: Contenedor) => {
          const salt = await bcrypt.genSalt(10);
          usuario.contraseña = await bcrypt.hash(usuario.contraseña, salt);
        },
        beforeUpdate: async (usuario: Contenedor) => {
          if (usuario.changed("contraseña")) {
            const salt = await bcrypt.genSalt(10);
            usuario.contraseña = await bcrypt.hash(usuario.contraseña, salt);
          }
        },
      },
    }
  );

  return Contenedor;
};
