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
	var TCard = function(weight, description){
		var _weight = weight;			// вес карты
		var _description = description;	// описание
		this.getWeight = function(){return _weight;}
		this.getDescription = function(){return _description;} 
		this.correctAceWeight = function(){
			if (_description === 'Туз'){
				_weight = 1;
			}
		}
	}
	var TDeck = function(){
		var posible_cards = [
			new TCard(2, '2'),
			new TCard(3, '3'),
			new TCard(4, '4'),
			new TCard(5, '5'),
			new TCard(6, '6'),
			new TCard(7, '7'),
			new TCard(8, '8'),
			new TCard(9, '9'),
			new TCard(10, '10'),
			new TCard(10, 'Валет'),
			new TCard(10, 'Дама'),
			new TCard(10, 'Король'),
			new TCard(11, 'Туз')
			]

		//var deck_count = 8;		// количество колод в новой колоде
		var deck_count = 1;		// количество колод в новой колоде

		var cards = [];			// новая колода
		var n = deck_count*posible_cards.length - 1; // индекс конца неиспользуемой части колоды

		for (var i=0;i<deck_count; ++i){
			for (var k=0;k<posible_cards.length; ++k){
				cards.push(posible_cards[k]);
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
			n = deck_count*posible_cards.length - 1;	
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
	playerCash.SetBet(100);

	this.NewRound	= function(){
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
		if (playerHand.getSum() < 21){
			var card = deck.getCard();
			playerHand.AddCard(card);

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
				console.log(' !!! 21 !!! ');
			}

		console.log(playerHand.cards_to_str());
		}
		return sum;
	}
	this.takeDillerCards = function(){
		console.log('Диллер');
		var playerSum = playerHand.getSum();
		if (playerSum > 21){
			console.log('игрок перебрал');
			playerCash.SubFromCash(playerCash.GetBet());
		}else{

			dillerHand.AddCard(deck.getCard());
			console.log(dillerHand.cards_to_str());
			while (dillerHand.getSum() < 17){
				dillerHand.AddCard(deck.getCard());
				console.log(dillerHand.cards_to_str());
				if (dillerHand.getSum() > 21){
					dillerHand.CorrectAces();
				}
			};

			var dillerSum = dillerHand.getSum();
			dillerSum  = (dillerSum > 21 ? 0: dillerSum);

			if (playerSum > dillerSum){
				console.log('win ['+playerSum+']['+dillerSum+']');
				playerCash.AddToCash(playerCash.GetBet());
			}else if (playerSum < dillerSum){
				console.log('lose ['+playerSum+']['+dillerSum+']');
				playerCash.SubFromCash(playerCash.GetBet());
			}else{
				console.log('draw ['+playerSum+']['+dillerSum+']');
				playerCash.SubFromCash(0);
			}
		}
		this.NewRound();	
	}

	this.SetBet = function(bet){
		playerCash.SetBet(bet);
	};
}

window.onload = function(){
	var btn_takeCard 	= document.getElementById('pool_new_cards');
	var btn_stop		= document.getElementById('button_right');
	var element_bet  	= document.getElementById('bet');

	var manager = new TGameManager();
	manager.NewRound();

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