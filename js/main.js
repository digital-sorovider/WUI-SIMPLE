var socket_c = io('http://localhost:3000', { transports: ['polling'] });
// var channel = 'test1'

$(function () {

    var Upper = function(str) {
        if (!str || typeof str !== 'string') return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    //初期のサーバーチェンジ
    // socket_c.emit('change channel', 'test1')
    // $('.select').prop('disabled', false)
    // $('#test1').prop('disabled', true);

    //未使用
    // $('#message_form').submit(function () {
    //     socket_c.emit('message', $('#input_msg').val());
    //     $('#input_msg').val('');
    //     return false;
    // });

    //アクションボタンが押された時の処理
    $('.action').on('click', function () {
        // action =  $(this).data('type')
        // load = Upper(action) + "ing..."

        // $('#status').text(load).css('color', 'blue')
        // $('.action').prop('disabled', true)
        socket_c.emit('exe', $(this).data('type'))

        // socket_c.emit('exe', action)
        // console.log($(this).data('type'))
    })

    //セレクトボタンが押されたときの処理
    $('.select').on('click', function () {
        console.log($(this).val())
        socket_c.emit('change channel', $(this).data('server'))
        $('.select').prop('disabled', false)
        $(this).prop('disabled', true);
        // console.log(selection)
        // $('#server_name').text(selection)
        // action =  $(this).data('type')
        // load = Upper(action) + "ing..."

        // $('#status').text(load).css('color', 'blue')
        // $('.action').prop('disabled', true)
        // socket_c.emit('exe', $(this).data('type'))

        // socket_c.emit('exe', action)
        // console.log($(this).data('type'))
    })

    //未使用
    // socket_c.on('message_s', function (msg) {
    //     $('#messages').html($('<h3>').text(msg));
    // });

    //サーバーのステータスが変化したときに表示する処理
    socket_c.on('server_status', function (status, col, button_name1, button_type1, button_name2, button_type2, ing) {
        // $('.action').prop('disabled', false)

        $('#status').text(status).css('color', col);
        $('#button1').val(button_name1).data('type', button_type1)
        $('#button2').val(button_name2).data('type', button_type2)
        if(!ing){
            $('.action').prop('disabled', false)
            $('#load').fadeOut('slow')
        }
        else {
            $('#load').fadeIn('slow')
            $('.action').prop('disabled', true)
        }
    });

    // socket_c.on('element_change', function(name, color){
    //     $('#server_name').text(name)
    //     $('#body').css('background-color', color)
    // })


    socket_c.on('change channel', function(channel, name, color){
        $('#server_name').text(name)
        $('#body').css('background-color', color)
        // console.log(channel + "にログイン")
    })

    socket_c.on('debug', function(str){
        console.log(str)
    })

});