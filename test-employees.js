const BASE_URL = "http://localhost:5000";

// Test data
const testEmployee = {
  employeeId: "EMP001",
  name: "John Doe",
  department: "IT",
  position: "Software Developer",
  rfid: "RFID123456",
  isActive: true,
};

async function testAPI() {
  console.log("🧪 Starting Employee Attendance System Tests...\n");

  try {
    // Test 1: Get all employees (should be empty initially)
    console.log("1. Testing GET /api/employees");
    const employeesResponse = await fetch(`${BASE_URL}/api/employees`);
    const employees = await employeesResponse.json();
    console.log(`   ✅ Found ${employees.length} employees`);

    // Test 2: Register first employee
    console.log("\n2. Testing POST /api/employees (Register Employee)");
    const registerResponse = await fetch(`${BASE_URL}/api/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testEmployee),
    });
    const employee = await registerResponse.json();
    console.log("   ✅ Employee registered:", {
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.name,
      rfid: employee.rfid,
    });

    // Test 3: Get employee by RFID
    console.log("\n3. Testing GET /api/employees/rfid/:rfid");
    const rfidResponse = await fetch(
      `${BASE_URL}/api/employees/rfid/${testEmployee.rfid}`,
    );
    const employeeByRfid = await rfidResponse.json();
    console.log("   ✅ Employee found by RFID:", {
      name: employeeByRfid.name,
      rfid: employeeByRfid.rfid,
    });

    console.log("\n🎉 Basic tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the tests
testAPI();
