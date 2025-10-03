import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env'), override: false });

export const notificationsEnv = {
	sendGridApiKey: process.env['SENDGRID_API_KEY'],
	fromEmail: process.env['FROM_EMAIL'],
};
