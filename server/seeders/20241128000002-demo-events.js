const { v4: uuidv4 } = require("uuid")

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "events",
      [
        {
          id: uuidv4(),
          title: "Tech Conference 2024",
          description:
            "Annual technology conference featuring the latest trends in software development, AI, and cloud computing.",
          dateTime: new Date("2024-12-15 09:00:00"),
          location: "San Francisco Convention Center",
          totalSeats: 500,
          availableSeats: 450,
          price: 299.99,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          title: "Music Festival Summer 2024",
          description: "Three-day music festival featuring top artists from around the world.",
          dateTime: new Date("2024-12-20 18:00:00"),
          location: "Central Park, New York",
          totalSeats: 10000,
          availableSeats: 8500,
          price: 149.99,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          title: "Startup Pitch Competition",
          description: "Watch innovative startups pitch their ideas to top investors.",
          dateTime: new Date("2024-12-25 14:00:00"),
          location: "Silicon Valley Innovation Hub",
          totalSeats: 200,
          availableSeats: 180,
          price: 49.99,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("events", null, {})
  },
}
