module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define(
    "Booking",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "events",
          key: "id",
        },
      },
      numberOfSeats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
          max: 10,
        },
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      status: {
        type: DataTypes.ENUM("confirmed", "cancelled", "pending"),
        defaultValue: "confirmed",
        allowNull: false,
      },
      bookingDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "bookings",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["userId", "eventId"],
        },
      ],
    },
  )

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    })

    Booking.belongsTo(models.Event, {
      foreignKey: "eventId",
      as: "event",
    })
  }

  return Booking
}
