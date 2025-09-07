import { sequelize } from "../database";

export async function getAllUsersQuery() {
  const users = await sequelize.query("SELECT * FROM users");
  return users[0];
}
