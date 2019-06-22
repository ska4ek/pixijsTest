let EventEmitter = function EventEmitter() {
    this._events = {};
};

EventEmitter.prototype.on = function on(evt, listener) {
    (this._events[evt] || (this._events[evt] = [])).push(listener);
    return this;
};

EventEmitter.prototype.emit = function emit(evt, arg) {
    (this._events[evt] || []).slice().forEach(lsn => lsn(arg));
};


/*** ITEM ***/

let Item = function Item (iX, iY) {
    this._x = iX;
    this._y = iY;

    this._color = '0x';
    let letters = '0123456789ABCDEF';
    for (let i = 0; i < 6; i++) this._color += letters[Math.floor(Math.random() * 16)];

    this._type = Math.floor(Math.random()*10);
    this._width = this.getRandomArbitrary(20,40);
    this._height = this.getRandomArbitrary(20,40);

    switch (this._type){
        case 0:
            this.draw = (iGraph) => { iGraph.drawCircle(this._x, this._y, this._width); };
            this._width = this._height;
            break;
        case 1:
            this.draw = (iGraph) => { iGraph.drawEllipse(this._x, this._y, this._width, this._height); };
            break;
        case 2:
            this.draw = (iGraph) => { iGraph.drawRoundedRect(this._x-this._width, this._y-this._height, this._width*2, this._height*2, this._custome); };
            this._custome = this.getRandomArbitrary(4,16);
            break;
        case 9:
            this.draw = (iGraph) => { iGraph.drawStar(this._x, this._y, this._custome, this._width); };
            this._width = this._height;
            this._custome = this.getRandomArbitrary(4,7);
            break;
        default:
            this.draw = (iGraph) => { iGraph.drawPolygon(this._path); };
            this._width = this._height;
            this._path = this.drawRandomPolygon(this._type, this._width*2);
    }
};

var protAccessorsItem = { x: { configurable: true },y: { configurable: true },color: { configurable: false },width: { configurable: false },height: { configurable: false } };


Item.prototype.drawRandomPolygon = function drawRandomPolygon(iSides, iSize) {
    let path = [];
    for(let i=0; i<(iSides+1); i++) {
        path.push( iSize * .5 * Math.cos((-90 * Math.PI/180) + (2 * Math.PI * (i+1) / iSides)) + this._x);
        path.push( iSize * .5 * Math.sin((-90 * Math.PI/180) + (2 * Math.PI * (i+1) / iSides)) + this._y);
    }
    return path;
};

Item.prototype.getRandomArbitrary = function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
};

Item.prototype.contains = function contains(iPoint) {
    return (iPoint.x >= this._x - this._width && iPoint.x <= this._x + this._width && iPoint.y >= this._y - this._height && iPoint.y <= this._y + this._height) ? true : false;
};

protAccessorsItem.color.get = function () { return this._color; };

protAccessorsItem.x.get = function () { return this._x; };
protAccessorsItem.x.set = function (iValue) { this._x = iValue; };

protAccessorsItem.y.get = function () { return this._y; };
protAccessorsItem.y.set = function (iValue) {
    if(this._path != null){
        for(let i=0; i<this._path.length; i++){
            if(i%2 === 1) this._path[i]+=iValue-this._y;
        }
    }
    this._y = iValue;
};

protAccessorsItem.width.get = function () { return this._width*2; };
protAccessorsItem.height.get = function () { return this._height*2; };

Object.defineProperties( Item.prototype, protAccessorsItem );


/*** MODEL ***/

let GameModel = (function (EventEmitter) {
    function GameModel () {
        EventEmitter.call(this);

        this._areaWidth = 800;
        this._areaHeight = 600;
        this._items = [];
        this._interval = 1;
        this._gravity = 1;
    }

    if ( EventEmitter ) { GameModel.__proto__ = EventEmitter; }
    GameModel.prototype = Object.create( EventEmitter && EventEmitter.prototype );
    GameModel.prototype.constructor = GameModel;

    let prototypeAccessors = { areaWidth: { configurable: false },areaHeight: { configurable: false },interval: { configurable: true },gravity: { configurable: true },itemsLength: { configurable: false } };

    GameModel.prototype.getItem = function getItem(iIndex) { return this._items[iIndex]; };
    GameModel.prototype.addItem = function addItem(iItem) {
        this._items.push(iItem);
        this.emit('itemsChanged');
    };
    GameModel.prototype.removeItemAt = function removeItemAt(iIndex) {
        this._items.splice(iIndex, 1);
        this.emit('itemsChanged');
    };

    prototypeAccessors.areaWidth.get = function() { return this._areaWidth; };
    prototypeAccessors.areaHeight.get = function() { return this._areaHeight; };

    prototypeAccessors.interval.get = function() { return this._interval; };
    prototypeAccessors.interval.set = function (iIndex) {
        this._interval = iIndex;
        this.emit('intervalChanged', iIndex);
    };

    prototypeAccessors.gravity.get = function() { return this._gravity; };
    prototypeAccessors.gravity.set = function(iIndex) {
        this._gravity = iIndex;
        this.emit('gravityChanged', iIndex);
    };

    prototypeAccessors.itemsLength.get = function() { return this._items.length; };

    Object.defineProperties( GameModel.prototype, prototypeAccessors );

    return GameModel;
}(EventEmitter));



/*** VIEW ***/

let GameView = (function (EventEmitter) {
    function GameView (iModel, iElements) {
        EventEmitter.call(this);

        this._model = iModel;
        this._elements = iElements;

        iModel.on('gravityChanged', () => this.updateGravityCounter())
            .on('intervalChanged', () => this.updateIntervalCounter())
            .on('itemsChanged', () => this.updateItemsCounter());

        iElements.intervalDecrease.addEventListener('click', () => this.emit('intervalDecrease'));
        iElements.intervalIncrease.addEventListener('click', () => this.emit('intervalIncrease'));
        iElements.gravityDecrease.addEventListener('click', () => this.emit('gravityDecrease'));
        iElements.gravityIncrease.addEventListener('click', () => this.emit('gravityIncrease'));
    }

    if ( EventEmitter ) { GameView.__proto__ = EventEmitter; }
    GameView.prototype = Object.create( EventEmitter && EventEmitter.prototype );
    GameView.prototype.constructor = GameView;

    GameView.prototype.show = function show() {
        this.app = new PIXI.Application({view: mainScreen, width: this._model.areaWidth, height: this._model.areaHeight});
        document.body.appendChild(this.app.view);

        this.app.renderer.plugins.interaction.on('pointerdown', event => this.emit('pointerdown', event.data.global));
        this._graph = new PIXI.Graphics();
        this.app.stage.addChild(this._graph);

        this.updateGravityCounter();
        this.updateIntervalCounter();

        this.app.ticker.add(() => this.emit('enterFrame'));
        this.app.ticker.add(() => this.render());
    };

    GameView.prototype.render = function render() {
        this._graph.clear();

        for(let i=0; i < this._model.itemsLength; i++){
            let item = this._model.getItem(i);
            this._graph.beginFill(item.color);
            item.draw(this._graph);
            this._graph.endFill();
        }

        this._elements.pixelsCounter.innerHTML = "Num of pix  : " + (Math.round(Math.sqrt(this.app.renderer.extract.pixels(this._graph).length)*100)/100).toString() + "^2";
    };

    GameView.prototype.updateGravityCounter = function updateGravityCounter(){ this._elements.gravityCounter.innerHTML = "Grav value  : " + this._model.gravity.toString(); };
    GameView.prototype.updateIntervalCounter = function updateIntervalCounter(){ this._elements.intervalCounter.innerHTML = "Shapes per sec  : " + this._model.interval.toString(); };
    GameView.prototype.updateItemsCounter = function updateItemsCounter(){ this._elements.itemsCounter.innerHTML = "Num of shapes  : " + this._model.itemsLength.toString(); };

    return GameView;
}(EventEmitter));



/*** CONTROLLER ***/

let GameController = function GameController (iModel, iView) {
    this._view = iView;
    this._model = iModel;

    iView.on('pointerdown', iPoint => this.addItem(iPoint));
    iView.on('intervalIncrease', () => this.intervalIncrease());
    iView.on('intervalDecrease', () => this.decreaseInterval());
    iView.on('gravityIncrease', () => this.increaseGravity());
    iView.on('gravityDecrease', () => this.decreaseGravity());
    iView.on('enterFrame', () => this.enterFrame());
};

GameController.prototype.init = function init() {
    this.itemInt = setInterval(() => this.addItem(), 1000/this._model.interval);
};

GameController.prototype.intervalIncrease = function intervalIncrease() {
    clearInterval(this.itemInt);
    this._model.interval+=1;
    this.itemInt = setInterval(() => this.addItem(), 1000/this._model.interval);
};

GameController.prototype.decreaseInterval = function decreaseInterval() {
    if(this._model.interval === 0) return;

    clearInterval(this.itemInt);
    this._model.interval-=1;

    if(this._model.interval > 0) this.itemInt = setInterval(() => this.addItem(), 1000/this._model.interval);
};

GameController.prototype.increaseGravity = function increaseGravity() {
    this._model.gravity+=1;
};

GameController.prototype.decreaseGravity = function decreaseGravity() {
    if(this._model.gravity === 0) return;
    this._model.gravity-=1;
};

GameController.prototype.addItem = function addItem(iPoint) {
    if(iPoint != null) {
        for(let i=0; i < this._model.itemsLength; i++){
            const item = this._model.getItem(i);
            if(item.contains(iPoint)){
                this._model.removeItemAt(i);
                return;
            }
        }
    }

    this._model.addItem(new Item( iPoint!=null ? iPoint.x : Math.random()*this._model.areaWidth, iPoint!=null ? iPoint.y : -20 ));
};

GameController.prototype.enterFrame = function enterFrame() {
    for(let i=0; i < this._model.itemsLength; i++){
        let item = this._model.getItem(i);

        if(item.y > this._model.areaHeight + item.height * .5){
            this._model.removeItemAt(i);
        }else{
            item.y+=this._model.gravity;
        }
    }
};


window.addEventListener('load', () => {
    const model = new GameModel(),
        view = new GameView(model, {
            'intervalCounter' : document.getElementById('intervalCounter'),
            'intervalDecrease' : document.getElementById('intervalDecrease'),
            'intervalIncrease' : document.getElementById('intervalIncrease'),
            'gravityDecrease' : document.getElementById('gravityDecrease'),
            'gravityIncrease' : document.getElementById('gravityIncrease'),
            'gravityCounter' : document.getElementById('gravityCounter'),
            'itemsCounter' : document.getElementById('itemsCounter'),
            'pixelsCounter' : document.getElementById('pixelsCounter')
        }),
        controller = new GameController(model, view);

    view.show();
    controller.init();
});