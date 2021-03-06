module.exports = function (token) {
    if (!token) return;

    var segments = token.split('.');

    if (segments.length !== 3) {
      throw new Error('Not enough or too many segments');
    }

    // All segment should be base64
    var headerSeg = segments[0];
    var payloadSeg = segments[1];
    var signatureSeg = segments[2];

    // base64 decode and parse JSON
    var header = JSON.parse(base64urlDecode(headerSeg));
    var payload = JSON.parse(base64urlDecode(payloadSeg));

    return {
      header: header,
      payload: payload,
      signature: signatureSeg
    };
};

var base64urlDecode = function(str) {
  return new Buffer(base64urlUnescape(str), 'base64').toString();
};

var base64urlUnescape = function(str) {
  str += Array(5 - str.length % 4).join('=');
  return str.replace(/\-/g, '+').replace(/_/g, '/');
};
