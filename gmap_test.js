var gm = require('googlemaps');
var util = require('util');

/*
gm.reverseGeocode('41.850033,-87.6500523', function(err, data){
  util.puts(JSON.stringify(data));
});

gm.reverseGeocode(gm.checkAndConvertPoint([41.850033, -87.6500523]), function(err, data){
  util.puts(JSON.stringify(data));
});
*/

markers = [
    { 'location': '300 W Main St Lock Haven, PA' },
    { 'location': '444 W Main St Lock Haven, PA',
        'color': 'red',
        'label': 'A',
        'shadow': 'false',
        'icon' : 'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=cafe%7C996600'
    }
]

styles = [
    { 'feature': 'road', 'element': 'all', 'rules': 
        { 'hue': '0x00ff00' }
    }
]

paths = [
    { 'color': '0x0000ff', 'weight': '5', 'points': 
        [ '41.139817,-77.454439', '41.138621,-77.451596' ]
    }
]

util.puts(gm.staticMap('444 W Main St Lock Haven PA', 15, '500x400', function(err, data){
  require('fs').writeFileSync('test_map.png', data, 'binary');
}, false, 'roadmap', markers, styles, paths));