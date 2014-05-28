/*******************************************************************************
*  Класс, реализующий логику приложения.                                       *
*  Содержит методы, которые должны быть привязаны к соответствующим элементам  *
*  графической оболочки приложения (по нажатию на кнопку "взять карту"         *
*  вызывается метод takePlayerCard и т.д.).                                    *
*******************************************************************************/
var TGameManager = function(){

	/******************************************************************************************
	* Класс, реализующий "денежные" операции. Содержит текущий счет, текущую ставку.          *
	*         cash     -- начальная сумма                                                     *
	*         callback -- функция, которая вызывается при изменение ставки или суммы на счету *
	*         Constructor params: cash     <-- int                                            *
	*                             callback <-- function                                       *
	*                                                                                         *
	*         callback params:    cash     <-- int                                            *
	* 	                    bet      <-- int                                                  *
	******************************************************************************************/
	var TCash = function(cash, callback){
		var _cash = cash;			// сумма на счету
		var _bet = 0;				// ставка
		var _callback = callback;	// коллбэк

		/*
			Увеличить текущий счет на заданную сумму. 
			После выполнения основных действий функции будет вызван переданный callback, если он определен
			
			param: toadd   <-- int
			@return undefined
		*/
		this.AddToCash=function(toAdd){
			_cash += toAdd;
			if (_callback !== undefined) _callback(_cash, _bet);
		}

		/*
			Уменьшить текущий счет на заданную сумму. 
			После выполнения основных действий функции будет вызван переданный callback, если он определен
			
			param: tosub  <-- int
			@return undefined
		*/
		this.SubFromCash=function(toSub){
			_cash -= toSub;
			if (_callback !== undefined) _callback(_cash, _bet);
		}

		/*
			Задать текущую ставку. 
			После выполнения основных действий функции будет вызван переданный callback, если он определен
			
			param: bet   <-- int
			@return undefined
		*/
		this.SetBet = function(bet){
			_bet = Math.max(Math.min(bet, _cash), 0 ); // Ставка от 0 до _cash
			if (_callback !== undefined) _callback(_cash, _bet);
		}

		/*
			Увеличить ставку. 
			После выполнения основных действий функции будет вызван переданный callback, если он определен
			
			param: toadd   <-- int
			@return undefined
		*/
		this.AddToBet = function(toAdd){
			_bet += toAdd;
			this.SetBet(_bet); // проверка на ставку большую, чем доступный остаток
			if (_callback !== undefined) _callback(_cash, _bet);
		}

		/*
			Уменьшить ставку. 
			После выполнения основных действий функции будет вызван переданный callback, если он определен
			
			param: tosub   <-- int
			@return undefined
		*/
		this.SubFromBet = function(toSub){
			_bet -= toSub;
			this.SetBet(_bet); // проверка на ставку большую, чем доступный остаток	
			if (_callback !== undefined) _callback(_cash, _bet);
		}

		/*
			Получить доступный остаток
			@return int
		*/
		this.GetCash = function(){return _cash;};
		
		/*
			Получить текущую ставку
			@return int
		*/
		this.GetBet  = function(){return _bet;};
	}

	/****************************************************************************************
	*	Класс, моделирующий объект "карта".Содержит краткое английское имя карты, вес карты *
	*	описание карты, путь к файлу-изображению карты.                                     *
    *                                                                                       *
	*	eng_short_description -- краткое английское имя карты (J, Q, K, A)                  *
	*	weight                -- "вес" карты при подсчете суммы карт.                       *
	*	description           -- описание карты	(пример: валет, дама, король, туз)          *
	*   img_src               -- путь к файлу, который будет привязын к карте (изображение) *
	*	                                                                                    *
	*   Constructor params: weight                 <-- int 									*			
	*						description            <-- string								*			
	*						eng_short_description  <-- string                               *
	*****************************************************************************************/
	var TCard = function(weight, description, eng_short_description){
		var _eng_short_description = eng_short_description; // краткое английское название карты (A,K,Q,J,10,9,8,7,6,5,4,3,2)
		var _weight = weight;			// вес карты
		var _description = description;	// описание
		this.img_src = "";			    // путь к файлу-изображению карты
		
		/*
			получить краткое английское описание 
			@return string
		*/
		this.getEngShortDescription = function(){return _eng_short_description;}
		
		/*
			получить "вес" карты при подсчете набранных очков
			@return int
		*/
		this.getWeight = function(){return _weight;}
		
		/*
			получить  описание 
			@return string
		*/
		this.getDescription = function(){return _description;} 
		
		/*
			изменить "вес" туза 
			@return undefined
		*/
		this.correctAceWeight = function(){
			if (_description === 'Туз'){
				_weight = 1;
			}
		}

		/*
			функция копирования информации из экземпляра класса TCard

			params : base_card  <-- TCard

			@return undefined
		*/
		this.copyCard = function(base_card){
			/* копирует информацию, сохраненную в экземпляре base_card в текущий*/
			_weight 		= base_card.getWeight();
			_description 	= base_card.getDescription();
			_eng_short_description = base_card.getEngShortDescription();
		}
	}

	/*********************************************************************
	* Класс, моделирующий объект "колода". Содержит информацию           *
	* о пути к файлу с изображениями карт, информацию об используемых    *
	* картах (под информацией понимается масть, значение), количество    *
	* используемых колод (по умолчанию одна), список карт в колоде и     *
	* количество "незадействованных" карт.                               *
	*                                                                    *
	* При вызове конструктора происходит генерация игровых карт (колод). *
	* Сгенерированные карты (TCard) заносятся в список карт (cards).     *
	*                                                                    *
	* base_dir       -- путь к папке с файлами-изображениями             *
	* possible_types -- задействованные масти                            *
	* possible_cards -- задействованные карты (от двойки до туза)        *
	* deck_count     -- число колод                                      *
	* cards          -- список карт                                      *
	* n              -- число карт в колоде                              *
	*********************************************************************/
	var TDeck = function(){
		var base_dir	= "images/game_cart/";
		var possible_types = [1,2,3,4]; // возможные масти
		var possible_cards = [		    // возможные карты
			new TCard(2, '2','2'),
			new TCard(3, '3','3'),
			new TCard(4, '4','4'),
			new TCard(5, '5','5'),
			new TCard(6, '6','6'),
			new TCard(7, '7','7'),
			new TCard(8, '8','8'),
			new TCard(9, '9','9'),
			new TCard(10, '10','10'),
			new TCard(10, 'Валет','J'),
			new TCard(10, 'Дама','Q'),
			new TCard(10, 'Король','K'),
			new TCard(11, 'Туз','A')
			]

		//var deck_count = 8;		// количество колод в новой колоде
		var deck_count = 1;		    // количество колод в новой колоде

		var cards = [];		    	// новая колода
		var n = deck_count*possible_cards.length*possible_types.length - 1; // индекс конца неиспользуемой части колоды

		for (var i=0;i<deck_count; ++i){
			for (var type in possible_types)
				for (var card_base in possible_cards){
					var card = new TCard();
					card.copyCard( possible_cards[card_base] );
					var img_src = base_dir +possible_types[type]+"_"+card.getEngShortDescription() +".png";
					card.img_src = img_src;
					console.log(img_src);
					cards.push(card);
				}
		};

		/*
			взять карту из колоды

			@return TCard
		*/
		this.getCard = function(){
			var swap = function(a,i,j){ var buf = a[i]; a[i] = a[j]; a[j] = buf;};
			swap(cards, Math.floor(Math.random()*n),n);
			//swap(cards, 0, n);
			// рандомная карта
			return cards[n--];
		}

		/*
			"вернуть карты в колоду"

			@return undefined
		*/
		this.clear 	 = function(){
			n = deck_count*possible_cards.length - 1;	
		} 
	}

	/********************************************************************
	* Класс, реализующий объект "рука", т.е. игрок или дилер. Содержит  *
	* информацию о сумме карт в руке и самих картах.                    *
	********************************************************************/
	var THand = function(){
		var sum = 0;		// суммарный вес карт
		var cards = [];		// карты
		
		/*
			добавить карту, добавить вес карты к сумме

			params: card  <-- TCard
			@return undefined
		*/
		this.AddCard = function(card){
			cards.push(card);
			var w = card.getWeight();
			var d = card.getDescription();
			// Если перебор при Туз == 11 , то изменяем вес Туза на 1
			//if (d === 'Туз' && sum + w > 21) w = 1;

			sum += w;
		}
		
		/*
			скорректировать вес тузов

			@return undefined
		*/
		this.CorrectAces = function(){
			for (var i=0;i<cards.length; ++i){
				if (sum > 21 && cards[i].getDescription() === 'Туз' && cards[i].getWeight() === 11){
					sum -= 10;
					cards[i].correctAceWeight();
					break;
				}
			}
		}

		/*
			получить суммарный вес карт в руке

			@return sum  <-- int
		*/
		this.getSum = function(){return sum;}
		
		/*
			функция, предоставляющая строковое представление карт. Используется для 
			отладки

			@return string
		*/
		this.cards_to_str = function(){
			var ret = ' | ';
			for (var i=0; i<cards.length; ++i){
				ret += cards[i].getDescription()+'['+cards[i].getWeight()+']'+' | ';
			}
			return ret;
		}

		/*
			сброс
		*/
		this.clear = function(){
			sum = 0;
			cards = [];	
		}

		/*
			проверка на наличие карт
		*/
		this.isEmpty = function(){
			return (cards.length === 0);
		}
	}

	var STARTUPCASH = 1000;
	var isOver		= false; 			// конец игры. [банкротство]
	var deck 		= new TDeck();
	var playerHand 	= new THand();
	var dillerHand 	= new THand();
	var playerCash  = new TCash(STARTUPCASH, this.onPlayerCashChange);
	this.isRoundFinished = true;
	this.delay = 1000;
	playerCash.SetBet(100);

	/*
		Начало нового раунда. Перед началом вызывается соответствующий коллбэк

		@return undefined
	*/
	this.NewRound	= function(){
		this.onNewRound();
		this.isRoundFinished = false;
		playerHand.clear();
		dillerHand.clear();
		deck = new TDeck();
		console.log('игрок');

		var c = playerCash.GetCash();
		var b = playerCash.GetBet();
		playerCash = new TCash(c, this.onPlayerCashChange);
		playerCash.SetBet(b);
		console.log('cash: '+c + ' bet: '+b);

		if (c<=0){
			console.log('"ВЫ БАНКРОТ"(с)');
			playerCash = new TCash(STARTUPCASH, this.onPlayerCashChange);
		}
	}

	/*
		функция взятия игроком карты

		@return undefined
	*/
	this.takePlayerCard = function(){
		if (this.isRoundFinished ===  true || playerHand.GetC)
			this.NewRound();
		//this.isRoundFinished = false;
		if (playerHand.getSum() < 21){
			var card = deck.getCard();
			playerHand.AddCard(card);
			this.onPlayerGetCard(card);

			var sum = playerHand.getSum();
			if (sum > 21){
				//пытаемся уменьшить вес тузов;
				playerHand.CorrectAces();
				if (playerHand.getSum() > 21){
					//sum = -1;
					console.log(playerHand.cards_to_str());
					this.takeDillerCards();
				}
			}else if (sum == 21){
				
			}

		console.log(playerHand.cards_to_str());
		}
		return sum;
	}

	/*
		Функция взятия дилером карт.

		@return undefined
	*/
	this.takeDillerCards = function(){
		console.log('Диллер');
		var playerSum = playerHand.getSum();
		if (playerSum > 21){
			this.onPlayerOverload();
			this.NewRound();
		}else{
			var card = deck.getCard();
			dillerHand.AddCard(card);
			this.onDillerGetCard(card)
			
			console.log(dillerHand.cards_to_str());
			
			while (dillerHand.getSum() < 17){
				var card = deck.getCard();
				dillerHand.AddCard(card);
				this.onDillerGetCard(card);
				console.log(dillerHand.cards_to_str());
				if (dillerHand.getSum() > 21){
					dillerHand.CorrectAces();
				}				
			};

			var dillerSum = dillerHand.getSum();
			if (dillerSum > 21){
				this.onDillerOverload(playerSum, dillerSum);
			} else{
				//dillerSum  = (dillerSum > 21 ? 0: dillerSum);

				if (playerSum > dillerSum){
					this.onPlayerWin(playerSum, dillerSum)
				}else if (playerSum < dillerSum){
					this.onPlayerLose(playerSum, dillerSum)
				}else{
					this.onDraw();
					playerCash.SubFromCash(0);
				}
			}
		}
		this.isRoundFinished = true;	
	}

	/*
		Сделать ставку. В параметре передается размер ставки

		param : bet  <-- int
		@return undefined
	*/
	this.SetBet = function(bet){
		if (playerHand.isEmpty() === true && dillerHand.isEmpty() === true)
			playerCash.SetBet(bet);
	}

	/*
		Увеличить ставку на заданную сумму. Заданная сумма передается в параметре

		param: to_add  <-- int
		@return undefined
	*/
	this.AddToBet = function(to_add){
		if (playerHand.isEmpty() === true && dillerHand.isEmpty() === true)
			playerCash.AddToBet(to_add);
	}


	this.onPlayer21 = function(){
		/* игрок набрал 21.*/
		console.log(' !!! 21 !!! ');
		alert("21");
	}

	this.onPlayerWin = function(playerSum, dillerSum){
		/* игрок выиграл */
		if (typeof playerSum !== undefined && typeof dillerSum !== undefined){
			console.log('win ['+playerSum+']['+dillerSum+']');
			alert("Игрок: " + playerSum+"\nДиллер: "+dillerSum+"\n WIN");
			playerCash.AddToCash(playerCash.GetBet());
		} else{
			// все плохо 
			console.log("playerSum: " + playerSum);
			console.log("dillerSum: " + dillerSum);
		}
	}

	this.onPlayerLose = function(playerSum, dillerSum){
		/* игрок проиграл */
		if (typeof playerSum !== undefined && typeof dillerSum !== undefined){
				console.log('lose ['+playerSum+']['+dillerSum+']');
				alert("Игрок: " + playerSum+"\nДиллер: "+dillerSum+"\n LOSE");
				playerCash.SubFromCash(playerCash.GetBet());
		} else{
			// все плохо 
			console.log("playerSum: " + playerSum);
			console.log("dillerSum: " + dillerSum);
		}	
	}

	this.onDraw = function(){
		/* ничья */
		console.log(" draw ");
		alert(' При своих ');
	}

	this.onPlayerOverload = function(){
		/* У игрока перебор */
		console.log('игрок перебрал');
		alert(' У игрока перебор');
		playerCash.SubFromCash(playerCash.GetBet());
	}

	this.onDillerOverload = function( playerSum, dillerSum){
		/* У диллера перебор. */
	
		console.log(' У диллера перебор');
		alert(' У диллера перебор');
		this.onPlayerWin(playerSum, dillerSum);
	}

	this.onNewRound = function(){
		/* Вызывается при начале нового рауна*/
	}

	this.onPlayerGetCard = function(card){
		/* Вызывается при взятии карты игроком */
	}
	this.onDillerGetCard = function(card){
		/* Вызывается при взятии карты игроком */
	}

	this.onPlayerCashChange = function(){
		/*вызывается при пересчете*/v
	}
}

window.onload = function(){
	var btn_takeCard 			= document.getElementById('pool_new_cards');
	var btn_stop				= document.getElementById('button_right');
	var element_bet  			= document.getElementById('bet');
	var game_area 				= document.getElementById('game_area');
	var playerCashArea 			= document.getElementById('player_cash');
	var playerCardsContainer 	= document.getElementById('player1_cards');
	var add100 					= document.getElementById('add100');
	var add25 					= document.getElementById('add10');
	var set0 					= document.getElementById('set0');

	// скрыть элементы отвечающие за ставку до начала игры
	add25.hidden = add100.hidden = set0.hidden = true;

	var radioBtn_bg1 			= document.getElementById('background1'); 
	var radioBtn_bg2 			= document.getElementById('background2');
	var radioBtn_bg3 			= document.getElementById('background3');
	var radioBtn_bg4 			= document.getElementById('background4');

	var onPlayerGetCard_callback = function(card){
		var nimg = document.createElement('img');
		nimg.src = card.img_src;
		nimg.style.width ='100px';
		if (playerCardsContainer.firstChild !== null){
			//var base_offset = Number.parseInt(playerCardsContainer.lastChild.style.marginLeft.substr(0,playerCardsContainer.lastChild.style.marginLeft.length-2));
			//var card_width = Number.parseInt(playerCardsContainer.lastChild.style.width.substr(0,playerCardsContainer.lastChild.style.width.length-2));
			//var marginLeft =  base_offset + 0.25 * card_width;
			nimg.style.marginLeft = "-50px";
		}else{
			nimg.style.marginLeft = "100px";
		}	
		
//		ndiv.appendChild(nimg);
		playerCardsContainer.appendChild(nimg);
		
	}

	var dillerCardsContainer 	= document.getElementById('player2_cards');
	var onDillerGetCard_callback = function(card){
	//	var time_start = Date.now();

		var nimg = document.createElement('img');
		nimg.src = card.img_src;
		nimg.style.width ='100px';
		if (dillerCardsContainer.firstChild !== null){
			//var base_offset = Number.parseInt(playerCardsContainer.lastChild.style.marginLeft.substr(0,playerCardsContainer.lastChild.style.marginLeft.length-2));
			//var card_width = Number.parseInt(playerCardsContainer.lastChild.style.width.substr(0,playerCardsContainer.lastChild.style.width.length-2));
			//var marginLeft =  base_offset + 0.25 * card_width;
			nimg.style.marginLeft = "-50px";
		}else{
			nimg.style.marginLeft = "100px";
		}	
		
//		ndiv.appendChild(nimg);
		dillerCardsContainer.appendChild(nimg);
		
		//while (Date.now() - time_start < this.delay) 
			/*ждать*/;

	}

	var onNewRound_callback = function(){
		while (playerCardsContainer.firstChild){
			playerCardsContainer.removeChild(playerCardsContainer.firstChild);
		}

		while (dillerCardsContainer.firstChild){
			dillerCardsContainer.removeChild(dillerCardsContainer.firstChild);
		}
	}

	var onPlayerCashChange_callback = function(player_cash, playerBet){
		playerCashArea.innerHTML = "<p> Остаток: " + player_cash + "</p>";
		playerCashArea.innerHTML += "<p> Ставка: " + playerBet + "</p>";
		console.log(playerBet);
	}

	var manager = new TGameManager();

	// передаем колбЭки
	manager.onPlayerGetCard = onPlayerGetCard_callback;
	manager.onNewRound = onNewRound_callback;
	manager.onDillerGetCard = onDillerGetCard_callback;
	manager.onPlayerCashChange = onPlayerCashChange_callback;
	// --------------

	//manager.NewRound();
	manager.onPlayerCashChange();

	game_area.onclick = function(){
		if (manager.isRoundFinished === true){
			add10.hidden = add100.hidden = set0.hidden = false;
			manager.NewRound();
		}
	}

	btn_takeCard.onclick = function(){
		if (manager.isRoundFinished === false)
		manager.takePlayerCard();
	}

	btn_stop.onclick = function(){
		if (manager.isRoundFinished === false)
			manager.takeDillerCards();
	} 

	set0.onclick = function(){
		manager.SetBet(0);
	}

	add25.onclick = function(){
		manager.AddToBet(25);
	}

	add100.onclick = function(){
		manager.AddToBet(100);
	}

	radioBtn_bg1.onchange = function(){
		if (radioBtn_bg1.checked === true){
			document.getElementById("pool_new_cards").style.backgroundImage = 'url("images/game_cart/0.png")';
		}
	}
	radioBtn_bg2.onchange = function(){
		if (radioBtn_bg2.checked === true){
			document.getElementById("pool_new_cards").style.backgroundImage = 'url("images/game_cart/R1.png")';
		}
	}
	radioBtn_bg3.onchange = function(){
		if (radioBtn_bg3.checked === true){
			document.getElementById("pool_new_cards").style.backgroundImage = 'url("images/game_cart/R2.png")';
		}
	}
	radioBtn_bg4.onchange = function(){
		if (radioBtn_bg4.checked === true){
			document.getElementById("pool_new_cards").style.backgroundImage = 'url("images/game_cart/R3.png")';
		}
	}
}