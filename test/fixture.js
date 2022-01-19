import chai from 'chai'
import equal from 'chai-equal-for-long-text'
import WrapLine from '@jaredpalmer/wrapline'
import _transformStream from '../src/index.js'
const transformStream = _transformStream({ encoding: 'utf8' })
import fs from 'fs'
import fc from 'filecompare';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const optionDefinitions = [
  { name: 'snapshot', alias: 's', type: Boolean },
  { name: 'testName', type: String, defaultOption: true }
]

import commandLineArgs from 'command-line-args'
const options = commandLineArgs(optionDefinitions)

chai.use(equal);

const testName = options.testName
const inFilename = testName + ".in"
const expectedFileName = testName + '.expected'
const actualOutFileName = testName + '.actual'
const fileInStream = fs.createReadStream(inFilename, { encoding: 'utf8' });

if (options.snapshot) {
  const fileOut = fs.createWriteStream(expectedFileName, { encoding: 'utf8' })
  fileInStream.pipe(transformStream).pipe(fileOut)
}
else {
  const expected = fs.readFileSync(expectedFileName)
  const actualOut = fs.createWriteStream(actualOutFileName, { encoding: 'utf8' })
  fileInStream
  .pipe(WrapLine('|'))
  .pipe(WrapLine(function (pre, line) {
    // add 'line numbers' to each line
    pre = pre || 0
    return pre + 1
  })).pipe(transformStream).pipe(actualOut);

  var cb = function (isEqual) {
    console.log("equal? :" + isEqual);
  }

  fileInStream.on('close', () => {
    fc(expectedFileName, actualOutFileName, cb);
  })
}