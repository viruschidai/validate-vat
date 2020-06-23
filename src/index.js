const url = require('url');
const http = require('http');

const serviceUrl = 'https://ec.europa.eu/taxation_customs/vies/services/checkVatService';
const parsedUrl = url.parse(serviceUrl);

const soapBodyTemplate = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"\n  xmlns:tns1="urn:ec.europa.eu:taxud:vies:services:checkVat:types"\n  xmlns:impl="urn:ec.europa.eu:taxud:vies:services:checkVat">\n  <soap:Header>\n  </soap:Header>\n  <soap:Body>\n    <tns1:checkVat xmlns:tns1="urn:ec.europa.eu:taxud:vies:services:checkVat:types"\n     xmlns="urn:ec.europa.eu:taxud:vies:services:checkVat:types">\n     <tns1:countryCode>%COUNTRY_CODE%</tns1:countryCode>\n     <tns1:vatNumber>%VAT_NUMBER%</tns1:vatNumber>\n    </tns1:checkVat>\n  </soap:Body>\n</soap:Envelope>';

const EU_COUNTRIES_CODES = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'EL', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB'];

const ERROR_MSG = {
  'INVALID_INPUT_COUNTRY': 'The country code in the VAT ID is invalid',
  'INVALID_INPUT_NUMBER': 'The VAT number part is empty or invalid',
  'SERVICE_UNAVAILABLE': 'The VIES VAT service is unavailable, please try again later',
  'MS_UNAVAILABLE': 'The VAT database of the requested member country is unavailable, please try again later',
  'MS_MAX_CONCURRENT_REQ': 'The VAT database of the requested member country has had too many requests, please try again later',
  'TIMEOUT': 'The request to VAT database of the requested member country has timed out, please try again later',
  'SERVER_BUSY': 'The service cannot process your request, please try again later',
  'UNKNOWN': 'Unknown error'
};

var headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'soap node',
  'Accept': 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
  'Accept-Encoding': 'none',
  'Accept-Charset': 'utf-8',
  'Connection': 'close',
  'Host': parsedUrl.hostname,
  'SOAPAction': 'urn:ec.europa.eu:taxud:vies:services:checkVat/checkVat',
};

function getReadableErrorMsg(faultstring) {
  if (ERROR_MSG[faultstring]) {
    return ERROR_MSG[faultstring];
  } else {
    return ERROR_MSG['UNKNOWN'];
  }
};

function parseSoapResponse(soapMessage) {
  function parseField(field) {
    const regex = new RegExp("<" + field + ">\((\.|\\s)\*?\)</" + field + ">", 'gm');
    var match = regex.exec(soapMessage);
    if (!match) {
      let ex = new Error("Failed to parse field " + field);
      ex.soapMessage = soapMessage;
      throw ex;
    }
    var value = match[1].trim();
    if (value == '---') {
      value = '';
    }
    return value;
  };

  var hasFault = soapMessage.match(/<soap:Fault>\S+<\/soap:Fault>/g);
  if (hasFault) {
    let msg = getReadableErrorMsg(parseField('faultstring'));
    let ex = new Error(msg);
    ex.code = parseField('faultcode');
    throw ex;
  }
  return {
    countryCode: parseField('countryCode'),
    vatNumber: parseField('vatNumber'),
    valid: parseField('valid') === 'true',
    serverValidated: true,
    name: parseField('name'),
    address: parseField('address').replace(/\n/g, ', '),
  };
};

var vatIDRegexp = /^[A-Z]{2,2}[0-9A-Z]{2,13}$/;

/**
 * @param vatID {string} VAT ID, starting with 2-letter country code, then the number,
 *     e.g. "DE1234567890"
 * @returns {Promise}
 * async function (you can `await` it)
 * @returns {
 *   valid {boolean}   the VAT ID is OK
 *   serverValidated {boolean}   the ID was checked against the state server
 *   name {string},
 *   address {string},
 * };
 */
function validateVAT(vatID, timeout) {
  var countryCode = vatID.substr(0, 2);
  var vatNumber = vatID.substr(2);
  if (EU_COUNTRIES_CODES.indexOf(countryCode) < 0) {
    throw new Error(ERROR_MSG['INVALID_INPUT_COUNTRY']);
  }
  if (!vatIDRegexp.test(vatID)) {
    throw new Error(ERROR_MSG['INVALID_INPUT_NUMBER']);
  }
  var xml = soapBodyTemplate
      .replace('%COUNTRY_CODE%', countryCode)
      .replace('%VAT_NUMBER%', vatNumber)
      .replace('\n', '').trim();
  headers['Content-Length'] = Buffer.byteLength(xml, 'utf8');
  var options = {
    host: parsedUrl.host,
    method: 'POST',
    path: parsedUrl.path,
    headers: headers,
    family: 4,
  };
  return new Promise((successCallback, errorCallback) => {
    // TODO use r2
    var req = http.request(options, res => {
      var str = "";
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        return str += chunk;
      });
      return res.on('end', () => {
        try {
          successCallback(parseSoapResponse(str));
        } catch (ex) {
          if (ex.code == "soap:Server") { // Source data server is down
            // Avoid to block our customers just because the state can't keep its servers up
            // Presume valid
            successCallback({
              countryCode,
              vatNumber,
              valid: true,
              serverValidated: false,
              name: '',
              address: '',
            });
            return;
          }
          errorCallback(ex);
          return;
        }
      });
    });
    if (timeout) {
      req.setTimeout(timeout, () => {
        return req.abort();
      });
    }
    req.on('error', errorCallback);
    req.write(xml);
    req.end();
  });
};

var exports;
module.exports = exports = validateVAT;
