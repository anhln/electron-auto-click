export const Domain = (sequelize, DataTypes) => {
  const Domain = sequelize.define(
    "Domain",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
      },
    },
    {
      freezeTableName: true,
    }
  );

  return Domain;
};
