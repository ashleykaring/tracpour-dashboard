import 'dotenv/config';

function readRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function readPort() {
  const parsedPort = Number(process.env.PORT ?? 4000);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    return 4000;
  }

  return parsedPort;
}

export const config = {
  port: readPort(),
  host: process.env.HOST ?? '0.0.0.0',
  supabaseUrl: readRequiredEnv('SUPABASE_URL'),
  supabaseServiceRoleKey: readRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
};
