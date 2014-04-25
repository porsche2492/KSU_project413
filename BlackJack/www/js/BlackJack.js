var TGameManager = function(){
	var TCash = function(cash){
		var _cash = cash;
		var _bet = 0;

		this.AddToCash=function(toAdd){
			_cash += toAdd;
		}
		this.SubFromCash=function(toSub){
			_cash -= toSub;
		}

		this.SetBet = function(bet){
			_bet = Math.max(Math.min(bet, _cash), 0 ); // Ставка от 0 до _cash
		}
		this.AddToBet = function(toAdd){
			_bet += toAdd;
			SetBet(_bet); // проверка на ставку большую, чем доступный остаток
		}
		this.SubFromBet = function(toSub){
			_bet -= toSub;
			SetBet(_bet); // проверка на ставку большую, чем доступный остаток	
		}

		this.GetCash = function(){return _cash;};
		this.GetBet  = function(){return _bet;};
	}
	var TCard = function(weight, description, eng_short_description){
		var _eng_short_description = eng_short_description; // краткое английское название карты (A,K,Q,J,10,9,8,7,6,5,4,3,2)
		var _weight = weight;			// вес карты
		var _description = description;	// описание
		this.img_src = "";			// путь к файлу-изображению карты
		this.getEngShortDescription = function(){return _eng_short_description;}
		this.getWeight = function(){return _weight;}
		this.getDescription = function(){return _description;} 
		this.correctAceWeight = function(){
			if (_description === 'Туз'){
				_weight = 1;
			}
		}
		this.copyCard = function(base_card){
			/* копирует информацию, сохраненную в экземпляре base_card в текущий*/
			_weight 		= base_card.getWeight();
			_description 	= base_card.getDescription();
			_eng_short_description = base_card.getEngShortDescription();
		}
	}
	var TDeck = function(){
		var base_dir	= "images/game_cart/";
		var possible_types = [1,2]; // возможные масти
		var possible_cards = [		// возможные карты
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
		var deck_count = 1;		// количество колод в новой колоде

		var cards = [];			// новая колода
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

		this.getCard = function(){
			var swap = function(a,i,j){ var buf = a[i]; a[i] = a[j]; a[j] = buf;};
			swap(cards, Math.floor(Math.random()*n),n);
			//swap(cards, 0, n);
			// рандомная карта
			return cards[n--];
		}

		this.clear 	 = function(){
			n = deck_count*possible_cards.length - 1;	
		} 
	}
	var THand = function(){
		var sum = 0;
		var cards = [];
		this.AddCard = function(card){
			cards.push(card);
			var w = card.getWeight();
			var d = card.getDescription();
			// Если перебор при Туз == 11 , то изменяем вес Туза на 1
			//if (d === 'Туз' && sum + w > 21) w = 1;

			sum += w;
		}
		this.CorrectAces = function(){
			for (var i=0;i<cards.length; ++i){
				if (sum > 21 && cards[i].getDescription() === 'Туз' && cards[i].getWeight() === 11){
					sum -= 10;
					cards[i].correctAceWeight();
					break;
				}
			}
		}
		this.getSum = function(){return sum;}
		this.cards_to_str = function(){
			var ret = ' | ';
			for (var i=0; i<cards.length; ++i){
				ret += cards[i].getDescription()+'['+cards[i].getWeight()+']'+' | ';
			}
			return ret;
		}
		this.clear = function(){
			sum = 0;
			cards = [];	
		}
	}

	var STARTUPCASH = 1000;
	var isOver		= false; 			// конец игры. [банкротство]
	var deck 		= new TDeck();
	var playerHand 	= new THand();
	var dillerHand 	= new THand();
	var playerCash  = new TCash(STARTUPCASH);
	this.isRoundFinished = true;
	this.delay = 1000;
	playerCash.SetBet(100);

	this.NewRound	= function(){
		this.onNewRound();
		this.isRoundFinished = false;
		playerHand.clear();
		dillerHand.clear();
		deck = new TDeck();
		console.log('игрок');

		var c = playerCash.GetCash();
		var b = playerCash.GetBet();
		console.log('cash: '+c + ' bet: '+b);

		if (c<=0){
			console.log('"ВЫ БАНКРОТ"(с)');
			playerCash = new TCash(STARTUPCASH);
		}
	}
	this.takePlayerCard = function(){
		if (this.isRoundFinished ===  true)
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

	this.SetBet = function(bet){
		playerCash.SetBet(bet);
	};

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
}

window.onload = function(){
	var btn_takeCard 			= document.getElementById('pool_new_cards');
	var btn_stop				= document.getElementById('button_right');
	var element_bet  			= document.getElementById('bet');
	var game_area = document.getElementById('game_area');

	var playerCardsContainer 	= document.getElementById('player1_cards');
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

	var manager = new TGameManager();

	// передаем колбЭки
	manager.onPlayerGetCard = onPlayerGetCard_callback;
	manager.onNewRound = onNewRound_callback;
	manager.onDillerGetCard = onDillerGetCard_callback;
	// --------------

	manager.NewRound();

	game_area.onclick = function(){
		if (manager.isRoundFinished === true)
			manager.NewRound();
	}

	btn_takeCard.onclick = function(){
		manager.takePlayerCard();
	}

	btn_stop.onclick = function(){
		manager.takeDillerCards();
	}

	element_bet.oninput = function(){
		manager.SetBet(element_bet.value);
	}
}