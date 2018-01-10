var socket = io.connect();
var user = document.getElementById("playerName").innerHTML;
var count = 0;

//연결
socket.emit('connection_send', "ChatingRoom", user);

$('#chat').on('submit', function(e){
    socket.emit('message_send', $('#message').val());
    $('#message').val("");
    e.preventDefault();
});
socket.on('message_receive', function(msg){
    $('#chatLog').append(msg+"\n");
    $('#chatLog').scrollTop(count);
    count += 50;
});
window.onbeforeunload = function() {
    socket.emit('leave_send');
}   
