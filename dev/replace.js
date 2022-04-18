let str = '2123456789';
let regex = new RegExp("([0-9]{3})([0-9]{3})([0-9]{4})");
let replacment = '($1) $2-$3';
console.log(str.replace(new RegExp("(\\d{3})(\\d{3})(\\d{4})"),replacment));
console.log(str.replace(regex,replacment));
console.log(str.replace(/([0..9]{3})([0..9]{3})([0..9]{4})/g,replacment));
console.log(str.replace(/(\\d{3})(\\d{3})(\\d{4})/g,replacment));

let test = "(\d{3})";
console.log(test);
console.log(test.replace(/\\/,"$1"));
console.log("split",String.raw`(\d{3})`.split("\\").join("-"));
console.log(String.raw({ raw: "(\d{3})"}).length);
console.log(String.raw`(\d{3})`.length);
console.log(String.raw`(\d{3})`);
console.log(String.raw`${"(\d{3})"}`);
console.log("\"test\d\"".match(/"(?:\\"|[^"])*"/g));
console.log(String.raw`${ "\"test\d\"".match(/"(?:\\"|[^"])*"/g) }`);

