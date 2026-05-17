import { AuthService } from './src/services/authService.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('Testing registration output...');
  try {
    const result = await AuthService.register({
      name: 'Test Final',
      email: `test_${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'client'
    });
    console.log('REGISTRATION RESULT:', JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  }
}

test();
