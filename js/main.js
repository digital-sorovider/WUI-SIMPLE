var socket_c = io('http://localhost:3000', { transports: ['polling'] });

$(function () {

    var Upper = function(str) {
        if (!str || typeof str !== 'string') return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };


    //未使用
    // $('#message_form').submit(function () {
    //     socket_c.emit('message', $('#input_msg').val());
    //     $('#input_msg').val('');
    //     return false;
    // });

    //アクションボタンが押された時の処理
    $('.action').on('click', function () {
        action =  $(this).data('type')
        // load = Upper(action) + "ing..."

        // $('#status').text(load).css('color', 'blue')
        socket_c.emit('exe', action)
        console.log($(this).data('type'))
    })

    //未使用
    // socket_c.on('message_s', function (msg) {
    //     $('#messages').html($('<h3>').text(msg));
    // });

    //サーバーのステータスが変化したときに表示する処理
    socket_c.on('server_status', function (status, col) {
        $('#status').text(status).css('color', col);
        // $('.action').prop('disabled', false)

    });
    socket_c.on('load', function (enable) {
        if (enable) {
            $('#load').fadeIn('slow')
        }
        else {
            $('#load').fadeOut('slow')
        }
    });
});