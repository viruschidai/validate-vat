const validateVAT = require("../src/index");

(async () => await test())();

async function test() {
  await testVAT("DE203159652");
  await testVAT("DE252323088");
  await testVAT("FR60421938861");
  await testVAT("FR04509568416");
  await testVAT("NL853746333B01");
  await testVAT("CZ63079453");
  await testVAT("DK34457212");
  await testVAT("ESQ2801036A");
  await testVAT("FI22283574");
  await testVAT("HR89018712265");
  await testVAT("HR28922587775");
  await testVAT("HU14915969");
  await testVAT("HU19023229");
  await testVAT("IT06363391001");
  await testVAT("IT00754150100");
  await testVAT("PL5262823001");
  await testVAT("PT503504564");
  await testVAT("SE502069927701");
  await testVAT("SE202100287401");
  await testVAT("SK2021853504");
  await testVAT("SK2022199432");
}

async function testVAT(vatID) {
  try {
    //var vatID = "FR60421938861";
    var result = await validateVAT(vatID);
    console.log("EU server", result.serverValidated ? "says" : "not working, but presumed", result.valid ? "valid" : "not valid");
    console.log(result);
  } catch (ex) {
    console.error(ex);
  }
}
