var ERROR_MSG, EU_COUNTRIES_CODES, exports, getReadableErrorMsg, headers, http, parseSoapResponse, parsedUrl, serviceUrl, soapBodyTemplate, url,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

url = require('url');

http = require('http');

serviceUrl = 'http://ec.europa.eu/taxation_customs/vies/services/checkVatService';

parsedUrl = url.parse(serviceUrl);

soapBodyTemplate = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"\n  xmlns:tns1="urn:ec.europa.eu:taxud:vies:services:checkVat:types"\n  xmlns:impl="urn:ec.europa.eu:taxud:vies:services:checkVat">\n  <soap:Header>\n  </soap:Header>\n  <soap:Body>\n    <tns1:checkVat xmlns:tns1="urn:ec.europa.eu:taxud:vies:services:checkVat:types"\n     xmlns="urn:ec.europa.eu:taxud:vies:services:checkVat:types">\n     <tns1:countryCode>_country_code_placeholder_</tns1:countryCode>\n     <tns1:vatNumber>_vat_number_placeholder_</tns1:vatNumber>\n    </tns1:checkVat>\n  </soap:Body>\n</soap:Envelope>';

EU_COUNTRIES_CODES = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'EL', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB'];

ERROR_MSG = {
  'INVALID_INPUT': 'The provided CountryCode is invalid or the VAT number is empty',
  'SERVICE_UNAVAILABLE': 'The VIES VAT service is unavailable, please try again later',
  'MS_UNAVAILABLE': 'The VAT database of the requested member country is unavailable, please try again later',
  'MS_MAX_CONCURRENT_REQ': 'The VAT database of the requested member country has had too many requests, please try again later',
  'TIMEOUT': 'The request to VAT database of the requested member country has timed out, please try again later',
  'SERVER_BUSY': 'The service cannot process your request, please try again later',
  'UNKNOWN': 'Unknown error'
};

headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'node-soap',
  'Accept': 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
  'Accept-Encoding': 'none',
  'Accept-Charset': 'utf-8',
  'Connection': 'close',
  'Host': parsedUrl.hostname,
  'SOAPAction': 'urn:ec.europa.eu:taxud:vies:services:checkVat/checkVat'
};

getReadableErrorMsg = function(faultstring) {
  if (ERROR_MSG[faultstring] != null) {
    return ERROR_MSG[faultstring];
  } else {
    return ERROR_MSG['UNKNOWN'];
  }
};

parseSoapResponse = function(soapMessage) {
  var hasFault, parseField, ret;
  parseField = function(field) {
    var err, match, regex;
    regex = new RegExp("<" + field + ">\((\.|\\s)\*?\)</" + field + ">", 'gm');
    match = regex.exec(soapMessage);
    if (!match) {
      err = new Error("Failed to parseField " + field);
      err.soapMessage = soapMessage;
      throw err;
    }
    return match[1];
  };
  hasFault = soapMessage.match(/<soap:Fault>\S+<\/soap:Fault>/g);
  if (hasFault) {
    ret = {
      faultCode: parseField('faultcode'),
      faultString: parseField('faultstring')
    };
  } else {
    ret = {
      countryCode: parseField('countryCode'),
      vatNumber: parseField('vatNumber'),
      requestDate: parseField('requestDate'),
      valid: parseField('valid') === 'true',
      name: parseField('name'),
      address: parseField('address').replace(/\n/g, ', ')
    };
  }
  return ret;
};

module.exports = exports = function(countryCode, vatNumber, timeout, callback) {
  var options, req, xml;
  if (typeof timeout === 'function') {
    callback = timeout;
    timeout = null;
  }
  if (indexOf.call(EU_COUNTRIES_CODES, countryCode) < 0 || !(vatNumber != null ? vatNumber.length : void 0)) {
    return process.nextTick(function() {
      return callback(new Error(ERROR_MSG['INVALID_INPUT']));
    });
  }
  xml = soapBodyTemplate.replace('_country_code_placeholder_', countryCode).replace('_vat_number_placeholder_', vatNumber).replace('\n', '').trim();
  headers['Content-Length'] = Buffer.byteLength(xml, 'utf8');
  options = {
    host: parsedUrl.host,
    method: 'POST',
    path: parsedUrl.path,
    headers: headers,
    family: 4
  };
  req = http.request(options, function(res) {
    var str;
    res.setEncoding('utf8');
    str = '';
    res.on('data', function(chunk) {
      return str += chunk;
    });
    return res.on('end', function() {
      var data, err, ref;
      try {
        data = parseSoapResponse(str);
      } catch (error) {
        err = error;
        return callback(err);
      }
      if ((ref = data.faultString) != null ? ref.length : void 0) {
        err = new Error(getReadableErrorMsg(data.faultString));
        err.code = data.faultCode;
        return callback(err);
      }
      return callback(null, data);
    });
  });
  if (timeout) {
    req.setTimeout(timeout, function() {
      return req.abort();
    });
  }
  req.on('error', callback);
  req.write(xml);
  return req.end();
};
