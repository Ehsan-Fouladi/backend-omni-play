export default () => ({
  port: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    pass: process.env.DB_PASS || '',
    name: process.env.DB_NAME || 'game_db',
  },
});
