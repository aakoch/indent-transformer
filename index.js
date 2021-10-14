import path from 'path'
import stream from 'stream'
import debugFunc from 'debug'
import WrapLine from '@jaredpalmer/wrapline'
import { fileURLToPath } from 'url';
import fs from 'fs'
const __filename = fileURLToPath(import.meta.url);
const debug = debugFunc('indent-transformer')
const debug2 = debugFunc('indent-transformer2')

let lineNoAfter = false

const indentTransformer = {
  flush(callback) {
    while (1 < this.stack[0]) {
      this.stack.shift()
      this.push('DEDENT99999 ');
    }
    callback()
  },
  transform(chunk, enc, callback) {
    this.stack = this.stack || [0]
    let ret = []
    chunk = chunk.toString()

    const matches1 = chunk.matchAll(/.*\n/g)

    debug('matches1=' + matches1)
    for (const match of matches1) {
      const chunky = match[0].substring(0, match[0].length - 1)
      debug2('chunky=', chunky)
      const indexOfPipe = chunky.indexOf('|')
      debug('indexOfPipe=' + indexOfPipe)

      const lineNo = chunky.substring(0, indexOfPipe)
      debug('lineNo=' + lineNo)

      let line = chunky.substring(indexOfPipe + 1)
      debug('line=', line)

      if (line.trim().length > 0) {
        const matches = line.match(/(  |\t)*/)
        debug('matches=', matches)

        if (matches) {
          let numOfSpaces = matches[0].toString().length
          debug('numOfSpaces=' + numOfSpaces + ', this.stack[0]=' + this.stack[0] + ', this.stack=', this.stack)

          if (numOfSpaces > this.stack[0]) {
            this.stack.unshift(numOfSpaces)
            if (lineNoAfter) {
              ret.push('INDENT' + lineNo + ' ' + line.trim() + ' ')
            }
            else {
              ret.push((lineNo.length ? lineNo + '|' : '') + 'INDENT' + ' ' + line.trim() + ' ')
            }
          }
          else if (numOfSpaces < this.stack[0]) {
            debug('before shift: this.stack=', this.stack)
            debug('numOfSpaces < this.stack[1]', numOfSpaces < this.stack[1])
            while (numOfSpaces < this.stack[1]) {
              debug('inside while loop')
              this.stack.shift()
              if (lineNoAfter) {
                ret.push('DEDENT' + lineNo + ' ')
              }
              else {
                ret.push((lineNo.length ? lineNo + '|' : '') + 'DEDENT' + ' ')
              }
            }
            debug('exited while loop')
            this.stack.shift()
            if (lineNoAfter) {
              ret.push('DEDENT' + lineNo + ' ' + line.trim() + ' ')
            }
            else {
              ret.push((lineNo.length ? lineNo + '|' : '') +'DEDENT' + ' ' + line.trim() + ' ')
            }
            debug('after shift: this.stack=', this.stack)
            debug('after shift: ret=', ret)
          }
          else {
            if (lineNoAfter) {
              ret.push('NODENT' + lineNo + ' ' + line.trim() + ' ')
            }
            else {
              ret.push((lineNo.length ? lineNo + '|' : '') + 'NODENT' + ' ' + line.trim() + ' ')
            }
          }
        }
      }
      if (this.ended) {
        while (0 < this.stack[0]) {
          debug('before shift: this.stack=', this.stack)
          this.stack.shift()
          debug('after shift: this.stack=', this.stack)
          if (lineNoAfter) {
            ret.push('DEDENT' + lineNo + ' ');
          }
          else {
            ret.push((lineNo.length ? lineNo + '|' : '') + 'DEDENT' + ' ');
          }
        }
      }
      debug('returning=' + ret.join(''))
      let first = true;
      ret.forEach(line => {
        if (first) {
          this.push(line)
          first = false
        }
        else
          this.push(line)
      })
      ret = []
    }
    callback();
  }
}

if (process.argv[1] == __filename) {
  const fileReader = fs.createReadStream(process.argv[2])
  stream.finished(fileReader, (err) => {
    if (err) {
      console.error('Stream failed', err);
    } else {
      indentTransformer.ended = true
    }
  });

  const fileOut = fs.createWriteStream('out.txt')
  fileReader
    .pipe(WrapLine('|'))
    .pipe(WrapLine(function (pre, line) {
      // add 'line numbers' to each line
      pre = pre || 0
      return pre + 1
    }))
    .pipe(indentTransformer)
    // .pipe(fileOut)
    .pipe(process.stdout)
}

export default (opts) => {
  lineNoAfter = !Object.assign({}, opts).lineNoPrecedesIndent
  return new stream.Transform(indentTransformer)
}