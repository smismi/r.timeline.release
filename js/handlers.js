var fileUploadhandlers = {
	fileQueued: function (event, file) {
		var $statuses = $('#file-upload-status');
		var $currentStatus = $('#file-upload-example').clone().appendTo($statuses);
		var that = this;
		$currentStatus
			.attr('id', 'uploaded_file_' + file.index)
			.find('i').html(file.name)
			.end().removeClass('invisible')
			.find('.delete').click(function(){
				$(that).swfupload('cancelUpload');
				//$(this).parents('li').hide(500, function() { $(this).remove() });
				$(this).parents('li').remove();
			});

		$(this).swfupload('startUpload');
                $('#upload_submit').addClass('disabled').attr('disabled','disabled');
                $('#upload_spinner').addClass("visible")
	},

	uploadProgress: function (event, file, bytesLoaded) {
		var percents = parseInt(bytesLoaded / file.size * 100) + '%';
		var $currentStatus = $('#uploaded_file_' + file.index);
		$('label > span', $currentStatus).html(percents);
		$('ins', $currentStatus).css('width', percents);
                $('#upload_submit').addClass('disabled').attr('disabled','disabled');
                $('#upload_spinner').addClass("visible")
                $('#upload_form div.spinner>span.message').html("Ждите.<br />Идет прикрепление файлов...")
	},

	uploadSuccess: function (event, file, serverData) {
		var response = $.parseJSON(serverData);

		if (!response) { return; }
		var $currentStatus = $('#uploaded_file_' + file.index);
		$('input[name="file_name"]', $currentStatus).val(response.file.name);
		$('input[name="file_path"]', $currentStatus).val(response.file.path);
		$('input[name="file_size"]', $currentStatus).val(file.size);

		// Прячем прогресс бар
		$('div.process', $currentStatus).hide();
		$('dd label', $currentStatus).empty().append('Файл загружен');

		// Прячем сообщение об отсутствии файлов
		$('#upload_error_files').hide();
	},

	uploadComplete: function (event, file) {
                if(!$("#file-upload-status div.process:visible").length){
                    $('#upload_submit').removeClass('disabled').removeAttr('disabled');
                    $('#upload_spinner').removeClass("visible");
                    $('#upload_form div.spinner>span.message').html("")
                }
		$(this).swfupload('startUpload');
	}
};



function defaultFormSubmitHandler (form, additionalParams) {
	var $form = $(form);

	var customHandlers = this.settings.customHandlers;

	if (customHandlers.beforeSubmit) {
		customHandlers.beforeSubmit.call(this, $form);
	}

	if (customHandlers.submit) {
		customHandlers.submit.call(this, $form, additionalParams);
	}
}



var defaultFormHandlers = {
	beforeSubmit: function ($form) {
		$(":submit", $form).attr('disabled', 'disabled');
		var prefix = this.settings.prefix;
		$('#' + prefix + '_error_text').hide();
		$('#' + prefix + '_spinner').show();
	},

	submit: function ($form, additionalParams) {
		var that = this;
		$.ajax({
			type: 'post',
			url: $form.attr('action'),
			dataType: 'json',
			data: $form.serialize() + (additionalParams ? '&' + additionalParams : ''),
			success: function (response) {
				if (response && that.settings.customHandlers.submitSuccess) {
					that.settings.customHandlers.submitSuccess.call(that, $form, response);
				}
			}
		});
	},

	submitSuccess: function ($form, response) {
		console.log(response)
		var that = this;
		var prefix = this.settings.prefix;

		$(":submit", $form).removeAttr('disabled');
		$('#' + prefix + '_spinner').hide();


		if (response.captcha) {
			$('#' + prefix + '_captcha_img').attr('src', response.captcha[0]);
			$form.get(0).md5.value = response.captcha[1];
			$form.get(0).captcha.value = '';
		}


		if (!(response.error == false || response.error == true)) { return; }

		if (response.error) {
			var ajaxErrorMessages = {};

			$.each(response.messages, function (k, v) {
				ajaxErrorMessages[k] = that.settings.messages[k][v];
			});

			this.showErrors(ajaxErrorMessages);
			this.focusInvalid();
			//$('#' + prefix + '_error_text').show();
		} else {
			// Прячем блок с ошибкой
			$('#' + prefix + '_error_text').hide();

			$form.hide();
			$form.get(0).reset();
			var $doneContainer = $('#' + prefix + '_done');
			$doneContainer.show();

			//Показываем блок с 5 последними репортажами
			$('#recent_news').show();


			// location.pathname += '#' + prefix + '_done';
			window.location.href = '#' + prefix + '_done';

			if (that.settings.customHandlers.renewForm) {
				$('#' + prefix + '_renew').click(function (e) {
					e.preventDefault();

					that.settings.customHandlers.renewForm.call(that, $form, $doneContainer);

					$(this).unbind();
				});
			}
		}
	},

	preloadCaptcha: function () {
		$('#' + this.settings.prefix + '_captcha_img').attr('src', '/i/_clones/reporter/clear.gif');
		this.settings.submitHandler.call(this, this.currentForm, 'newform=true');
	},

	renewForm: function ($form, $doneContainer) {
		alert(12)
		$doneContainer.hide();
		$form.show();
		$('li:visible', '#file-upload-status').remove();
		this.preloadCaptcha();

		// Делаем кнопку сабмит неактивной
		$(':submit', $form).addClass('disabled').attr('disabled','disabled');

		// Прячем блок с 5 последними репортажами
		$('#recent_news').hide();
	}
};



function checkCustomDate (value, element, params) {
	var form = element.form;
	var year = form.year.value;
	var month = form.month.value;
	var day = form.day.value;
	var hour = parseInt(form.hour.value);
	var min = parseInt(form.min.value);

	var oDate = new Date(year, month - 1, day, hour, min);
	var oDateString = [oDate.getFullYear(), oDate.getMonth() + 1, oDate.getDate(), oDate.getHours(), oDate.getMinutes()].join('');
	var formDateString = [year, month, day, hour, min].join('');
	var dateIsValid = (oDateString == formDateString);

	if (dateIsValid) {
		element.value = [
							(day < 10 ? '0' : '') + day, '-',
							(month < 10 ? '0' : '') + month, '-',
							year, ' ',
							(hour < 10 ? '0' : '') + hour, ':',
							(min < 10 ? '0' : '') + min
						].join('');
	}
	return dateIsValid;
}



