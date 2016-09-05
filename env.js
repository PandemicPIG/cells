const GOOD_FATE = 60;
const AWESOME_FATE = 10;
const INSANE = 30;

class Environment {
    constructor({
        time:time,
        temp:temp,
        solids:solids,
        liquid:liquid,
        minTemp:minTemp,
        maxTemp:maxTemp
    }){
        this.time = time || 0;
        this.temperature = temp || 22;
        this.solid = solids || ['o','o','x','x','t'];
        this.liquid = liquid || ['w','w','w','w','w'];
        this.minTemp = minTemp || 5;
        this.maxTemp = maxTemp || 35;
    }

    stepTimeFlow(){
        this.newDay()
            .newTeperature()
            .newSolid()
            .newLiquid()
            .callHome()
    }

    startTimeFlow(){
        this.flow = setInterval(
            () => this.stepTimeFlow(),
            1000
        );
    }

    stopTimeFlow(){
        clearInterval(this.flow);
    }

    newDay(){
        this.time++;
        this.usedFate = 0;
        return this
    }

    newTeperature(){

        var sign = Math.random() < 0.5 ? '-' : '+';
        var newTemp = this.temperature + parseInt(sign + '1');

        this.temperature = newTemp < this.minTemp || newTemp > this.maxTemp ? this.temperature : newTemp;

        return this
    }

    newSolid(){

        var fate = Math.floor(Math.random()*100);
        var newSolid;

        //5% chance for an 'o'
        if( fate < this.fate(GOOD_FATE) ){
            newSolid = 'o';
        }
        //3% chance for an 'x'
        else if( fate < this.fate(AWESOME_FATE) ) newSolid = 'x';

        //1% chance for an 'm'
        else if( fate < this.fate(INSANE) ) newSolid = 't';

        //add to solids
        if( newSolid ) this.solid.push(newSolid);
        this.solid.push('o'); //food for little ones all the time :)

        return this
    }

    newLiquid(){

        //just adds water to max :)
        if( this.liquid.length < 30 ) this.liquid.splice(0, 0, 'w', 'w', 'w', 'w', 'w');

        return this
    }

    callHome(){

        // console.log('time', this.time);
        // console.log('temp', this.temperature);
        // console.log('solids', this.solid);
        // console.log('liquid', this.liquid);
        postMessage(['updated'], '*');
        return this
    }

    fate(nr){
        this.usedFate ? this.usedFate += nr : this.usedFate = nr;
        return this.usedFate
    }

}