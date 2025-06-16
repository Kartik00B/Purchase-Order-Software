const sql = require('msnodesqlv8');

// Update the connection string to include SQL Server authentication
const connectionString = "server=KARTIK_BHAPKAR;Database=Purchase;UID=sa;PWD=root@123;Driver={SQL Server Native Client 11.0}";

const runQuery = (query, params, callback) => {
    if (params && params.length > 0) {
        sql.query(connectionString, query, params, (err, rows) => {
            callback(err, rows);
        });
    } else {
        sql.query(connectionString, query, (err, rows) => {
            callback(err, rows);
        });
    }
};

module.exports = { runQuery };