//~ Версия 1.2
//~ Автор скрипта (исключая jquery, размеется): Анатолий Веснин (http://habrahabr.ru/users/avesnin)
//~ Автор стиля с большими размерами: mef-t (http://habrahabr.ru/users/meft)
//~ Поискать новую версию можно тут: avesnin.ru
$(document).ready(function() {
	// Регулярка для выделения номера игрока, стадии и раунда из span.id
	$regAct=/actg(\d+)st(\d+)r(\d+)/;
	// Регулярка для выделения номера игрока при определении ролей
	$regRole=/sRole(\d+)/;

	$cssFolder='css/';

	$titleRole='Роль';
	$titleName='Игрок';

	$classHeader='sHeader';
	$classMaff='roleMaff';
	$classDie='gamerDie';
	$classBtnSelected='btnSelected';
	$waitTimerDefault=0;//3*60; // Таймер на три минуты

	// Роли, используемые в игре
	// Роли нельзя менять местами, так как механизм скрипта завязан на идентификаторы.
	// Названия ролей менять можно
	$arRoles=Array();
	$arRoles[1]='&nbsp;'; // Мирный, обыватель
	$arRoles[2]='Мафия';$arRoles[3]='Босс';$arRoles[4]='Комиссар';$arRoles[5]='Доктор';
	$arRoles[6]='Красотка';$arRoles[7]='Маньяк';$arRoles[8]='Бессмертный';$arRoles[9]='Вор';$arRoles[10]='Смертник';

	// Список ролей
	$select='<select>';
	for ($i=1;$i<$arRoles.length;$i++) $select=$select+'<option value="'+$i+'">'+$arRoles[$i]+'</option>';
	$select=$select+'</select>';

	// Названия кнопок и отметок в протоколе
	// Нельзя указывать html-формат символов типа &#8258; - надо указывать сам символ!
	// Коды можно глянуть тут, например: http://an-site.ru/utf.htm
	$arBtnTitles=Array();
	$arBtnTitles[1]="☠";// для убийства
	$arBtnTitles[2]="В";// для вора
	$arBtnTitles[3]="✚";// для лечения
	$arBtnTitles[4]="✍";// для проверки комиссаром
	$arBtnTitles[5]="❤";// для спасения красоткой
	$arBtnTitles[6]="М";// для обработки маньяком
	$arBtnTitles[7]="✕";// для убийства днём
	$arBtnTitles[8]="⁂";// для взрыва смертника
	// ➌
	// Краткое описание ролей
	s='Обозначения:<br /><strong>'+$arBtnTitles[1]+'</strong> - Убийство мафией<br /><strong>'+$arBtnTitles[2]+'</strong> - Вор крадёт способность<br /><strong>'+
							$arBtnTitles[3]+'</strong> -  Доктор лечит<br /><strong>'+$arBtnTitles[4]+'</strong> - Комиссар проверяет<br />'+
							$arBtnTitles[5]+'</strong> - Красотка спасает<br /><strong>'+$arBtnTitles[6]+'</strong> - Маньяк действует<br />'+
							$arBtnTitles[7]+'</strong> - расстрел днём<br /><strong>'+$arBtnTitles[8]+'</strong> - взрыв смертника';
	$('#dInfoSigns').html(s);
});
