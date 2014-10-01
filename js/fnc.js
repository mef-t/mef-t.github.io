//~ Версия 1.2
//~ Автор скрипта (исключая jquery, размеется): Анатолий Веснин (http://habrahabr.ru/users/avesnin)
//~ Автор стиля с большими размерами: Иван Тремичев (http://habrahabr.ru/users/meft)
//~ Поискать новую версию можно тут: avesnin.ru
$(document).ready(function() {
	//Скрыть все содержание
	for ($i=1;$i<=3;$i++){$("#content #tab"+$i).hide();}
	$("#tabs li:first").attr("id","current"); // Активируем первую закладку
	$("#content #tab1").fadeIn(); // Выводим содержание

	$('#tabs a').click(function(e) {
		e.preventDefault();
		//Скрыть все содержание
		for ($i=1;$i<=3;$i++){$("#content #tab"+$i).hide();}
		$("#tabs li").attr("id",""); //Сброс ID
		$(this).parent().attr("id","current"); // Активируем закладку
		$('#' + $(this).attr('title')).fadeIn(); // Выводим содержание текущей закладки
	});

	// Кнопки и первоначальное значение переменных
	$br="<br />";
	$btnNight='<input id="btnNight" type="button" onclick="RoundAdd(1)" value="Ночь" />';
	$btnDay='<input id="btnDay" type="button" onclick="RoundAdd(2)" value="День" disabled />';
	$btnClear='<input id="btnClear" type="button" onclick="Action(0,0)" value="Сбросить действия" />';
	$btnTimer='<input id="btnTimer" type="button" onclick="StartTimer()" value="Таймер" />';
	$timerID=$rows=$gamers=$maffCnt=0;
	$idImmortal=$idMedic=$idBeauty=$idDetective=$idManiac=$idThief=$idBoss=$idMaff=$maffCnt=$idBomber=0;
	$inGame=false;
	$Debug=false;
	if ($Debug) $die=$bdie=$cure=$bcure=$stole=$boom=0;

	// Назначаем роли
	$('#btnSpreadRoles').click( function(){
		$arSpread=Array();
		// Стабильно добавляем две Мафии, Доктора и Комиссара
		$arSpread.push($arRoles[2]);
		$arSpread.push($arRoles[2]);
		$arSpread.push($arRoles[4]);
		$arSpread.push($arRoles[5]);
		// Добавляем Красотку
		if (7<=$gamers) $arSpread.push($arRoles[6]);
		// Добавляем Бессмертного и Босса
		if (8<=$gamers) {
			$arSpread.push($arRoles[8]);
			$arSpread.push($arRoles[3]);
		}
		// Добавляем Маньяка
		if (9<=$gamers) $arSpread.push($arRoles[7]);
		// Добавляем Вора
		if (11<=$gamers) $arSpread.push($arRoles[9]);
		// Добавляем Смертника и ещё одну Мафию
		if (13<=$gamers) {
			$arSpread.push($arRoles[10]);
			$arSpread.push($arRoles[2]);
		}
		// Добавляем ещё одну Мафию
		if (15<=$gamers) $arSpread.push($arRoles[2]);
		// Добавляем ещё одну Мафию
		if (18<=$gamers) $arSpread.push($arRoles[2]);

		// Очистка всех ролей, которые были ранее назначены
		$('#dRoles').find('select').val("");
		// Собираем id span'ов, коорые у нас есть в столбце ролей, чтобы назначить случайно роли
		$arSpan=Array();
		$('#dRoles').find('select').each(function(){
			$arSpan.push($(this).parent().attr('id'));
		});
		// Прогоняем цикл по подобранным ролям, чтобы назначить их случайным игрокам
		for ($i=0;$i<$arSpread.length;$i++){
			// Выбираем номер случайного игрока
			n=Math.floor(Math.random()*$arSpan.length);
			// Проверяем, что этому игроку не назначена уже роль, если назначена, то выбираем номер снова
			while ($arRoles[1]!=$('#'+$arSpan[n]).find("option:selected").html()) n=Math.floor(Math.random()*$arSpan.length);
			// Назначаем очереную роль выбранному игроку
			$('#'+$arSpan[n]).find('select :contains("'+$arSpread[$i]+'")').attr("selected", "selected");
		}
		// Подсчитываем остатки мафии (для вора)
		countMaff();
	});

	// Начинаем игру
	$('#btnBegin').click( function(){
		// Устанавливаем переменные в начальное состояние
		$round=0;
		$inGame=true;
		$SelfCure=false;
		$idImmortal=$idMedic=$idBeauty=$idDetective=$idManiac=$idThief=$idBoss=$idMaff=$maffCnt=$idBomber=0;
		// Отключаем добавление игроков
		$('#btnGamerAdd').attr("disabled","disabled");
		// Добавляем кнопки дня и ночи
		$('#dBtnRounds').html($btnNight+$br+$btnDay+$br+$btnClear+$br+$btnTimer);
		// Отключаем управление игроками
		$('#dNums').find(':button').attr("disabled","disabled");
		// Исключаем повторное нажатие кнопки
		$('#btnBegin').attr("disabled","disabled");
		// Даём себе возможность начать заново
		$('#btnReset').attr("disabled","");
		// Запоминаем имена игроков (чтобы потом можно было сохранить страничку)
		$('#dNames').find(":text").each(function(){
			$(this).parent().html($(this).val());
		});
		// Запоминаем роли игроков (чтобы потом можно было сохранить страничку)
		$('#dRoles').find("select").each(function(){
			// Определяем код игрока
			arr=$regRole.exec($(this).parent().attr('id'));
			// Применяем роль к ячейке
			role=$(this).find("option:selected").html();
			$(this).parent().html(role);

			// Отмечаем мафию цветом
			if ($arRoles[2]==role) setRoleClass(arr[1],$classMaff);
			// Запоминаем роль босса
			if ($arRoles[3]==role) {
				$idBoss=arr[1];
				setRoleClass(arr[1],$classMaff);
			}
			// Запоминаем роль детектива
			if ($arRoles[4]==role) $idDetective=arr[1];
			// Запоминаем роль доктора
			if ($arRoles[5]==role) $idMedic=arr[1];
			// Запоминаем роль красотки
			if ($arRoles[6]==role) $idBeauty=arr[1];
			// Запоминаем роль маньяка
			if ($arRoles[7]==role) $idManiac=arr[1];
			// Запоминаем роль бессмертного
			if ($arRoles[8]==role) $idImmortal=arr[1];
			// Запоминаем роль вора
			if ($arRoles[9]==role) $idThief=arr[1];
			// Запоминаем роль террориста
			if ($arRoles[10]==role) $idBomber=arr[1];
		});
		// Подсчитываем остатки мафии (для вора)
		countMaff();
	});


	// Сброс игры, начинаем заново
	$('#btnReset').click( function(){
		if (!confirm('Точно?')) return false;
		$inGame=false;
		// Отключаем кнопку, так как нет смысла в повторном сбросе
		$('#btnReset').attr("disabled","disabled");
		// Включаем добавление игроков
		$('#btnGamerAdd').attr("disabled","");
		// Включаем назначение ролей
		$('#btnSpreadRoles').attr("disabled","");
		// Убираем кнопки дня и ночи
		$('#dBtnRounds').html("&nbsp;");
		// Включаем управление игроками
		$('#dNums').find(':button').attr("disabled","");
		// Включаем снова возможность начать игру
		$('#btnBegin').attr("disabled","");
		// Удаляем раунды, если они были
		for ($i=1;$i<=$round;$i++){
			$('#dRound'+$i+'st1').remove();
			$('#dRound'+$i+'st2').remove();
		}
		// Возвращаем возможность редактировать имена
		$('#dNames').find("span").each(function(){
			if ($titleName!=$(this).html()) {
				$(this).html('<input type="text" value ="'+$(this).html()+'" />')
			}
		});
		// Возвращаем возможность выбирать роли
		$('#dRoles').find("span").each(function(){
			if ($titleRole!=$(this).html()) {
				// Определяем код игрока
				arr=$regRole.exec($(this).attr('id'));
				//newstyle Получаем из ячейки роль
				role=$(this).html();
				$(this).html($select);
				$(this).find('select :contains("'+role+'")').attr("selected", "selected");
			}
		});
		// Убираем информацию об убитых
		$('span').removeClass($classDie);
		$('span').removeClass($classMaff);
	});

	// Добавляем игрока
	$('#btnGamerAdd').click( function(){
		$rows++;
		$gamers++;
		$btnDel='<input type="button" onclick="GamerDel('+$rows+');" value="-" />'
		$btnUp='<input type="button" class="btnsmall" value="▲" onclick="GamerUp('+$rows+');" />';
		$btnDown='<input type="button" class="btnsmall" value="▼" onclick="GamerDown('+$rows+');" />';
		$('#dNums').append('<span id="sNum'+$rows+'"><span class="sDigit">'+$rows+'</span><span class="sBtn">'+$btnDel+'</span><span class="sBtn">'+$btnUp+$btnDown+'</span></span>');
		val='';
		if ($Debug) val=$rows;
		$('#dNames').append('<span id="sName'+$rows+'"><input type="text" value="'+val+'"/></span>');
		$('#dRoles').append('<span id="sRole'+$rows+'">'+$select+'</span>');
		renum();
		showInfo();
	});

});

function StartTimer(){
	if (0==$timerID) {
		$waitTime=$waitTimerDefault;
		sec=$waitTime % 60;if (10>sec) sec='0'+sec;
		min=Math.floor($waitTime / 60);

		$('#btnTimer').val(min+':'+sec);
		$timerID=setTimeout(ShowTimer, 1000);
	}
	else StopTimer();
}

function ShowTimer(){
	$waitTime++;
	sec=$waitTime % 60;if (10>sec) sec='0'+sec;
	min=Math.floor($waitTime / 60);
	$('#btnTimer').val(min+':'+sec);
	if (0<$waitTime) $timerID=setTimeout(ShowTimer, 1000);
		else StopTimer();
}

function StopTimer(){
	clearTimeout($timerID);
	$('#btnTimer').val('Таймер');
	$timerID=0;
}

function loadCSS(){
	$('#lcss').attr('href',$cssFolder+$('#sCSS').find("option:selected").val());
}

function setRoleClass(n,cls){
	$('#sNum'+n).addClass(cls);
	$('#sName'+n).addClass(cls);
	$('#sRole'+n).addClass(cls);
}

function renum(){
	n=1;
	$('#dNums').find('.sDigit').each(function(){
		$(this).html(n++);
	});
}

// Подсчитываем остатки мафии (для вора)
function countMaff(){
	$maffCnt=0;
	// Прогоняем столбик ролей
	// Если игра не началась, то смотрим select'ы
	if (!$inGame)
		$('#dRoles').find('select').each(function(){
			// Определяем код игрока
			arr=$regRole.exec($(this).parent().attr('id'));
			// Подсчитываем количество мафии
			// Это нужно для случая, если у нас есть роль вора
			// Если вдруг мафия одна, то запоминаем её id,
			// иначе просто запоминаем последний id
			if ($arRoles[2]==$(this).find('option:selected').html()) {
				$idMaff=arr[1];
				$maffCnt++;
			}
			// Босса тоже подсчитываем, но не запоминаем id
			if ($arRoles[3]==$(this).find('option:selected').html()) $maffCnt++;
		});
		// иначе смотрим span'ы
		else
		$('#dRoles').find('span').each(function(){
			if ($titleRole!=$(this).html()) {
				// Определяем код игрока
				arr=$regRole.exec($(this).attr('id'));
				// Подсчитываем количество мафии
				// Это нужно для случая, если у нас есть роль вора
				// Если вдруг мафия одна, то запоминаем её id,
				// иначе просто запоминаем последний id
				if ($arRoles[2]==$(this).html() && !$(this).hasClass($classDie)) {
					$idMaff=arr[1];
					$maffCnt++;
				}
				// Босса тоже подсчитываем, но не запоминаем id
				if ($arRoles[3]==$(this).html() && !$(this).hasClass($classDie)) $maffCnt++;
			}
		});
	showInfo();
	if ($Debug) showDebugInfo();
}

// Очередной раунд
function RoundAdd(State){
	StopTimer();
	if (1==State) { // Сейчас ночь
		RoundEnd(3-State); // 3-1=2 - нам надо закончить день прежде, чем начинать ночь
		$round++;
	 	$('#btnNight').attr("disabled","disabled");
		$('#btnDay').attr("disabled","");
		ee='<span class="'+$classHeader+'">Н'+$round+'</span>';
		daystyle=' roundNight';
		//Вывод кнопок действий согласно порядку span
		$('#dRoles').find("span").each(function(){
			if ($titleRole!=$(this).html()) {
				// Определяем код игрока
				arr=$regRole.exec($(this).attr('id'));
				$i=arr[1];
				ee=ee+'<span id="actg'+$i+'st'+State+'r'+$round+'"';
				cl='';
				if ($('#sRole'+$i).hasClass($classDie)) cl=$classDie;
				if ($('#sRole'+$i).hasClass($classMaff)) cl=cl+' '+$classMaff;
				ee=ee+' class="'+cl+'">';

				// Если в игре есть вор, то делаем кнопку
				if (0!=$idThief) {
					// Если сам не вор и не умер и вор ещё живой...
					if (/*$arRoles[9]!=$('#sRole'+$i).html() &&*/ !($('#sRole'+$i).hasClass($classDie)) && $idThief>0 )
						ee=ee+'<input type="button" id="g'+$i+'b6" onclick="Action('+$i+',6);" value="'+$arBtnTitles[2]+'" />';
					else
						ee=ee+'<input type="button" disabled value="'+$arBtnTitles[2]+'"/>';
				}
				if (!($('#sRole'+$i).hasClass($classDie)))
					ee=ee+'<input type="button" id="g'+$i+'b1" onclick="Action('+$i+',1);" value="'+$arBtnTitles[1]+'" />';
				else
					ee=ee+'<input type="button" disabled value="'+$arBtnTitles[1]+'"/>';
				// Если у нас есть в игре доктор, то делаем кнопку с лечением
				if (0!=$idMedic) {
					// Если сам не доктор (или себя ещё не лечил) и доктор не умер и игрок не мёртвый...
					if (($arRoles[5]!=$('#sRole'+$i).html() || $SelfCure==false) && !$('#sRole'+$i).hasClass($classDie) && $idMedic>0)
						ee=ee+'<input type="button" id="g'+$i+'b2" onclick="Action('+$i+',2);" value="'+$arBtnTitles[3]+'" />';
					else
						ee=ee+'<input type="button" disabled value="'+$arBtnTitles[3]+'"/>';
				}
				// Если у нас есть в игре детектив, то делаем кнопку с его действием
				if (0!=$idDetective) {
					// Если сам не детектив и не умер и детектив ещё живой...
					if ($arRoles[4]!=$('#sRole'+$i).html() && !($('#sRole'+$i).hasClass($classDie)) && $idDetective>0)
						ee=ee+'<input type="button" id="g'+$i+'b3" onclick="Action('+$i+',3);" value="'+$arBtnTitles[4]+'" />';
					else
						ee=ee+'<input type="button" disabled value="'+$arBtnTitles[4]+'"/>';
				}
				// Если у нас есть в игре красотка, то делаем кнопку с его действием
				if (0!=$idBeauty) {
					// Если сам не красотка и не умер и красотка ещё жива...
					if ($arRoles[6]!=$('#sRole'+$i).html() && !$('#sRole'+$i).hasClass($classDie) && $idBeauty>0)
						ee=ee+'<input type="button" id="g'+$i+'b5" onclick="Action('+$i+',5);" value="'+$arBtnTitles[5]+'" />';
					else
						ee=ee+'<input type="button" disabled value="'+$arBtnTitles[5]+'"/>';
				}
				// Если у нас есть в игре маньяк, то делаем кнопку с его действием
				if (0!=$idManiac) {
					// Если сам не маньяк и не умер и маньяк ещё живой...
					if ($arRoles[7]!=$('#sRole'+$i).html() && !($('#sRole'+$i).hasClass($classDie)) && $idManiac>0)
						ee=ee+'<input type="button" id="g'+$i+'b4" onclick="Action('+$i+',4);" value="'+$arBtnTitles[6]+'" />';
					else
						ee=ee+'<input type="button" disabled value="'+$arBtnTitles[6]+'"/>';
				}
				ee=ee+'</span>';
			}
		});
	}
	else { // Сейчас день
		RoundEnd(3-State); // 3-2=1 - нам надо закончить ночь прежде, чем начинать день
		$('#btnNight').attr("disabled","");
		$('#btnDay').attr("disabled","disabled");
		ee='<span class="sHeader">Д'+$round+'</span>';
		daystyle=' roundDay';
		//Вывод кнопок действий согласно порядку span
		$('#dRoles').find("span").each(function(){
			if ($titleRole!=$(this).html()) {
				// Определяем код игрока
				arr=$regRole.exec($(this).attr('id'));
				$i=arr[1];
				ee=ee+'<span id="actg'+$i+'st'+State+'r'+$round+'"';
				cl='';
				if ($('#sRole'+$i).hasClass($classDie)) cl=$classDie;
				if ($('#sRole'+$i).hasClass($classMaff)) cl=cl+' '+$classMaff;
				ee=ee+' class="'+cl+'">';
				// Если игрок в игре, то выводим к
				if (!($('#sRole'+$i).hasClass($classDie)))
					ee=ee+'<input type="button" id="g'+$i+'b1" onclick="Action('+$i+',1);" value="'+$arBtnTitles[7]+'" />';
				else
					ee=ee+'<input type="button" disabled value="'+$arBtnTitles[7]+'"/>';
				// Если у нас есть в игре террорист, то делаем кнопку с его действием
				if (0!=$idBomber) {
					// Если сам не террорист и не умер и террорист ещё живой...
					if ($arRoles[10]!=$('#sRole'+$i).html() && !($('#sRole'+$i).hasClass($classDie)) && $idBomber>0)
						ee=ee+'<input type="button" id="g'+$i+'b4" onclick="Action('+$i+',4);" value="'+$arBtnTitles[8]+'" />';
					else
						ee=ee+'<input type="button" disabled value="'+$arBtnTitles[8]+'"/>';
				}
				ee=ee+'</span>';
			}
		});
	}
	$('#dBtnRounds').before('<div class="dRounds'+daystyle+'" id="dRound'+$round+'st'+State+'">'+ee+'</div>');
}
// Завершение очередного раунда, применение всех кнопок
function RoundEnd(State){
	if (1==State) {	// Резюмируем ночные действия
		$die=$bdie=$cure=$bcure=$stole=0;
		// Проверяем все спаны в этом столбике
		$('#dRound'+$round+'st'+State).find("span").each(function(){
			if (!($(this).hasClass($classHeader))){
				s='';
				// Если не заголовок, то надо узнать номер игрока
				var arr=$regAct.exec(this.id)
				// Номер игрока - в arr[1]
				// Теперь проверяем все кнопки, которые есть у игрока
				$(this).find(":button").each(function(){
					// Если кнопка отмечена, как нажатая, то обрабатываем
					if ($(this).hasClass($classBtnSelected)) {
						// Накапливаем значения кнопок
						s=s+$(this).val();
						// Если убит, запоминаем это
						if ($arBtnTitles[1]==$(this).val()) $die=arr[1];
						// Если игрок был вылечен, запоминаем это
						if ($arBtnTitles[3]==$(this).val()) $cure=arr[1];
						// Если этот игрок был спасён красоткой, запоминаем это
						if ($arBtnTitles[5]==$(this).val()) $bcure=arr[1];
						// Если вор украл у игрока функцию, запоминаем это
						if ($arBtnTitles[2]==$(this).val()) $stole=arr[1];
					}
				});
				//alert('die='+$die+' bdie='+$bdie+' cure='+$cure+' bcure='+$bcure+"\n"+$('#sRole'+$die).html()+' '+$('#sRole'+$bdie).html()+' '+$('#sRole'+$cure).html()+' '+$('#sRole'+$bcure).html()+' ');
				$(this).html(s);

			}
		});
		// Предварительная проверка - вор украл способность
		if (0!=$stole){
			if ($stole==$idMedic) cure=0;
			if ($stole==$idBeauty) bcure=0;
			//alert('stole='+$stole+' idMaff='+$idMaff+' die='+$die);
			// Если вор украл способность босса или остался только один мафиози и вор украл его способность, то никто никого не убил
			if (($stole==$idBoss) || (0<=$idBoss && 1==$maffCnt && $stole==$idMaff)) $die=0;
			//alert('stole='+$stole+' idMaff='+$idMaff+' die='+$die);
		}
		// Первая проверка - кого-то убили и вылечили
		// Если вор украл способность бессмертного, а его убили, то он умрёт
		if ($idImmortal==$die && $stole!=$idImmortal) $die=0;
		if ($die==$cure || $die==$bcure) $die=0;

		// Проверяем, не себя ли лечил доктор, если да, то помечаем
		if ($idMedic==$cure) $SelfCure=true;

		// Вторая проверка - если всё-таки не вылечили
		if (0!=$die) {
			// Если убили красотку, то умирают двое
			if ($idBeauty==$die){
				// Погибает тот, кого она спасала, если его не лечили
				if ($cure!=$bcure) $bdie=$bcure;
				$idBeauty=-$idBeauty; // Запоминаем, что красотки больше нет
			}
			// Проверяем, был ли кто из погибших доктором, и запоминаем, если да
			if ($idMedic==$die || $idMedic==$bdie) $idMedic=-$idMedic;
			// Проверяем, был ли кто из погибших маньяком, и запоминаем, если да
			if ($idManiac==$die || $idManiac==$bdie) $idManiac=-$idManiac;
			// Проверяем, был ли кто из погибших детективом, и запоминаем, если да
			if ($idDetective==$die || $idDetective==$bdie) $idDetective=-$idDetective;
			// Проверяем, был ли кто из погибших террористом, и запоминаем, если да
			if ($idBomber==$die || $idBomber==$bdie) $idBomber=-$idBomber;
			// Проверяем, был ли кто из погибших боссом, и запоминаем, если да
			if ($idBoss==$die || $idBoss==$bdie) $idBoss=-$idBoss;
		}
		//alert('die='+$die+' bdie='+$bdie+' cure='+$cure+' bcure='+$bcure+"\n"+$('#sRole'+$die).html()+' '+$('#sRole'+$bdie).html()+' '+$('#sRole'+$cure).html()+' '+$('#sRole'+$bcure).html()+' ');

		// Если после всех проверок кто-то всё-таки умер, то отмечаем это
		if (0!=$die) {
			$('#sNum'+$die).addClass($classDie);
			$('#sName'+$die).addClass($classDie);
			$('#sRole'+$die).addClass($classDie);
			for ($i=1;$i<=$round;$i++) {
				$('#actg'+$die+'st'+State+'r'+$i).addClass($classDie);
				$('#actg'+$die+'st'+(3-State)+'r'+$i).addClass($classDie);
			}
		}
		if (0!=$bdie) {
			$('#sNum'+$bdie).addClass($classDie);
			$('#sName'+$bdie).addClass($classDie);
			$('#sRole'+$bdie).addClass($classDie);
			for ($i=1;$i<=$round;$i++) {
				$('#actg'+$bdie+'st'+State+'r'+$i).addClass($classDie);
				$('#actg'+$bdie+'st'+(3-State)+'r'+$i).addClass($classDie);
			}
		}
	}
	else {// Резюмируем дневные действия
		$die=$boom=0;
		// Проверяем все спаны в этом столбике
		$('#dRound'+$round+'st'+State).find("span").each(function(){
			// Если не заголовок, то обрабатываем
			if (!($(this).hasClass($classHeader))){
				s='';
				// Надо узнать номер игрока
				arr=$regAct.exec(this.id)
				// Номер игрока - в arr[1]
				// Теперь проверяем все кнопки, которые есть у игрока
				$(this).find(":button").each(function(){
					// Если кнопка отмечена, как нажатая, то обрабатываем
					if ($(this).hasClass($classBtnSelected)) {
						// Накапливаем значения кнопок
						s=s+$(this).val();
						if ($arBtnTitles[7]==$(this).val()) $die=arr[1];
						if ($arBtnTitles[8]==$(this).val()) $boom=arr[1];
					}
				//alert('die='+die+"\n"+$('#sRole'+die).html());
				});
				$(this).html(s);
			}
		});
		//alert('die='+die+"\n"+$('#sRole'+die).html());

		// Если террорист взорвал кого-то, то голосование не имеет смысла
		// Поэтому помечаем "жертву" убитым, а самого террориста - взорвавшимся
		if (0!=$boom) {
			$die=$boom;
			$boom=$idBomber;
			// Рисуем смертнику значок, что он самовзорвался
			$('#actg'+$boom+'st'+State+'r'+$round).html($arBtnTitles[8]);
		}
		if (0!=$die || 0!=$boom) {
			// Проверяем, был ли погибший красоткой, и запоминаем, если да
			if ($idBeauty==$die || $idBeauty==$boom) $idBeauty=-$idBeauty;
			// Проверяем, был ли погибший доктором, и запоминаем, если да
			if ($idMedic==$die || $idMedic==$boom) $idMedic=-$idMedic;
			// Проверяем, был ли погибший маньяком, и запоминаем, если да
			if ($idManiac==$die || $idManiac==$boom) $idManiac=-$idManiac;
			// Проверяем, был ли погибший детективом, и запоминаем, если да
			if ($idDetective==$die || $idDetective==$boom) $idDetective=-$idDetective;
			// Проверяем, был ли погибший смертником, и запоминаем, если да
			if ($idBomber==$die || $idBomber==$boom) $idBomber=-$idBomber;
			// Проверяем, был ли погибший боссом, и запоминаем, если да
			if ($idBoss==$die || $idBoss==$boom) $idBoss=-$idBoss;
		}
		// Отмечаем выбывших
		if (0!=$die){
			$('#sNum'+$die).addClass($classDie);
			$('#sName'+$die).addClass($classDie);
			$('#sRole'+$die).addClass($classDie);
			for ($i=1;$i<=$round;$i++) {
				$('#actg'+$die+'st'+State+'r'+$i).addClass($classDie);
				$('#actg'+$die+'st'+(3-State)+'r'+$i).addClass($classDie);
			}
		}
		if (0!=$boom){
			$('#sNum'+$boom).addClass($classDie);
			$('#sName'+$boom).addClass($classDie);
			$('#sRole'+$boom).addClass($classDie);
			for ($i=1;$i<=$round;$i++) {
				$('#actg'+$boom+'st'+State+'r'+$i).addClass($classDie);
				$('#actg'+$boom+'st'+(3-State)+'r'+$i).addClass($classDie);
			}
		}
	}
	// Подсчитываем остатки мафии (для вора)
	countMaff();
}

// Действия в игровом раунде
function Action(id,n){
	if (0==n) $('.dRounds').find(':button').removeClass($classBtnSelected);
	else {
		if ($('#g'+id+'b'+n).hasClass($classBtnSelected))
			$('#g'+id+'b'+n).removeClass($classBtnSelected);
		else
		for ($i=1;$i<=$rows;$i++)
			if ($i!=id) $('#g'+$i+'b'+n).removeClass($classBtnSelected);
				else $('#g'+$i+'b'+n).addClass($classBtnSelected);
	}
}
//Поднимаем игрока в списке
function GamerUp(n){
	// Если перед данным элементом не элемент заголовка, то можно сдвинуть вверх
	if ($classHeader!=$('#sRole'+n).prev().attr('class')) {
		$('#sRole'+n).prev().before($('#sRole'+n));
		$('#sNum'+n).prev().before($('#sNum'+n));
		$('#sName'+n).prev().before($('#sName'+n));
	}
	renum();
}
//Опускаем игрока в списке
function GamerDown(n){
	// Если за данным элементом идёт ещё один, то можно сдвинуть вниз
	if (null!=$('#sName'+n).next().html()) {
		$('#sRole'+n).next().after($('#sRole'+n));
		$('#sNum'+n).next().after($('#sNum'+n));
		$('#sName'+n).next().after($('#sName'+n));
	}
	renum();
}
// Удаляем игрока
function GamerDel(n){
	$('#sNum'+n).remove();
	$('#sName'+n).remove();
	$('#sRole'+n).remove();
	$gamers--;
	renum();
	showInfo();
}

// Показываем инфо и блокируем кнопки, ежели чо
function showInfo(){
	$('#cover').height(($gamers*26+27)+"px")
	info='Игроков: '+$gamers;
	info=info+'&nbsp; Мафии: '+$maffCnt;
	if (4<$gamers && !$inGame) {
		$('#btnBegin').attr("disabled","");
		$('#btnSpreadRoles').attr("disabled","");
	}
	else {
		$('#btnBegin').attr("disabled","disabled");
		$('#btnSpreadRoles').attr("disabled","disabled");
	}
	$('#dInfo').html(info);
}

// Вывод данных для дебага
function showDebugInfo(){
	$('#dDebug').html(
	'Босс='+$idBoss+
	$br+'Доктор='+$idMedic+
	$br+'Комиссар='+$idDetective+
	$br+'Маньяк='+$idManiac+
	$br+'Бессмертный='+$idImmortal+
	$br+'Красотка='+$idBeauty+
	$br+'Вор='+$idThief+
	$br+'Смертник='+$idBomber+
	$br+
	$br+$arBtnTitles[1]+'='+$die+'='+$('#sRole'+$die).html()+
	$br+$arBtnTitles[1]+'='+$bdie+'='+$('#sRole'+$bdie).html()+
	$br+$arBtnTitles[2]+'='+$stole+'='+$('#sRole'+$stole).html()+
	$br+$arBtnTitles[3]+'='+$cure+'='+$('#sRole'+$cure).html()+
	$br+$arBtnTitles[5]+'='+$bcure+'='+$('#sRole'+$bcure).html()
	);
}
