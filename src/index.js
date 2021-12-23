import { fileURLToPath } from 'url';
import fs from 'fs'
import stream from 'stream'
import debugFunc from 'debug'
import WrapLine from '@jaredpalmer/wrapline'
const debug = debugFunc('indent-transformer')
const __filename = fileURLToPath(import.meta.url);

let lineNoAfter = false

const ltrim = function (str) {
  return str.replace(/^\s+/, '')
}

const indentTransformer = {
  encoding: 'utf-8',
  flush(callback) {
    while (1 < this.stack[0]) {
      this.stack.shift()
      if (lineNoAfter) {
        this.push('DE99999 ');
      }
      else {
        this.push('99999|DE ');
      }
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
      debug('chunky=', chunky)
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
              ret.push('IN' + lineNo + ' ' + ltrim(line))
            }
            else {
              ret.push((lineNo.length ? lineNo + '|' : '') + 'IN' + ' ' + ltrim(line))
            }
          }
          else if (numOfSpaces < this.stack[0]) {
            debug('before shift: this.stack=', this.stack)
            debug('numOfSpaces < this.stack[1]', numOfSpaces < this.stack[1])
            while (numOfSpaces < this.stack[1]) {
              debug('inside while loop')
              this.stack.shift()
              if (lineNoAfter) {
                ret.push('DE' + lineNo + ' ')
              }
              else {
                ret.push((lineNo.length ? lineNo + '|' : '') + 'DE')
              }
            }
            debug('exited while loop')
            this.stack.shift()
            if (lineNoAfter) {
              ret.push('DE' + lineNo + ' ' + ltrim(line))
            }
            else {
              ret.push((lineNo.length ? lineNo + '|' : '') + 'DE' + ' ' + ltrim(line))
            }
            debug('after shift: this.stack=', this.stack)
            debug('after shift: ret=', ret)
          }
          else {
            if (lineNoAfter) {
              ret.push('NO' + lineNo + ' ' + ltrim(line))
            }
            else {
              ret.push((lineNo.length ? lineNo + '|' : '') + 'NO' + ' ' + ltrim(line))
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
            ret.push('DE' + lineNo + ' ');
          }
          else {
            ret.push((lineNo.length ? lineNo + '|' : '') + 'DE');
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

  let outStream
  if (process.argv[3] && process.argv[3] != '-') {
    outStream = fs.createWriteStream(process.argv[3])
    debug('outStream = file ' + process.argv[3])
  }
  else {
    outStream = process.stdout
    debug('outStream = process.stdout')
  }

  if (process.argv[4] && process.argv[4] == 'true') {
    lineNoAfter = false
  }
  else {
    lineNoAfter = true
  }

  fileReader
    .pipe(WrapLine('|'))
    .pipe(WrapLine(function (pre, line) {
      // add 'line numbers' to each line
      pre = pre || 0
      return pre + 1
    }))
    .pipe(new stream.Transform(indentTransformer))
    .pipe(outStream)
}

export default (opts) => {
  lineNoAfter = !Object.assign({}, opts).lineNoPrecedesIndent
  return new stream.Transform(indentTransformer)
}