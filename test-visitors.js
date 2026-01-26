import http from "http";

const req = http.request(
  {
    hostname: "localhost",
    port: 5000,
    path: "/api/visitors",
    method: "GET",
  },
  (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      try {
        const visitors = JSON.parse(data);
        console.log("Total visitors:", visitors.length);
        visitors.forEach((v, i) => {
          console.log(
            `Visitor ${i + 1}: ${v.name} - Status: ${v.status} - RFID: ${v.rfid} - Registration Type: ${v.registrationType}`,
          );
        });
      } catch (e) {
        console.error("Error parsing response:", e.message);
        console.log("Raw response:", data);
      }
    });
  },
);

req.on("error", (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
