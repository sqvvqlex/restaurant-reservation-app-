const mysql = require('mysql2/promise');

async function checkAllTables() {
    const pool = mysql.createPool({
        host: 'ipv4.kosmidis.me',
        port: 33066,
        user: 'asavvatianos22b',
        password: 'b559aa7c',
        database: 'asavvatianos22b_db2',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('Getting all tables information...');
        
        // Get all tables
        const [tables] = await pool.query('SHOW TABLES');
        console.log('\n=== Database Tables ===');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`\nTable: ${tableName}`);
        });

        // For each table, get its structure and a sample row
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            console.log(`\n=== Structure of ${tableName} ===`);
            
            // Get table structure
            const [columns] = await pool.query(`DESCRIBE ${tableName}`);
            console.log('\nColumns:');
            columns.forEach(column => {
                console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? `(${column.Key})` : ''} ${column.Default ? `DEFAULT ${column.Default}` : ''}`);
            });

            // Get sample data
            const [rows] = await pool.query(`SELECT * FROM ${tableName} LIMIT 1`);
            if (rows.length > 0) {
                console.log('\nSample row:');
                console.log(JSON.stringify(rows[0], null, 2));
            } else {
                console.log('\nNo data in table');
            }
        }
        
        await pool.end();
    } catch (error) {
        console.error('Error checking tables:', error);
    }
}

checkAllTables(); 