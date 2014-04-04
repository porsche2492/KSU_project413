var types = ['П','Ч', 'Т', 'Б'];
var CARD_COUNT = 36;
var TCard = function(type, value, bmp){
	/*
		Валет = 11
		Дама  = 12
		Король= 13
		Туз   = 14
	*/
	var _faces= ['Валет','Дама','Король','Туз'];
	var _type = type;     // масть 
	var _value= value;    // значение (числовое)
	var _bmp = bmp;		  // резерв для картинки
	
	// вернет строковое описание карты
	this.getCard = function(){ 
		//console.log(value);
		var mod = _value % 10;
		return types[_type]+' '+(mod >= 1 && mod <=4 ? _faces[mod - 1] : _value);} 

	this.getType = function(){return _type;}
	this.getValue= function(){return _value;}
};

var TDeck = function(){
	var trump = Math.floor(Math.random()*types.length); // типа козырь
	var items = [];	// сама колода

	// добавление всех в колоду
	for (var i=0;i<4; ++i)				    // масти
		for (var j=6;j < 15; ++j)			// значения
			items.push((new TCard(i,j)));
	
	var swap = function(a,i,j){ var buf = a[i]; a[i] = a[j]; a[j] = buf;};
	
	// мешать колоду
	var n = CARD_COUNT-1;
	while (n >= 0)
		swap(items, Math.floor(Math.random()*n),n--);

	// взять карту сверху
	this.getTop = function(){return (this.isEmpty() ===false ? items.pop() : 'empty deck');}
	// проверка на пустоту
	this.isEmpty = function(){return items.length === 0;}
	// получить козырь
	this.getTrump = function(){return trump;}
};

var THand = function(){
	var cards = [];					// карты на руках
	this.pushOne = function(item){	// взять одну карту
		cards.push(item);
	};
	this.pushMany = function(items){	// взять много
		for (var i=0;i<items.length; ++i)
			this.pushOne(items[i]);
	};
	this.popItem = function(item){	// отдать карту
		var ret = [];
		for (var i =0; i<cards.length; ++i)
			if (cards[i] !== item) ret.push(cards[i]);
		cards = ret;
	};
	this.popItemByInd = function(ind){
		// индекс, не попадающий в [0,n) заменяется на 0, если меньше 0
		// и на n-1 , если n+ 
		var card = cards[Math.min(Math.max(ind, 0), cards.length-1)];
		this.popItem(card);
		return card; 
	};
	this.showCards = function(){ // вывести карты в консоль и вернуть список карт
		for (var i = 0; i<cards.length; ++i)
			console.log(cards[i]);
		return cards;
	};
	this.CardsCount = function(){return cards.length;}
}

var TGameManager = function(){
	var deck = new TDeck();
	var n  = 6; 				// число карт на руке
	var hand_1 = new THand();	// первая рука
	var hand_2 = new THand();	// вторая рука
	var attackHand = undefined; // Атакующая рука
	var toFill = [];// руки, которые должны быть дополнены из колоды
	
	var toDef = undefined;	// карта, которая должна быть побита

	var fillHand = function(){	// добить до n
		for (var i=0;i<toFill.length; ++i){
			// добить руки, требующие добивки до n
			var currentHand = toFill[i];
			while (currentHand.CardsCount() < n && deck.isEmpty() === false){
				var card = deck.getTop(); // достать из колоды
				currentHand.pushOne(card);// вставить в руку
			};
		}
	};

	this.getTrump = function(){
		return deck.getTrump();
	};
	this.NewGame = function(){		// новая игра типа
		deck   = new TDeck();	// новая колода
		hand_1 = new THand();	// первая рука
		hand_2 = new THand();	// вторая рука
		attackHand = hand_1; // Атакующая рука
		toFill = [hand_1, hand_2];
		fillHand();
	};

	this.showHands = function(){
		var cl  = hand_1.showCards();
		var s = "";
		for (var i=0;i<cl.length; ++i)
			s+= ' | ' + cl[i].getCard();
		console.log(s);
	
		cl  = hand_2.showCards();
		s = "";
		for (var i=0;i<cl.length; ++i)
			s+= ' | ' + cl[i].getCard();
		console.log(s);
			
	};

	this.move = function(state,ind){
		var attack = function(attacker,ind){
			toDef = attacker.popItemByInd(ind); 
			return 'attack: ' + toDef.getCard();
		}
		var defence= function(defender,ind){
			var card = defender.popItemByInd(ind);
			console.log('Def: ', card.getCard());
			if (card.getType() === toDef.getType() && card.getValue() > toDef.getValue()){ // одна масть
				fillHand();
				return card.getCard()+' -> ' + toDef.getCard();
			}else if (deck.getTrump() === toDef.getType()){ // нужно бить козырь 
				// козырь бьется козырем
				if (card.getType() === deck.getTrump() && card.getValue() > toDef.getValue()){
					fillHand();
					return card.getCard()+' -> ' + toDef.getCard();
				}
			}else if (card.getType() === deck.getTrump() && toDef.getType() !== deck.getTrump()){ 
				// козырь бьет не козырь
				fillHand();
				return card.getCard()+' -> ' + toDef.getCard();
			}
			
			defender.pushOne(card);
			return 'JOPA, NONONO';
		}
		var take = function(defender){
			if (toDef !== undefined)
				defender.pushOne(toDef);
				fillHand();
				return 'TAKE JOP';
			return 'NONONO , JOP';
		}
		var res = '';
		if (state === 'attack')
			res = "attack: " + attack(attackHand, ind);
		else if (state === 'def')
			res = defence((hand_1 === attackHand ? hand_2 : hand_1), ind);
		else if (state === 'take')
			res = take((hand_1 === attackHand ? hand_2 : hand_1));
		return res;
		console.log(res);
	}
	this.test = function(){
		console.log('trump: ',types[deck.getTrump()]);
		var h1 = new THand();
		h1.pushOne(new TCard(1,7));
		var h2 = new THand();
		h2.pushMany([new TCard(2,7),new TCard(3,7),new TCard(1,8),new TCard(2,11)]);
		hand_1 = h1;
		hand_2 = h2;
		attackHand = hand_1;
		for (var i=0; i<n; ++i){
			// print карт
			this.showHands();
			//
			if (i < h1.CardsCount()) 
				this.move('attack' ,i);
			for (var j=0;j<h2.CardsCount(); ++j){
				if (this.move('def', j) !== 'JOPA') break;
			}
		}
	}
	this.drawCards = function(ctx){
		var cl  = hand_1.showCards();
		ctx.beginPath();
		for (var i=0;i<cl.length; ++i)
			 ctx.fillText(cl[i].getCard(),10, 10 + i*10);
	
		cl  = hand_2.showCards();
		for (var i=0;i<cl.length; ++i)
			 ctx.fillText(cl[i].getCard(), 100, 10 + i*10);
	
		ctx.stroke();
	}
	this.getCard = function(hand_ind , card_ind){
		var cards = (hand_ind ? hand_2 : hand_1).showCards();
		var card  = undefined;
		if (cards.length > 0){
			card = cards[card_ind]
		};
		return card;
	}
	this.hand_ind;
	this.card_ind;
	this.selected_card;
	this.moveByInd = function(){
		var res = '';
		var attackHandInd = (attackHand == hand_1 ? 0 : 1); 
		if (this.hand_ind == attackHandInd){
			res = this.move('attack', this.card_ind);
		}else{
			res = this.move('def', this.card_ind);
		}
		return res;
	}
	this.jop = function(){
		var res = '';
		var attackHandInd = (attackHand == hand_1 ? 0 : 1); 
		res = this.move('take');

		return res;
	}
}

window.onload = function(){
	var btn_get_card = document.getElementById('btn_click');
	var cnv = document.getElementById('cnv');
	var btn_take = document.getElementById('btn_jop');
	/*var deck = new TDeck();
	var hand_1 = new THand();
	var hand_2 = new THand();
	*/
	var manager = new TGameManager();
	
	btn_take.onclick = function(){
		var ctx = cnv.getContext('2d');
		ctx.clearRect(0,0, 300, 150)

		var tx = manager.jop();
		ctx.strokeText(tx, 170,10);
		
		ctx.strokeText(" trump: "+types[manager.getTrump()], 250,10);

		manager.drawCards(ctx);
	}

	cnv.onclick = function(e){
		var ctx = cnv.getContext('2d');
		ctx.clearRect(0,0, 300, 150)

		manager.hand_ind = Math.min(Math.max(0,Math.floor(e.x/100)),1);
		manager.card_ind = Math.min(Math.max(0,Math.floor((e.y-10)/10)), 5);
		manager.selected_card = manager.getCard(manager.hand_ind, manager.card_ind);
		
		ctx.strokeText(" trump: "+types[manager.getTrump()], 250,10);
		
		var tx = manager.moveByInd();
		ctx.strokeText(tx, 170,10);
		
		manager.drawCards(ctx);
	};
	cnv.onmousemove = function(e){
		/*var ctx = cnv.getContext('2d');
		ctx.clearRect(150,0, 200, 100);

		manager.hand_ind = Math.min(Math.max(0,Math.floor(e.x/100)),1);
		manager.card_ind = Math.min(Math.max(0,Math.floor((e.y-10)/10)), 5);
		manager.selected_card = manager.getCard(manager.hand_ind, manager.card_ind);
		ctx.strokeText(" card: "+manager.selected_card.getCard(), 170,10);
	*/
	}

	btn_get_card.onclick = function(){
		// новая игра
		manager.NewGame();
		manager.showHands();
		var ctx = cnv.getContext('2d');
		manager.drawCards(ctx);
		ctx.strokeText(" trump: "+types[manager.getTrump()], 250,10);
		//manager.fillHand();
		//manager.test();
	};
};