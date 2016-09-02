class Cell {
    constructor(environment,name,world){
        this.environment = environment;
        this.world = world;
        this.name = name;
        
        this.characteristic = 5 - Math.floor(Math.random()*10);
        
        this.birth = this.environment.time;
        this.metabolicAge = 0;
        this.metabolicRate = 1;
        this.liquid = [];
        this.solid = [];
        this.energy = '|||||';
        this.size = 1;
        this.maxCap = 1 + this.size*2;
        this.startLifeFlow();
        this.offsprings = 0;
    }
    
    stepLifeFlow(){
        setTimeout(
            () =>  {
                //get moment data
                this.metabolicRate = (this.environment.temperature * (30 + this.energy.length + this.characteristic)/1000);
                this.metabolicAge++;

                if( this.metabolicAge > (10 * this.size) ) this.size++;
                if( this.size > 2 && this.size < 20 ) this.divide();
                //console.log('metabolic rate: ' + this.metabolicRate, "\n"+'energy :' + this.energy);
                // do stuf while alive

                //use energy for living
                this.energy = this.energy.slice(0, -1);

                //eliminate waste
                this.poo();

                //get hungry
                if( this.energy.length < 7 ){
                    if( this.size < 20 ) this.absorbe('w').ingest('o').burn(false);
                    else this.absorbe('w').ingest('m').burn(true);
                }

                //if enought energy live one more day
                if( this.energy.length > 0 ){
                    postMessage([this.name],'*');
                    this.startLifeFlow();
                }
                else this.hibernate();
            }, Math.floor(Math.random() * 100)
        );
    }
    
    startLifeFlow(){
        setTimeout(
            () => this.stepLifeFlow(),
            2000 - this.environment.temperature * (30 + this.energy.length + this.characteristic)
        );
    }
    
    absorbe(stuff){
        var index;
        if( this.liquid.length < this.maxCap ){
            index = this.environment.liquid.indexOf(stuff);
            if(index >= 0){
                this.environment.liquid.splice(index, 1);
                this.liquid.push(stuff);
            }
        }
        
        return this
    }
    
    ingest(stuff){
        var index;
        if( this.solid.length < this.maxCap ){
            index = this.environment.solid.indexOf(stuff);
            if(index >= 0){
                this.environment.solid.splice(index, 1);
                this.solid.push(stuff);
            }
        }
        
        return this
    }
    
    burn(waste){
        var io = this.solid.indexOf('o');
        if( waste ) io = this.solid.indexOf('m');
        var lq = this.liquid.indexOf('w');
        
        if( io >= 0 && lq >= 0 ){
            this.liquid.splice(lq, 1);
            if( waste ) this.solid.splice(io, 1);
            else this.solid.splice(io, 1, 'm');
            this.energy += '||||||||||';
        }
        
        return this
    }
    
    poo(){
        var ip = this.solid.indexOf('m');
        if( ip >= 0 ){
            this.solid.splice(ip, 1);
            this.environment.solid.push('m');
            this.poo();
        }
    }
    
    hibernate(){
        var it = this.environment.solid.indexOf('x');
        if(it >= 0){
            this.environment.solid.splice(it, 1, 'm');
            this.metabolicRate = 'hibernation';
            this.energy = '|||||||';
            postMessage([this.name],'*');
            setTimeout(
                () => this.stepLifeFlow(),
                15000
            );
        } else {
            this.metabolicRate = 'x_X';
            postMessage([this.name],'*');
        }
    }
    
    divide(){
        var it = this.environment.solid.indexOf('t');
        if(it >= 0){
            console.log('on', this.environment.time, this.name, 'triggered divide');
            this.environment.solid.splice(it, 1, 'm');
            this.size = this.size - 1;
            this.offsprings++;
            this.world.push( new Cell(this.environment, this.name + '_' + this.offsprings, this.world) );
        }
    }
}