const validateVAT = require("../src/index");

(async () => await test())();

async function test() {
  await testVAT("DE183362587");
  await testVAT("FR60421938861");
}

async function testVAT(vatID) {
  try {
    //var vatID = "FR60421938861";
    var result = await validateVAT(vatID);
    console.log(result.serverValidated ? "EU server says" : "Not validated by server, but presumed", result.valid ? "valid" : "not valid");
    console.log(result);
  } catch (ex) {
    console.error(ex);
  }
}
