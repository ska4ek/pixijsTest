# PixiJS test app. Prototypes vs classes (MVC).

JS app with the [Pixi rendering engine](https://github.com/pixijs/pixi.js) and MVC architectural pattern.

## EventEmitter
"on" for adding event handler and "emit" for calling the event handlers
### prototypes
```sh
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
```
### classes
```sh
class EventEmitter {
    constructor() {
        this._events = {};
    }
    on(evt, listener) {
        (this._events[evt] || (this._events[evt] = [])).push(listener);
        return this;
    }
    emit(evt, arg) {
        (this._events[evt] || []).slice().forEach(lsn => lsn(arg));
    }
}
```
## Item
Model of shape
### prototypes
```sh
let Item = function Item (iX, iY) {
    this._x = iX;
    this._y = iY;

    this._color = '0x';
    let letters = '0123456789ABCDEF';
    for (let i = 0; i < 6; i++) this._color += letters[Math.floor(Math.random() * 16)];

    this._type = Math.floor(Math.random()*10);
    this._width = this.getRandomArbitrary(20,40);
....
....
protAccessorsItem.height.get = function () { return this._height*2; };
Object.defineProperties( Item.prototype, protAccessorsItem );
```

### classes
```sh
class Item {
    constructor (iX, iY) {
        this._x = iX;
        this._y = iY;

        this._color = '0x';
        let letters = '0123456789ABCDEF';
        for (let i = 0; i < 6; i++) this._color += letters[Math.floor(Math.random() * 16)];

        this._width = this.getRandomArbitrary(20,40);
....
....
    get height() { return this._height*2; }
}
```

## GameModel
Consists of an array which contains Items and parameters of the main state. Extended of the EventEmitter to dispatch events to the View
### prototypes
```sh
let GameModel = (function (EventEmitter) {
    function GameModel () {
        EventEmitter.call(this);

        this._areaWidth = 800;
....
....
    Object.defineProperties( GameModel.prototype, prototypeAccessors );
    return GameModel;
}(EventEmitter));
```

### classes
```sh
class GameModel extends EventEmitter {
    constructor() {
        super();
        
        this._areaWidth = 800;
....
....
    }
}
```

## GameView
Handles the input events from the user interface. Extended of the EventEmitter to dispatch events to the Controller. Contain [Pixi rendering engine](https://github.com/pixijs/pixi.js). 
### prototypes
```sh
let GameView = (function (EventEmitter) {
    function GameView (iModel, iElements) {
        EventEmitter.call(this);

        this._model = iModel;
        this._elements = iElements;
....
....
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
....
....
    return GameView;
}(EventEmitter));
```

### classes
```sh
class GameView extends EventEmitter {
    constructor(iModel, elements) {
        super();
        this._model = iModel;
        this._elements = elements;
....
....
render() {
    this._graph.clear();

    for(let i=0; i < this._model.itemsLength; i++){
        let item = this._model.getItem(i);
        this._graph.beginFill(item.color);
        item.draw(this._graph);
        this._graph.endFill();
    }

    this._elements.pixelsCounter.innerHTML = "Num of pix  : " + (Math.round(Math.sqrt(this.app.renderer.extract.pixels(this._graph).length)*100)/100).toString() + "^2";
}
....
....
}
```

## GameController
### prototypes
```sh
let GameController = function GameController (iModel, iView) {
    this._view = iView;
    this._model = iModel;
....
....
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
....
....
};
```

### classes
```sh
class GameController {
    constructor(iModel, iView) {
        this._view = iView;
        this._model = iModel;
....
....
enterFrame() {
    for(let i=0; i < this._model.itemsLength; i++){
        let item = this._model.getItem(i);

        if(item.y > this._model.areaHeight + item.height * .5){
            this._model.removeItemAt(i);
        }else{
            item.y+=this._model.gravity;
        }
    }
}
....
....
}
```
## Initialization
### the same on prototypes and classes
```sh
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
```
## Result
Prototypes: `292 lines (225 sloc)  10.7 KB`
Classes: `271 lines (219 sloc)  8.84 KB`
"Under the hood" the class keyword, it is the same prototypal approach.

License
----

MIT
