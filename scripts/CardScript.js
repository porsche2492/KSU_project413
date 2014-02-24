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
};

var TDeck = function(){
	var trump = Math.floor(Math.random()*types.length); // типа козырь
	var items = [];	// сама колода

	// добавление всех в колоду
	for (var i=0;i<4; ++i)				    // масти
		for (var j=6;j < 15; ++j)			// значения
			items.push((new TCard(i,j)).getCard());
	
	var swap = function(a,i,j){ var buf = a[i]; a[i] = a[j]; a[j] = buf;};
	
	// мешать колоду
	var n = CARD_COUNT-1;
	while (n >= 0)
		swap(items, Math.floor(Math.random()*n),n--);

	// взять карту сверху
	this.getTop = function(){return (this.isEmpty() ===false ? items.pop() : 'empty deck');}
	// проверка на пустоту
	this.isEmpty = function(){return items.length === 0;}
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
		for (var i =0; i<cards.legnth; ++i)
			if (items[i] !== item) ret.push(items[i]);
		this.cards = items;
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

	this.NewGame = function(){		// новая игра типа
		deck   = new TDeck();	// новая колода
		hand_1 = new THand();	// первая рука
		hand_2 = new THand();	// вторая рука
		attackHand = undefined; // Атакующая рука
		toFill = [hand_1, hand_2];
		fillHand();
	};

	this.showHands = function(){
		var s = hand_1.showCards().join('|'); // Пример:[1,2,3,4]-> "1|2|3|4"
		console.log('hand1: ', s);
		console.log('hand2: ', hand_2.showCards().join('|'));
	};
}

window.onload = function(){
	var btn_get_card = document.getElementById('btn_click');
	var deck = new TDeck();
	var hand_1 = new THand();
	var hand_2 = new THand();
	var manager = new TGameManager(); 
	btn_get_card.onclick = function(){
		// новая игра
		manager.NewGame();
		manager.showHands();
	};
};