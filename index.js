import stream from 'stream'
import debugFunc from 'debug'
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
    debug('indentTransformer: chunk=' + chunk)
    const splitted = chunk.toString().split('|', 2)
    const lineNo = splitted[0]
    debug('indentTransformer: lineNo=' + lineNo)
    let line = splitted[1]
    if (splitted.length > 2) {
      line += splitted.slice(2).join('')
    }

    if (line.trim().length > 0) {
      debug('indentTransformer: line=' + line)
      const matches = line.match(/^(  |\t)*/)
      debug('indentTransformer: matches=', matches)

      if (matches) {
        let numOfSpaces = matches[0].toString().length
        debug('indentTransformer: numOfSpaces=' + numOfSpaces + ', this.stack[0]=' + this.stack[0] + ', this.stack=', this.stack)
        if (numOfSpaces > this.stack[0]) {
          this.stack.unshift(numOfSpaces)
          ret.push('INDENT' + lineNo + ' ' + line.trim() + '\n')
        }
        else if (numOfSpaces < this.stack[0]) {
          while (numOfSpaces < this.stack[0]) {
            debug('before shift: this.stack=', this.stack)
            this.stack.shift()
            debug('after shift: this.stack=', this.stack)
            ret.push('DEDENT' + lineNo + ' \n')
          }
          ret.push(line.trim() + '\n')
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
    debug('indentTransformer: returning=' + ret.join(''))
    this.push(ret.join(''))
    callback();
  }
})
indentTransformer.stack = [0]

stream.finished(process.stdin, (err) => {
  if (err) {
    console.error('Stream failed', err);
  } else {
    indentTransformer.ended = true
  }
});

export default indentTransformer