url = require 'url'
http = require 'http'

serviceUrl = 'http://ec.europa.eu/taxation_customs/vies/services/checkVatService'

parsedUrl = url.parse serviceUrl

soapBodyTemplate = '''
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:tns1="urn:ec.europa.eu:taxud:vies:services:checkVat:types"
  xmlns:impl="urn:ec.europa.eu:taxud:vies:services:checkVat">
  <soap:Header>
  </soap:Header>
  <soap:Body>
    <tns1:checkVat xmlns:tns1="urn:ec.europa.eu:taxud:vies:services:checkVat:types"
     xmlns="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
     <tns1:countryCode>_country_code_placeholder_</tns1:countryCode>
     <tns1:vatNumber>_vat_number_placeholder_</tns1:vatNumber>
    </tns1:checkVat>
  </soap:Body>
</soap:Envelope>
'''

EU_COUNTRIES_CODES = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB']

ERROR_MSG =
  'INVALID_INPUT': 'The provided CountryCode is invalid or the VAT number is empty'
  'SERVICE_UNAVAILABLE': 'The VIES VAT service is unavailable, please try again later'
  'MS_UNAVAILABLE': 'The VAT database of the reqeust member country is unavailable, please try again later'
  'TIMEOUT': 'The request to VAT database of the reqeust member country  is time out, please try again later'
  'SERVER_BUSY': 'The service cannot process your request, please try again later'
  'UNKNOWN': 'Unknown error'

headers =
  'Content-Type': 'application/x-www-form-urlencoded'
  'User-Agent': 'node-soap'
  'Accept' : 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8'
  'Accept-Encoding': 'none'
  'Accept-Charset': 'utf-8'
  'Connection': 'close'
  'Host' : parsedUrl.hostname
  'SOAPAction': 'urn:ec.europa.eu:taxud:vies:services:checkVat/checkVat'

getReadableErrorMsg = (faultstring) ->
  if ERROR_MSG[faultstring]?
    return ERROR_MSG[faultstring]
  else
    return ERROR_MSG['UNKNOWN']

# I don't really want to install any xml parser which may require multpiple packages
parseSoapResponse = (soapMessage) ->
  parseField = (field) ->
    regex = new RegExp "<#{field}>\((\.|\\s)\*\)</#{field}>", 'gm'
    match = regex.exec(soapMessage)
  	try
	  	return match[1]
		catch e
			return ERROR_MSG["UNKNOWN"]

  hasFault = soapMessage.match /<soap:Fault>\S+<\/soap:Fault>/g
  if hasFault
    ret =
      faultCode: parseField 'faultcode'
      faultString: parseField 'faultstring'
  else
    ret =
      countryCode: parseField 'countryCode'
      vatNumber: parseField 'vatNumber'
      requestDate: parseField 'requestDate'
      valid: parseField('valid') is 'true'
      name: parseField 'name'
      address: parseField('address').replace /\n/g, ', '

  return ret

module.exports = exports = (countryCode, vatNumber, callback) ->
  if countryCode not in EU_COUNTRIES_CODES or !vatNumber?.length
    return process.nextTick -> callback new Error ERROR_MSG['INVALID_INPUT']

  xml = soapBodyTemplate.replace('_country_code_placeholder_', countryCode)
    .replace('_vat_number_placeholder_', vatNumber)
    .replace('\n', '').trim()

  headers['Content-Length'] = Buffer.byteLength xml, 'utf8'

  options =
    host: parsedUrl.host
    method: 'POST',
    path: parsedUrl.path
    headers: headers

  req = http.request options, (res) ->
    res.setEncoding 'utf8'
    str = ''
    res.on 'data', (chunk) ->
      str += chunk

    res.on 'end', ->
      data = parseSoapResponse str

      if data.faultString?.length
        err = new Error getReadableErrorMsg data.faultString
        err.code = data.faultCode
        return callback err

      return callback null, data

  req.on 'error', callback
  req.write xml
  req.end()

