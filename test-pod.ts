import { cookies } from 'next/headers';
import fetch from 'node-fetch';
async function run() {
  const data = await require('fs').promises.readFile('.env', 'utf8');
}
run();
