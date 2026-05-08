const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

const onesOrdinal = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'];
const teensOrdinal = ['tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
const tensOrdinal = ['', '', 'twentieth', 'thirtieth', 'fortieth', 'fiftieth', 'sixtieth', 'seventieth', 'eightieth', 'ninetieth'];

function toWords(n) {
  if (n === 0) return 'zero';
  if (n < 10) return ones[n];
  if (n < 20) return teens[n - 10];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + ones[n % 10] : '');
  if (n < 1000) return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' and ' + toWords(n % 100) : '');
  if (n < 10000) return ones[Math.floor(n / 1000)] + ' thousand' + (n % 1000 !== 0 ? (n % 1000 < 100 ? ' and ' : ' ') + toWords(n % 1000) : '');
  return n.toString();
}

function toOrdinal(n) {
  if (n === 0) return 'zeroth';
  if (n < 10) return onesOrdinal[n];
  if (n < 20) return teensOrdinal[n - 10];
  if (n < 100) {
    if (n % 10 === 0) return tensOrdinal[n / 10];
    return tens[Math.floor(n / 10)] + '-' + onesOrdinal[n % 10];
  }
  if (n < 1000) {
    if (n % 100 === 0) return ones[Math.floor(n / 100)] + ' hundredth';
    return ones[Math.floor(n / 100)] + ' hundred and ' + toOrdinal(n % 100);
  }
  if (n < 10000) {
    if (n % 1000 === 0) return ones[Math.floor(n / 1000)] + ' thousandth';
    return ones[Math.floor(n / 1000)] + ' thousand ' + (n % 1000 < 100 ? 'and ' : '') + toOrdinal(n % 1000);
  }
  return n.toString() + 'th';
}

module.exports = { toWords, toOrdinal };
