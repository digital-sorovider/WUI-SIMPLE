var dgram = require('dgram');
var server_host = 'localhost'
var server_port = 4000

setTimeout(() => {
    console.log("1")
}, 0);
setTimeout(() => {
    console.log("2")
}, 1000);
setTimeout(() => {
    console.log("3")
}, 2000);

setTimeout(() => {

sock = dgram.createSocket("udp4", function (msg, rinfo) {
  console.log('got message from '+ rinfo.address +':'+ rinfo.port);
  console.log('data len: '+ rinfo.size + " data: "+
              msg.toString('ascii', 0, rinfo.size));
});
sock.bind(server_port, server_host);
console.log("\n" + 'Test UDP Server Start');
console.log(server_host,':',server_port);

}, 3000);