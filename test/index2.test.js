import chai from 'chai'
import equal from 'chai-equal-for-long-text'
import _transformStream from '../src/index.js'
const expect = chai.expect
import stream from 'stream'
const transformStream = _transformStream()
import intoStream from 'into-stream'
import concat from 'concat-stream'
import WrapLine from '@jaredpalmer/wrapline'
import { debug } from 'console'

chai.use(equal);

describe('test without line numbers', function () {
  it('should match another known working example', function (done) {
    // console.log('done=' + done)
    const input = `div
  p This text belongs to the paragraph tag.
  br
  .
    This text belongs to the div tag.`

    const inStream = intoStream(input)
    inStream.on('error', function (e) {
      console.error(e)
    })

    stream.finished(inStream, (err) => {
      if (err) {
        console.error('Stream failed', err);
      } else {
        transformStream.ended = true
      }
    });

    inStream
      .pipe(WrapLine('|'))
      // .pipe(WrapLine(function (pre, line) {
      //   // add 'line numbers' to each line
      //   pre = pre || 0
      //   return pre + 1
      // }))
      .pipe(transformStream)
      .pipe(concat({}, (body) => {
        const actual = body.toString();
        debug('actual=' + actual)
        expect(actual).to.equal('NO divIN p This text belongs to the paragraph tag.NO brNO .IN This text belongs to the div tag.DE DE ')
        console.log('done')
        done()
      }))
  })
})
