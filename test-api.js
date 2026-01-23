import http from "http";

// Minimal 1x1 pixel JPEG as base64 (for testing)
const dummyImageBase64 =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/AB//2Q==";

const data = JSON.stringify({
  name: "Test Visitor",
  purpose: "Meeting",
  registrationType: "visitor",
  destinations: "[]",
  personToVisit: "John Doe",
  rfid: "123456789",
  idScanImage: dummyImageBase64,
  photoImage: dummyImageBase64,
});

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/api/visitors",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  res.setEncoding("utf8");
  let body = "";
  res.on("data", (chunk) => {
    body += chunk;
  });
  res.on("end", () => {
    console.log("Response:", body);
  });
});

req.on("error", (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
