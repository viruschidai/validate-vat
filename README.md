# Validate European VAT number

A very lightweight, tiny lib (no external dependencies) which allows you to verify the validity of a VAT ID number issued by any European Union Member State. This lib is basically calling web service provided by VIES at https://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl for VAT number validation.

## What is a VAT number?
A value added tax identification number or VAT identification number (VATIN) is an identifier used in many countries, including the countries of the European Union, for value added tax purposes.

## Get started
```bash
npm install --save https://github.com/benbucksch/validate-vat
# or
yarn add https://github.com/benbucksch/validate-vat
```

In your code
```javascript
const validateVAT = require('validate-vat');
var vatID = 'DE1234567890';
var vatResult = await validate(vatID);
console.log(vatResult.valid ? "valid" : "not valid");
```

##### Returns
if valid:
```javascript
{
  valid: true,
  serverValidated: true,
  name: 'Eulen GmbH',
  address: 'Waldstr. 8, 10000 Woods'
}
```
(name and address are optional, depending on country)

if invalid:
```javascript
{
  valid: false,
  serverValidated: true,
  name: '---',
  address: '---'
}
```

if state server down:
```javascript
{
  valid: true,
  serverValidated: false,
  name: '',
  address: ''
}
```

in case of other errors: throws an exception. Possible error messages:
```javascript
  'The provided CountryCode is invalid or the VAT number is empty'
  'The VIES VAT service is unavailable, please try again later'
  'The VAT database of the requested member country is unavailable, please try again later'
  'The request to VAT database of the requested member country has timed out, please try again later'
  'The service cannot process your request, please try again later'
  'Unknown error'
```
For more details usage, please check test.

## Change Log
### 0.6.0
- Reformat as ES6 JS instead of Coffee script, removing further dependencies
- Do simple syntax check first, before asking server
- If state server is down, return valid, if syntax check passes
- Use HTTPS

### 0.5.0
- Use IPv4 explicitly

### 0.4.0
- Added a timeout option
- Upgraded versions of dev dependencies to latest versions

### 0.3.1
Wrap field parse in a try catch block when it can not parse a soap message. The soap message will be attached to the error object for furthur investigation.

### 0.3.0 - 05/Dec/2013
Instead of
`var validate = require('validate-vat').validate`
, you should call
`var validate = require('validate-vat)'
This will break your code, so update all the usages if you want to use this version

## License
The MIT License (MIT)

Copyright (c) 2013 viruschidai@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
