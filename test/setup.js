import pool from '../src/config/database.js';
import DbContract from '../src/config/DbContract.js';
import { hashPassword } from '../src/utils/crypto.js';

const { Device, User } = DbContract;

/**
 * Setup data dasar untuk development dan testing.
 * Menjalankan migrasi sederhana dan seeding user/device.
 */
async function setup() {
    try {
        console.log('--- Initializing Database ---');

        // Seed Device ID 1 dengan secret untuk testing signature
        await pool.query(`
            INSERT INTO ${Device.TABLE} (${Device.Keys.deviceId}, ${Device.Keys.name}, ${Device.Keys.secret})
            VALUES (1, 'Development Device', 'mydevicesecret')
            ON CONFLICT (${Device.Keys.deviceId}) DO NOTHING;
        `);

        // Seed User admin (password: rahasia123 untuk example, password123 untuk test)
        // Disini kita gunakan rahasia123 sebagai default dev
        const hashedDev = await hashPassword('rahasia123');
        await pool.query(`
            INSERT INTO ${User.TABLE} (${User.Keys.username}, ${User.Keys.fullname}, ${User.Keys.password}, ${User.Keys.isAdmin})
            VALUES ('admin', 'Developer Admin', $1, TRUE)
            ON CONFLICT (${User.Keys.username}) DO NOTHING;
        `, [hashedDev]);

        console.log('✅ Setup success');
        process.exit(0);
    } catch (err) {
        console.error('❌ Setup failed:', err);
        process.exit(1);
    }
}

setup();
