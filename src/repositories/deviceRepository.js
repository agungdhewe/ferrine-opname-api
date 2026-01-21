import pool from '../config/database.js';
import DbContract from '../config/DbContract.js';

const { Device } = DbContract;

/**
 * Mendapatkan data device berdasarkan ID.
 * @param {number|string} deviceId 
 * @returns {Promise<Object|null>}
 */
export const getDeviceById = async (deviceId) => {
    const query = `
        SELECT * FROM ${Device.TABLE} 
        WHERE ${Device.Columns.deviceId} = $1 
        AND ${Device.Columns.isDeleted} = false
    `;
    const result = await pool.query(query, [deviceId]);
    return result.rows[0] || null;
};
