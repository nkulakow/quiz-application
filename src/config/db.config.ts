import { registerAs } from "@nestjs/config";

export default registerAs("database", () => ({
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || "quizapp",
  username: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASS || "mypassword",
  entities: ["./dist/**/*entity.{ts,js}"],
  synchronize: true,
}));
