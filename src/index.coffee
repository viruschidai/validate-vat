url = require 'url'
https = require 'https'

serviceUrl = 'https://ec.europa.eu/taxation_customs/vies/services/checkVatService'

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

EU_COUNTRIES_CODES = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'EL', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'XI']

ERROR_MSG =
  'INVALID_INPUT': 'The provided CountryCode is invalid or the VAT number is empty'
  'SERVICE_UNAVAILABLE': 'The VIES VAT service is unavailable, please try again later'
  'MS_UNAVAILABLE': 'The VAT database of the requested member country is unavailable, please try again later'
  'MS_MAX_CONCURRENT_REQ': 'The VAT database of the requested member country has had too many requests, please try again later'
  'TIMEOUT': 'The request to VAT database of the requested member country has timed out, please try again later'
  'SERVER_BUSY': 'The service cannot process your request, please try again later'
  'UNKNOWN': 'Unknown error'

headers =
  'Content-Type': 'text/xml; charset=utf-8'
  'User-Agent': 'node-soap'
  'Accept' : 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8'
  'Accept-Encoding': 'none'
  'Accept-Charset': 'utf-8'
  'Connection': 'close'
  'Host' : parsedUrl.hostname

getReadableErrorMsg = (faultstring) ->
  if ERROR_MSG[faultstring]?
    return ERROR_MSG[faultstring]
  else
    return ERROR_MSG['UNKNOWN']

# I don't really want to install any xml parser which may require multpiple packages
parseSoapResponse = (soapMessage) ->
  parseField = (field) ->
    regex = new RegExp "<#{field}>\((\.|\\s)\*?\)</#{field}>", 'gm'
    match = regex.exec(soapMessage)
    if !match
      err = new Error "Failed to parseField #{field}"
      err.soapMessage = soapMessage
      throw err
    return match[1]

  hasFault = soapMessage.match /<env:Fault>\S+<\/env:Fault>/g
  if hasFault
    ret =
      faultCode: parseField 'faultcode'
      faultString: parseField 'faultstring'
  else
    ret =
      countryCode: parseField 'ns2:countryCode'
      vatNumber: parseField 'ns2:vatNumber'
      requestDate: parseField 'ns2:requestDate'
      valid: parseField('ns2:valid') is 'true'
      name: parseField 'ns2:name'
      address: parseField('ns2:address').replace /\n/g, ', '

  return ret

module.exports = exports = (countryCode, vatNumber, timeout, callback) ->
  if typeof countryCode is 'string'
    countryCode = countryCode.toUpperCase()

  if typeof timeout is 'function'
    callback = timeout
    timeout = null

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
    family: 4

  req = https.request options, (res) ->
    res.setEncoding 'utf8'
    str = ''
    res.on 'data', (chunk) ->
      str += chunk

    res.on 'end', ->
      try
        data = parseSoapResponse str
      catch err
        return callback err

      if data.faultString?.length
        err = new Error getReadableErrorMsg data.faultString
        err.code = data.faultCode
        return callback err

      return callback null, data

  if timeout then req.setTimeout timeout, ->
    req.abort()

  req.on 'error', callback
  req.write xml
  req.end()
