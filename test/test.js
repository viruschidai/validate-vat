const validateVAT = require("../src/index");

(async () => {
  try {
    var vatID = "DE183362587";
    //var vatID = "FR60421938861";
    var result = await validateVAT(vatID);
    console.log(result.valid ? "valid" : "not valid");
    console.log(result);
  } catch (ex) {
    console.error(ex);
  }
})();
