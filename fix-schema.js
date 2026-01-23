import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres:admindb@localhost:5432/vms_db",
});

client
  .connect()
  .then(() => {
    console.log("Connected to database");
    return client.query(
      "ALTER TABLE visitors ALTER COLUMN entry_time DROP NOT NULL",
    );
  })
  .then(() => {
    console.log("Made entry_time nullable");
    return client.query(
      "ALTER TABLE visitors ALTER COLUMN entry_time DROP DEFAULT",
    );
  })
  .then(() => {
    console.log("Dropped entry_time default");
    return client.query(
      "ALTER TABLE visitors ALTER COLUMN status SET DEFAULT 'registered'",
    );
  })
  .then(() => {
    console.log("Updated status default");
    return client.query(
      "ALTER TABLE visitors ALTER COLUMN person_to_visit DROP NOT NULL",
    );
  })
  .then(() => {
    console.log("Made person_to_visit nullable");
    client.end();
    console.log("Schema updated successfully");
  })
  .catch((err) => {
    console.error("Error:", err);
    client.end();
  });
