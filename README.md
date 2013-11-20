# VAT number validation lib
## What is a VAT number?
A value added tax identification number or VAT identification number (VATIN) is an identifier used in many countries, including the countries of the European Union, for value added tax purposes.

## Get started
```bash
npm install validate-vat
```
In your code
```javascript
var validate = require('validate-vat').validate;
validate(countryCode, vatNumber, callback)
```
#### Example
```javascript
var validate = require('validate-vat').validate;
validate( 'GB',  'xxxxxxx',  function(err, validationInfo) {
    console.log(validationInfo);
});
```

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
