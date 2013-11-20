expect = require 'expect.js'
vat = require '../src/index'

describe 'validate()', ->

  it 'should return true if it is a valid VAT number', (done) ->
    vat.validate 'GB', '802311782', (err, validationInfo) ->
      expect(validationInfo.valid).to.be true
      done()


  it 'should return false if it is an invalid VAT number', (done) ->
    vat.validate 'GB', '802311783', (err, validationInfo) ->
      expect(validationInfo.valid).to.be false
      done()


  it 'should return INVALID_INPUT if the countryCode is US', (done) ->
    vat.validate 'US', '802311782', (err, validationInfo) ->
      expect(err.message).to.be 'The provided CountryCode is invalid or the VAT number is empty'
      done()
