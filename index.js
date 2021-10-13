import path from 'path'
import stream from 'stream'
import debugFunc from 'debug'
import WrapLine from '@jaredpalmer/wrapline'
import { fileURLToPath } from 'url';
import fs from 'fs'
const __filename = fileURLToPath(import.meta.url);
const debug = debugFunc('indent-transformer')
import { LineTransform } from 'line-transform'

const indentTransformer = new LineTransform({

  flush(callback) {
    try {
      debug('inside flush', this.stack)
        while (1 < this.stack[0]) {
          this.stack.shift()
          this.push('DEDENT99999 ');
        }
      callback()
    } catch (e) {
      callback(e)
    }
  },

  transform(chunk) {
//     this.push('updated:' + chunk.toString());
//   }

//   // optional
//   flush(cb) {
//     this.push('end');
//     cb();
//   }
// })

// const indentTransformer = new stream.Transform({
//   flush(callback) {
//     try {
//       debug('inside flush')
//       if (this.ended) {
//         while (1 < this.stack[0]) {
//           this.stack.shift()
//           this.push('DEDENT99999 ');
//         }
//       }
//       callback()
//     } catch (e) {
//       callback(e)
//     }
//   },
//   transform(chunk, enc, callback) {
    const ret = []
    chunk = chunk.toString()
    debug('chunk=' + chunk)

    const indexOfPipe = chunk.indexOf('|')

    const lineNo = chunk.substring(0, indexOfPipe)
    debug('lineNo=' + lineNo)
    
    let line = chunk.substring(indexOfPipe + 1)
    debug('line=', line)
    
    if (line.trim().length > 0) {
      // debug('2 line=' + line)
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
          debug('numOfSpaces < this.stack[1]', numOfSpaces < this.stack[1])
          while (numOfSpaces < this.stack[1]) {
            debug('inside while loop')
            this.stack.shift()
            ret.push('DEDENT' + lineNo + ' \n')
          }
          debug('exited while loop')
          this.stack.shift()
          ret.push('DEDENT' + lineNo + ' ' + line.trim() + '\n')
          debug('after shift: this.stack=', this.stack)
          debug('after shift: ret=', ret)
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
    // ret.join('').split('\n').forEach(line => {
    //   this.push(line)
    // })
    // callback();
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
      .pipe(WrapLine(function(pre, line) {
        // add 'line numbers' to each line
        pre = pre || 0
        return pre + 1
      }))
      .pipe(indentTransformer)
      // .pipe(fileOut)
      .pipe(process.stdout)
}

export default indentTransformer