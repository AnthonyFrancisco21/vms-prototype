import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres:admindb@localhost:5432/vms_db",
});

client
  .connect()
  .then(() => {
    return client.query(
      "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'visitors' ORDER BY ordinal_position",
    );
  })
  .then((result) => {
    console.log("Visitors table schema:");
    result.rows.forEach((row) => {
      console.log(
        `${row.column_name}: ${row.data_type} ${row.is_nullable} default=${row.column_default}`,
      );
    });
    client.end();
  })
  .catch((err) => {
    console.error("Error:", err);
    client.end();
  });
