# indent-transformer

Using Node's Streams, this package takes a file with indentations and converts it into a stream with "INDENT", "DEDENT" or "NODENT". I'm using it to parse Pug files.

## Usage

```js
import _transformStream from 'indent-transformer'
const transformStream = _transformStream(opts)
```

### Options

lineNoPrecedesIndent: true | false

If true, line numbers will be printed before the indent indicator: `1|NODENT ...`

### Output
With line numbers first:
```text
1|NODENT script. 2|INDENT if (foo) { 4|INDENT bar(); 6|DEDENT } 99999|DEDENT
```

With line numbers second:
```text
NODENT1 script. INDENT2 if (foo) { INDENT4 bar(); DEDENT6 } DEDENT99999 
```

## Test

```shell
npm test
```

...and...

```shell
node fixture.js <test name>
```

&lt;test name&gt; is the file prefix in the test/ directory, such as "xml".

I haven't got around to automating these tests.

## Debugging

Prefix the command with "DEBUG='indent-transformer'". 

Example:
```shell
DEBUG='indent-transformer' node src/index.js test/script.whitespace.in -
```
## TODO

Allow for no line numbers to be in output stream.

Allow for different (or no) delimiter between line number and indicator.

## Undocumented Features

*Might disappear at any time*

Call index.js with an input file and output file. "-" for the output file prints to stdout.

```shell
node src/index.js test/script.whitespace.in -
```

Whether the line number prefixes the indentation indicator can be changed:

```shell
node src/index.js test/script.whitespace.in - true
```

## Issues
I currently limit the number of lines to 99,998. This is purely arbitrary and can be increased if needed.