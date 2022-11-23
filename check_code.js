var chcd_url = './iactions_proxy.php';
var chcd_captcha_url = 'https://cp.i-actions.ru/utils/captcha/captcha.php';
var chcd_answer = new Array();
var chcd_answer_code = new Array();
var chcd_sess_init = 0;

$(document).ready(function() 
{
	var obj='#chcd_phone';

	if (typeof($("#chcd_phone").val()) == 'undefined')
		obj = '#chcd_code';
	else
		$("#chcd_phone").keypress(function(event) {
			if ((event.which > 58) || (event.which < 48)) 
				return false; 
		});

	$("#chcd_button").attr('disabled', true);	

	$(obj).focus(function() {
		chcd_focus();
	});
});

function chcd_focus()
{
	if (!chcd_sess_init)
	{
		chcd_sess_init = 1;
		$("#chcd_answer").html('Инициализация...');

		$.get(
			chcd_url,
			{cmd:"init",r:Math.random()},
			function(data) {
				var tokens = $.trim(data).split('&');

				for(token in tokens)
				{
					chcd_answer[tokens[token].split('=')[0]] = tokens[token].split('=')[1];
				}
				
				$("#chcd_answer").html('Заполните форму');
				chcd_finit();
			}
		);
	}
}

function chcd_finit() 
{
	if (chcd_answer['code'] == '200') 
	{
		if (chcd_answer['captcha'] == 'on')
		{
			$("#chcd_captcha_img").html("<img src='" + chcd_captcha_url + "?sid=" + chcd_answer['sid'] + "'>");
			$("#chcd_captcha_input").html("<input type='text' id='chcd_keystring' placeholder='код с картинки' maxlength='5' size='5' autocomplete='off' required>");
		}
		else
			$("#chcd_captcha").html('');
		
		$("#chcd_button").attr('disabled', false);	
	}
	else 
		$("#check_code").html("Проверка кода в данный момент невозможна! (" + chcd_answer['txt'] + ")");
}

function chcd_check_form() 
{
	var reg = /^[a-z0-9]+$/i;

	if (typeof($("#chcd_phone").val()) != 'undefined' &&
		($("#chcd_phone").val() == "" ||
		$("#chcd_phone").val().substr(0,1) != '7' ||
		$("#chcd_phone").val().length != 11))
	{
		alert("Неверно указан номер телефона!");
		return false;
	}
	
//		$("#chcd_code").val($("#chcd_code").val().replace(/[^\d]/gi,''));

//		if (!reg.test($("#chcd_code").val()))
//		{
//			alert("Некорректный код!");
//			return false;
//		}

	if ($.trim($("#chcd_keystring").val()) == ""
		&& chcd_answer['captcha'] == 'on')
	{
		alert("Не введен код с картинки!");
		return false;
	}

	return true;
}

function chcd_fsubmit()
{
	if (!chcd_check_form())
		return false;

	$("#chcd_answer").html('Подождите, идет проверка кода...');
	$("#chcd_button").attr('disabled', true);	

	$.get(
		chcd_url,
		{	
			cmd:"check", 
			sid:chcd_answer['sid'], 
			phone:$("#chcd_phone").val(), 
			code:$("#chcd_code").val(), //.replace(/[^a-zA-Z0-9]/ig,''), 
			keystring:$("#chcd_keystring").val(), 
			r:Math.random()
		},
		function(data) {
			var tokens = $.trim(data).split('&');

			chcd_sess_init = 0;

			for(token in tokens)
			{
				chcd_answer_code[tokens[token].split('=')[0]] = tokens[token].split('=')[1];
			}

			$("#chcd_answer").html((chcd_answer_code['num'] || $('#chcd_code').val() ) + ': ' + chcd_answer_code['txt']);

			$("#chcd_button").attr('disabled', false);	
			// chcd_focus();
		}
	);
	
	return false;
}


