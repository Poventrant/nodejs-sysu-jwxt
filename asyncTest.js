var async = require("async");
async.parallel([function(cb) {
			for(var i = 0; i <40; ++i)
			cb(null, 'a400')
		},
		function(cb) {
			for(var i = 0; i <40; ++i)
			cb(null, 'a200')
		},
		function(cb) {
			for(var i = 0; i <40; ++i)
			cb(null, 'a300')
		}
	],
	function(err, results) {
		console.log('1 err: ' + err); // -> undefined
		console.log('1 results: ' + results); // ->[ 'a400', 'a200', 'a300' ]
	});