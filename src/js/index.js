class Item extends PIXI.Graphics {
    constructor (iX, iY){
        super();

        this.x = iX;
        this.y = iY;
        this.interactive = true;
        this.buttonMode = true;

        this.grav = Math.random() < .5 ? -.1 : .1;

        this.beginFill(this.color);

        let type = Math.floor(Math.random()*10);
        switch (type){//Math.floor(Math.random()*5)) {
            case 0:
                this.drawCircle(0, 0, this.getRandomArbitrary(20,40));
                break;
            case 1:
                this.drawEllipse(0, 0, this.getRandomArbitrary(20,40), this.getRandomArbitrary(20,40));
                break;
            case 2:
                let _w = this.getRandomArbitrary(30,60);
                let _h = this.getRandomArbitrary(30,60);
                this.drawRoundedRect(-_w*.5, -_h*.5, _w, _h, this.getRandomArbitrary(4,16));
                break;
            case 9:
                this.drawStar(0, 0, this.getRandomArbitrary(4,7), this.getRandomArbitrary(30, 50));
                break;
            default:
                this.drawPolygon(this.drawRandomPolygon(type, this.getRandomArbitrary(40, 60)));

        }
        this.endFill();
        this.cacheAsBitmap = true;
    }

    drawRandomPolygon(iSides, iSize){
        let path = [];
        for(let i=0; i<(iSides+1); i++) {
            path.push( iSize* .5 * Math.cos((-90 * Math.PI/180) + (2 * Math.PI * (i+1) / iSides)) );
            path.push( iSize* .5 * Math.sin((-90 * Math.PI/180) + (2 * Math.PI * (i+1) / iSides)) );
        }
        return path;
    }

    getRandomArbitrary(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }

    get color() {
        let letters = '0123456789ABCDEF';
        let color = '0x';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}






const app = new PIXI.Application({view: mainScreen});//{ antialias: true }
document.body.appendChild(app.view);

app.renderer.plugins.interaction.on('pointerdown', (event) => addItemToStage(event.data.global) );

let gravity = 1;
let stepsInterval = 1;
let addItemInt = setInterval(addItemToStage, 1000/stepsInterval);

updateIntervalValue();
updateGravityValue();
updateItemsCount();


function addItemToStage(iPoint) {
    if(iPoint!=null){
        for(let item of app.stage.children){
            if(app.renderer.plugins.interaction.hitTest(iPoint,item)) return;
        }
    }

    app.stage.addChild(new Item( iPoint!=null ? iPoint.x : Math.random()*app.screen.width, iPoint!=null ? iPoint.y : -20 ))
        .on('pointertap', (event) => {removeItem(event.target)});

    culcPixels();
    updateItemsCount();
}

function removeItem(event){
    event.destroy();
    updateItemsCount();
    culcPixels();
}



/** ITEMS COUNTER **/
function updateItemsCount(){
    document.getElementById("itemsCounter").innerHTML = "Num of shapes  : " + app.stage.children.length.toString();
}

/** GRAVITY VALUE **/
function increaseGravity(){
    gravity+=1;
    updateGravityValue();
}

function decreaseGravity(){
    if(stepsInterval === 0) return;
    gravity-=1;
    updateGravityValue();
}

function updateGravityValue(){
    document.getElementById("gravValue").innerHTML = "Grav value  : " + gravity.toString();
}

/** INTERVAL VALUE **/
function increaseInterval(){
    clearInterval(addItemInt);

    stepsInterval+=1;
    updateIntervalValue();

    addItemInt = setInterval(addItemToStage, 1000/stepsInterval);
}

function decreaseInterval(){
    if(stepsInterval === 0) return;

    clearInterval(addItemInt);
    stepsInterval-=1;
    updateIntervalValue();

    if(stepsInterval > 0)
        addItemInt = setInterval(addItemToStage, 1000/stepsInterval);
}

function updateIntervalValue(){
    document.getElementById("stepsInterval").innerHTML = "Shapes per sec  : " + stepsInterval.toString();
}


function culcPixels(){
    document.getElementById("pixelsCounter").innerHTML = "Num of pix  : " + (Math.round(Math.sqrt(app.renderer.extract.pixels(app.stage).length)*100)/100).toString() + "^2";
}



/** RENDERING **/
app.ticker.add(() => {
    for(let item of app.stage.children){
        item.y = item.y+1;
        if(item.y - item.height * .5 > app.screen.height){
            removeItem(item);
        }else{
            item.y+=gravity;
            item.rotation += item.grav;
        }
    }
});