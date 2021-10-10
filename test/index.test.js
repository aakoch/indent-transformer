import chai from 'chai'
import util from 'util'
const expect = chai.expect
import stream from 'stream'
import transformStream from '../index.js'
import intoStream from 'into-stream'
import concat from 'concat-stream';
import lineTransformer from '../../line-transformer/index.js'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

describe('test', function () {
  it('should match a known working example', function (done) {
    const input = `doctype html
html(lang='en-US')
  head
    style(type="text/scss").
      .h1 span, .h1 span span { display: inline-block; position: relative; }
    div
    pre: code(class="language-scss").
      #fadeOutDemo span {
        display: inline|-block;
        opacity: 1;
        &.myFadeOut {
          opacity: 0;
          transition: opacity 2s;
        }
      }
block body
  .container#fadeOutDemo
    p Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi mollis accumsan mattis. Aenean eros magna, maximus nec accumsan at, ultrices non velit. Duis tempus tellus a lectus dignissim, consectetur hendrerit urna lacinia. Nam vitae placerat tortor. Phasellus non odio blandit, posuere urna in, pulvinar ligula. Quisque et tincidunt sapien. Proin eget nibh vitae justo pulvinar tincidunt. In hac habitasse platea dictumst. In non accumsan lacus, in consequat nisl. Nunc sodales luctus nunc. Aenean vitae sem consectetur, semper quam a, venenatis sem. Quisque posuere erat at neque bibendum ornare nec a magna. Praesent aliquam commodo luctus. Nulla facilisi.

    p Maecenas pulvinar, nulla a dictum pulvinar, sapien justo dapibus metus, et luctus libero dolor elementum dui. Praesent et libero sed odio dapibus accumsan ac sit amet justo. Vivamus eu massa nec nunc fringilla mollis et sed enim. Nulla facilisi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam iaculis sollicitudin sodales. Sed gravida vel magna nec mollis. Vestibulum eget nibh magna. Nunc congue vitae purus id mattis. Nunc malesuada non eros in facilisis. Nunc blandit lectus hendrerit blandit facilisis. Quisque vitae dolor lectus. Duis tortor erat, pharetra a nulla ac, varius porttitor sapien. Sed tellus lectus, posuere ut tincidunt sit amet, eleifend id neque. Vestibulum sed commodo nunc, ac maximus nunc.

    p Maecenas sed lorem accumsan, luctus eros eu, tempor dolor. Vestibulum lorem est, bibendum vel vulputate eget, vehicula eu elit. Donec interdum cursus felis, vitae posuere libero. Cras et lobortis velit. Pellentesque in imperdiet justo. Suspendisse dolor mi, aliquet at luctus a, suscipit quis lectus. Etiam dapibus venenatis sem, quis aliquam nisl volutpat vel. Aenean scelerisque dapibus sodales. Vestibulum in pretium diam. Quisque et urna orci.

    p Nulla posuere sem a enim fringilla, id maximus nisi ornare. Nam ac sollicitudin turpis, sit amet pretium mi. In hac habitasse platea dictumst. Integer non mi sagittis, viverra elit vel, rutrum mi. Pellentesque at tellus tincidunt, mollis nisi at, luctus neque. Nam quis velit eu risus efficitur efficitur non et risus. Etiam quis purus risus. Nam sagittis at elit a laoreet. Morbi facilisis lectus sed felis hendrerit eleifend. Aenean nisl eros, dapibus vel vulputate nec, porttitor sit amet dui. Nullam lobortis augue quam, ac dapibus tortor pharetra ac. In nec scelerisque ipsum.

    p Etiam vel mi sollicitudin, luctus velit vitae, accumsan velit. Phasellus non feugiat metus, eu dignissim nulla. Cras ex arcu, faucibus ac hendrerit sit amet, volutpat sit amet justo. Donec ligula lacus, iaculis a lobortis et, facilisis vitae metus. Nulla id massa in turpis efficitur ornare. Quisque euismod fringilla lorem a placerat. Praesent non velit orci. Suspendisse vel mi sed tellus tincidunt venenatis. Phasellus eu tempor nisi. Nullam rutrum consequat euismod. Cras ut blandit erat. Sed iaculis, ex nec finibus vehicula, mauris ligula placerat lacus, dictum viverra neque lectus eget dolor. Nullam finibus ligula vitae lacus eleifend, id sagittis leo molestie.
    p Netlify does most of the work. Follow the directions 
      a(href="https://docs.netlify.com/domains-https/custom-domains/configure-external-dns/#configure-an-apex-domain") here
      |. The only "gotcha" was I originally had "www.adamkoch.com" as the A record instead of "adamkoch.com". Not a big deal and easy to rectify.

    h2 Results
    p Since I really enjoy learning this has been awesome. 

    h2 Conclusion
    p If you have a chance to learn something new, then do it! 

  script(type="module").
    import _ from 'lodash'
    import _debug from 'debug'
    const debug = _debug('aakoch:pugAnimation')

    jQuery(() => {
      $("#bandwagonLink").one("mouseenter", function() {
        $(this).fadeOut(2000);
      });`

    const inStream = intoStream(input)
    inStream.on('error', function (e) {
      console.error(e)
    })

    stream.finished(inStream, (err) => {
      if (err) {
        console.error('Stream failed', err);
      } else {
        lineTransformer.ended = true
        transformStream.ended = true
        done()
      }
    });

    inStream
      .pipe(lineTransformer)
      .pipe(transformStream)
      .pipe(concat({}, (body) => {
        const actual = body.toString();

        expect(actual).to.equal(`NODENT1 doctype html
NODENT2 html(lang='en-US')
INDENT3 head
INDENT4 style(type="text/scss").
INDENT5 .h1 span, .h1 span span { display: inline-block; position: relative; }
DEDENT6 div
NODENT7 pre: code(class="language-scss").
INDENT8 #fadeOutDemo span {
INDENT9 display: inline
NODENT10 opacity: 1;
NODENT11 &.myFadeOut {
INDENT12 opacity: 0;
NODENT13 transition: opacity 2s;
DEDENT14 }
DEDENT15 }
DEDENT16
DEDENT16
DEDENT16 block body
INDENT17 .container#fadeOutDemo
INDENT18 p Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi mollis accumsan mattis. Aenean eros magna, maximus nec accumsan at, ultrices non velit. Duis tempus tellus a lectus dignissim, consectetur hendrerit urna lacinia. Nam vitae placerat tortor. Phasellus non odio blandit, posuere urna in, pulvinar ligula. Quisque et tincidunt sapien. Proin eget nibh vitae justo pulvinar tincidunt. In hac habitasse platea dictumst. In non accumsan lacus, in consequat nisl. Nunc sodales luctus nunc. Aenean vitae sem consectetur, semper quam a, venenatis sem. Quisque posuere erat at neque bibendum ornare nec a magna. Praesent aliquam commodo luctus. Nulla facilisi.
NODENT20 p Maecenas pulvinar, nulla a dictum pulvinar, sapien justo dapibus metus, et luctus libero dolor elementum dui. Praesent et libero sed odio dapibus accumsan ac sit amet justo. Vivamus eu massa nec nunc fringilla mollis et sed enim. Nulla facilisi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam iaculis sollicitudin sodales. Sed gravida vel magna nec mollis. Vestibulum eget nibh magna. Nunc congue vitae purus id mattis. Nunc malesuada non eros in facilisis. Nunc blandit lectus hendrerit blandit facilisis. Quisque vitae dolor lectus. Duis tortor erat, pharetra a nulla ac, varius porttitor sapien. Sed tellus lectus, posuere ut tincidunt sit amet, eleifend id neque. Vestibulum sed commodo nunc, ac maximus nunc.
NODENT22 p Maecenas sed lorem accumsan, luctus eros eu, tempor dolor. Vestibulum lorem est, bibendum vel vulputate eget, vehicula eu elit. Donec interdum cursus felis, vitae posuere libero. Cras et lobortis velit. Pellentesque in imperdiet justo. Suspendisse dolor mi, aliquet at luctus a, suscipit quis lectus. Etiam dapibus venenatis sem, quis aliquam nisl volutpat vel. Aenean scelerisque dapibus sodales. Vestibulum in pretium diam. Quisque et urna orci.
NODENT24 p Nulla posuere sem a enim fringilla, id maximus nisi ornare. Nam ac sollicitudin turpis, sit amet pretium mi. In hac habitasse platea dictumst. Integer non mi sagittis, viverra elit vel, rutrum mi. Pellentesque at tellus tincidunt, mollis nisi at, luctus neque. Nam quis velit eu risus efficitur efficitur non et risus. Etiam quis purus risus. Nam sagittis at elit a laoreet. Morbi facilisis lectus sed felis hendrerit eleifend. Aenean nisl eros, dapibus vel vulputate nec, porttitor sit amet dui. Nullam lobortis augue quam, ac dapibus tortor pharetra ac. In nec scelerisque ipsum.
NODENT26 p Etiam vel mi sollicitudin, luctus velit vitae, accumsan velit. Phasellus non feugiat metus, eu dignissim nulla. Cras ex arcu, faucibus ac hendrerit sit amet, volutpat sit amet justo. Donec ligula lacus, iaculis a lobortis et, facilisis vitae metus. Nulla id massa in turpis efficitur ornare. Quisque euismod fringilla lorem a placerat. Praesent non velit orci. Suspendisse vel mi sed tellus tincidunt venenatis. Phasellus eu tempor nisi. Nullam rutrum consequat euismod. Cras ut blandit erat. Sed iaculis, ex nec finibus vehicula, mauris ligula placerat lacus, dictum viverra neque lectus eget dolor. Nullam finibus ligula vitae lacus eleifend, id sagittis leo molestie.
NODENT27 p Netlify does most of the work. Follow the directions
INDENT28 a(href="https://docs.netlify.com/domains-https/custom-domains/configure-external-dns/#configure-an-apex-domain") here
DEDENT31 h2 Results
NODENT32 p Since I really enjoy learning this has been awesome.
NODENT34 h2 Conclusion
NODENT35 p If you have a chance to learn something new, then do it!
DEDENT37 script(type="module").
INDENT38 import _ from 'lodash'
NODENT39 import _debug from 'debug'
NODENT40 const debug = _debug('aakoch:pugAnimation')
NODENT42 jQuery(() => {
INDENT43 $("#bandwagonLink").one("mouseenter", function() {
INDENT44 $(this).fadeOut(2000);
DEDENT45 });
DEDENT99999 DEDENT99999 DEDENT99999 `)
      }))
  })
})
