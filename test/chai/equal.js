function equal(chai, utils) {

  function findFirstDifferentCharacter(str1, str2) {
    if (str1 === str2) {
      return -1
    }
    let index
    for (index = 0; index < Math.min(str1.length, str2.length); index++) {
      const char = str1[index];
      if (char !== str2[index]) {
        return index
      }
    }
    return index
  }

  chai.Assertion.overwriteMethod('equal', function (_super) {
    return function (obj2) {
      var obj = this._obj;
      if (typeof obj === 'string' && typeof obj2 === 'string' &&
        obj.length > 20) {

        const context = 15
        const PREVIEW_CHARS = 80
        const firstDiffInx = findFirstDifferentCharacter(obj, obj2)

        const substrIndexStart = Math.max(0, firstDiffInx - context)
        const substrIndexEnd = Math.min(obj.length, firstDiffInx + context)
        const printStartElipsis = substrIndexStart > 0
        const printEndElipsis = substrIndexEnd <= substrIndexEnd

        const expMsg = (printStartElipsis ? '...' : '') + obj.substring(substrIndexStart, substrIndexEnd) + (printEndElipsis ? '...' : '')
        const actMsg = (printStartElipsis ? '...' : '') + obj2.substring(substrIndexStart, substrIndexEnd) + (printEndElipsis ? '...' : '')

        const expActMsg = obj.substring(0, Math.min(obj.length, PREVIEW_CHARS)) + (PREVIEW_CHARS < obj.length ? "..." : '')
        const actActMsg = obj2.substring(0, Math.min(obj2.length, PREVIEW_CHARS)) + (PREVIEW_CHARS < obj2.length ? "..." : '')
        this.assert(
          obj === obj2
          , "expected \"" + expActMsg + "\" to equal \"" + actActMsg + "\" but they started to differ at position " + firstDiffInx
          , "expected \"" + expActMsg + "\" not to be equal to \"" + actActMsg + "\""
          , expMsg // expected
          , actMsg // actual
        );
      } else {
        _super.apply(this, arguments);
      }
    };
  });
}
export default equal