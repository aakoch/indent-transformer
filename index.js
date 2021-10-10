import path from 'path'
import stream from 'stream'
import debugFunc from 'debug'
import lineTransformer from '../line-transformer/index.js'
import { fileURLToPath } from 'url';
import fs from 'fs'
const __filename = fileURLToPath(import.meta.url);
const debug = debugFunc('indent-transformer')

const indentTransformer = new stream.Transform({
  flush(callback) {
    try {
      debug('inside flush')
      if (this.ended) {
        // const ret = []
        while (1 < this.stack[0]) {
          this.stack.shift()
          // leaving this as a separate push for each makes the next transformer treat each as a separate call
          this.push('DEDENT99999 ');
          // ret.push('DEDENT');
        }
        // this.push(ret.join(' '))
      }
      callback()
    } catch (e) {
      callback(e)
    }
  },
  transform(chunk, enc, callback) {
    const ret = []
    debug('chunk=' + chunk)
    const splitted = chunk.toString().split('|', 2)
    const lineNo = splitted[0]
    debug('lineNo=' + lineNo)
    let line = splitted[1]
    if (splitted.length > 2) {
      line += splitted.slice(2).join('')
    }

    if (line.trim().length > 0) {
      debug('line=' + line)
      const matches = line.match(/^(  |\t)*/)
      debug('matches=', matches)

      if (matches) {
        let numOfSpaces = matches[0].toString().length
        debug('numOfSpaces=' + numOfSpaces + ', this.stack[0]=' + this.stack[0] + ', this.stack=', this.stack)
        if (numOfSpaces > this.stack[0]) {
          this.stack.unshift(numOfSpaces)
          ret.push('INDENT' + lineNo + ' ' + line.trim() + '\n')
        }
        else if (numOfSpaces < this.stack[0]) {
          debug('before shift: this.stack=', this.stack)
          while (numOfSpaces < this.stack[1]) {
            this.stack.shift()
            ret.push('DEDENT' + lineNo + '\n')
          }
          this.stack.shift()
          ret.push('DEDENT' + lineNo + ' ' + line.trim() + '\n')
          debug('after shift: this.stack=', this.stack)
        }
        else {
          ret.push('NODENT' + lineNo + ' ' + line.trim() + '\n')
        }
      }
    }
    if (this.ended) {
      while (0 < this.stack[0]) {
        debug('before shift: this.stack=', this.stack)
        this.stack.shift()
        debug('after shift: this.stack=', this.stack)
        ret.push('DEDENT' + lineNo + ' ');
      }
    }
    debug('returning=' + ret.join(''))
    this.push(ret.join(''))
    callback();
  }
})
indentTransformer.stack = [0]

// stream.finished(??, (err) => {
//   if (err) {
//     console.error('Stream failed', err);
//   } else {
//     indentTransformer.ended = true
//   }
// });

if (process.argv[1] == __filename) {
  const fileReader = fs.createReadStream(process.argv[2])
  fileReader.pipe(lineTransformer).pipe(indentTransformer).pipe(process.stdout)
}

export default indentTransformer