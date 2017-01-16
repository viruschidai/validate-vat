# Validate European VAT number

[![Build Status](https://travis-ci.org/viruschidai/validate-vat.png?branch=master)](https://travis-ci.org/viruschidai/validate-vat)
[![Downloads](https://img.shields.io/npm/dm/validate-vat.svg)](https://www.npmjs.com/package/validate-vat)

A very lightweight, tiny lib (no external dependencies) allows you to verify the validity of a VAT number issued by any European Union Member State. This lib is basically calling web service provided by VIES (at http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl) for VAT number validation. 

## What is a VAT number?
A value added tax identification number or VAT identification number (VATIN) is an identifier used in many countries, including the countries of the European Union, for value added tax purposes.

## Get started
```bash
npm install validate-vat
```
In your code
```javascript
var validate = require('validate-vat');
validate(countryCode, vatNumber, callback)
```
#### Example
```javascript
var validate = require('validate-vat');
validate( 'xx',  'xxxxxxx',  function(err, validationInfo) {
    console.log(validationInfo);
});
```

##### Returns
when valid
```javascript
{
  countryCode: 'xx',
  vatNumber: 'xxxxxxxxx',
  requestDate: '2013-11-22+01:00',
  valid: true,
  name: 'company name',
  address: 'company address'
}
```
when invalid
```javascript
{
  countryCode: 'xx',
  vatNumber: 'xxxxxxxxxx',
  requestDate: '2013-11-22+01:00',
  valid: false,
  name: '---',
  address: '---'
}
```
possible error messages
```javascript
  'The provided CountryCode is invalid or the VAT number is empty'
  'The VIES VAT service is unavailable, please try again later'
  'The VAT database of the requested member country is unavailable, please try again later'
  'The request to VAT database of the requested member country has timed out, please try again later'
  'The service cannot process your request, please try again later'
  'Unknown error'
```
For more details usage, please check test

## Change Log
####0.4.0
- Added a timeout option in https://github.com/viruschidai/validate-vat/pull/9
- Upgraded versions of dev dependencies to latest versions

####0.3.1
Wrap field parse in a try catch block when it can not parse a soap message. The soap message will be attached to the error object for furthur investigation.

####0.3.0 - 05/Dec/2013
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
