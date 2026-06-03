const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "High Rush API",
      version: "1.0.0",
      description:
        "API documentation for High Rush authentication and leaderboard system.",
    },
    servers: [
      {
        url: "http://127.0.0.1:3000",
        description: "Local development server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Register, login, logout, and profile routes",
      },
      {
        name: "Leaderboard",
        description: "Score and leaderboard routes",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
      schemas: {
        RegisterRequest: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: {
              type: "string",
              example: "player1",
            },
            password: {
              type: "string",
              example: "123456",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: {
              type: "string",
              example: "player1",
            },
            password: {
              type: "string",
              example: "123456",
            },
          },
        },
        ScoreRequest: {
          type: "object",
          required: ["race_time", "top_speed", "perfect_shifts"],
          properties: {
            race_time: {
              type: "number",
              example: 12.48,
            },
            top_speed: {
              type: "number",
              example: 242.7,
            },
            perfect_shifts: {
              type: "integer",
              example: 3,
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Something went wrong",
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;
