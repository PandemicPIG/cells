// common methods for all types - a general purpose library
class Commons {
	
	constructor() {
		this.debug = false
		this.log_history = []
	}
	
	transfer(from, to) {
		to.unshift(from.pop())
		
		return this
	}
	
	logNext() {
		this.log_next = true
		
		return this
	}
	
	log(...arg) {
		this.log_history.push(arg.map(elm => {
			let set = [new Date(), elm]
			if( this.debug || this.log_next ) {
				console.log(set[0] + ' - log: ' + set[1])
				this.log_next = false
			}
			return set
		}))
		
		return this
	}
}

// a bubble defines a world with finite areas and specific conditions
class Bubble extends Commons {
	constructor(state) {
		super()
		
		state ? 0 : state = {}
		
		this.name = state.name || 'unknown'
		this.x_size = state.x || 15
		this.y_size = state.y || 15
		this.world_increment = state.world_increment || 1
		this.world_moment = 	0
		this.temperature = state.temperature || 20
		this.historic_temperature = []
		this.min_temperature = state.min_temperature || 5
		this.max_temperature = state.max_temperature || 35
		this.trans_x = state.trans_x || 0
		this.trans_y = state.trans_y || 0
		this.population = []
		
		this.log('start new world: ' + this.name)

		this.world_map = Array(this.y_size).fill(null).map((row, y) => {
			return Array(this.x_size).fill(null).map((col, x) => {
				return new Area(x, y, this.trans_x, this.trans_y)
			})
		})
		
		this.log('world ready')
		this.logWorld().startTime()
	}
	
	startTime() {
		this.setTemperatureRate()
		
		//log start conditions
		this.log('start moment: ' + this.world_moment)
		this.log('temp: ' + this.temperature + '|rate:' + this.temperature_rate)
		
		this.spawnCreation()
		
		this.time_flow = setInterval(() => {
			this.timePass().newTeperature().setTemperatureRate().endTimeCheck()
		}, this.world_increment * 1000)
		
		return this
	}
	
	endTimeCondition() { 
		return false
	}
	
	timePass() {
		this.world_moment++
		this.log('w-moment: ' + this.world_moment)
		this.logWorld()
		
		return this
	}
	
	newTeperature() {
        let sign = Math.random() < 0.5 ? '-' : '+'
        let newTemp = this.temperature + parseInt(sign + '1')
		this.historic_temperature.push(this.temperature)
        this.temperature = newTemp < this.minTemp || newTemp > this.maxTemp ? this.temperature : newTemp
		
		this.log('temp: ' + this.temperature)
		
		return this
    }
	
	setTemperatureRate() {
		let min_rate = 0.8
		let max_rate = 1.2
		
		this.temperature_rate = (this.temperature * (max_rate - min_rate) - this.min_temperature * max_rate + this.max_temperature * min_rate) / (this.max_temperature - this.min_temperature)
		
		return this
	}
	
	endTimeCheck() {
		if( this.endTimeCondition() ) {
			clearInterval(this.time_flow)
		}
		
		return this
	}
	
	spawnCreation() {
		let first_eill = new Eill({
			world: this,
			spawn_location: [3, 1],
			name: 'First',
			bias: 1.073
		})
		
		this.population.push(first_eill)
		
		return this
	}
	
	logWorld() {
		this.log('world state:')
		this.world_map.map(row => {
			this.log(
				row.map(elm => {
					return elm.inhabitants.length ? 'o' : elm.resource
				}).join()
			)
		})
		
		return this
	}
	
	selectAreaByLocation(x, y) {
		let output = false
		
		this.world_map.map(row => {
			row.map(elm => {
				if( elm.position[0] === x && elm.position[1] === y ) output = elm
			})
		})
		
		return output
	}
	
	selectAreaByName(name) {
		let output = false
		
		this.world_map.map(row => {
			row.map(elm => {
				if( elm.name === name ) output = elm
			})
		})
		
		return output
	}
	
	checkResourceByLocation(x, y) {
		return this.selectAreaByLocation(x, y) ? this.selectAreaByLocation(x, y).resource : false
	}
}

// is a segment of a world
class Area extends Commons {
	constructor(x, y, trans_x, trans_y) {
		super()
		
		this.name = x + '|' + y
		this.position = [x, y]
		this.trans_x = trans_x || 0
		this.trans_y = trans_y || 0
		this.inhabitants = []
		this.creation();
	}
	
	creation() {
		
		this.seed = this.positionSeed()
		this.resource = (parseInt(this.seed) % 13) === 2 ? 'x' : ' '
		this.temp_variation = (this.seed.substr(-2) / 50) - 1
		
		this.log('area: ' + this.name + '|res: ' + this.resource + '|temp-var:' + this.temp_variation)
	}
	
	positionSeed() {
		let x_trans_pos = this.position[0] + this.trans_x
		let y_trans_pos = this.position[1] + this.trans_y
		
		let balancer = 13/23
		let x_definitive = 17 * x_trans_pos / 19
		let y_definitive = 13 * y_trans_pos / 31
		return (balancer + x_definitive + y_definitive).toString().substr(-8)
	}
}

// the basic model of an inhabitant of an area
class Eill extends Commons {
	constructor(stats) {
		super()
		
		this.world = stats.world
		this.stats = stats || {}
		
		this.randID = new Date().getTime() + '-' + Math.random().toString().substr(-6)
		this.name = this.stats.name ? this.stats.name : this.randID
		this.bias = parseInt(Math.random() * 100  + 950)
		
		this.decision = new Decision(this)
		
		this.spawn()
	}
	
	spawn() {
		this.incremental_age = 0
		this.spawn_moment = this.world.world_moment
		this.setVitals().setLocation().getProximityInput().startExistence()
	}
	
	setVitals() {
		this.alive = true
		this.energy_level = this.stats.energy_level || 100
		this.metabolic_rate = this.stats.metabolic_rate || 1 - (Math.random() - 0.5) / 10
		this.log('vitals set -> ' +
				 ' energy:' + this.energy_level + 
				 '|metab:' + this.metabolic_rate)
		return this
	}
	
	setLocation() {
		if( this.stats.spawn_location ) {
			this.location = this.world.selectAreaByLocation(
				this.stats.spawn_location[0],
				this.stats.spawn_location[1])
		}
		else {
			this.location = this.world.selectAreaByLocation(
				parseInt(Math.random() * this.world.x_size),
				parseInt(Math.random() * this.world.y_size))
		}
		
		this.location.inhabitants.push(this)
		this.log('spawn in area: ' + this.location.name)

		return this
	}
	
	getProximityInput() {
		this.proximityResource = {
			n: this.world.checkResourceByLocation(this.location.position[0], this.location.position[1] - 1),
			e: this.world.checkResourceByLocation(this.location.position[0] + 1, this.location.position[1]),
			s: this.world.checkResourceByLocation(this.location.position[0], this.location.position[1] + 1),
			w: this.world.checkResourceByLocation(this.location.position[0] - 1, this.location.position[1]),
			here: this.location.resource
		}
		
		this.log('resource at curent location: ' + this.proximityResource.here)
		this.log('resource in vecinity ->' +
				 ' n:' + this.proximityResource.n +
				 '|e:' + this.proximityResource.e +
				 '|s:' + this.proximityResource.s +
				 '|w:' + this.proximityResource.w )
		
		return this
	}
	
	getMetabolicInterval() {
		let local_variation = 1 + this.location.temp_variation / (this.world.max_temperature - this.world.min_temperature)
		this.log(local_variation + '|' + this.bias + '|' + this.metabolic_rate + '|' + this.world.temperature_rate)
		return this.bias * this.metabolic_rate * this.world.temperature_rate * local_variation
	}
	
	startExistence() {
		this.log('new spawn: ' + this.name)
		this.lifeCycle()
		
		return this
	}
	
	incrementActivity() {
		this.incremental_age++
		this.log('age: ' + this.incremental_age + '|eng:' + this.energy_level + '|cycle:' + this.getMetabolicInterval())
		this.activity()

		return this
	}
	
	activity() {
		this.energy_level--
		this.decision.takeDecision()
		
		return this
	}
	
	lifeCycle() {
		if( this.alive && this.energy_level > 0 ) {
			this.incrementActivity()
			
			setTimeout(() => {
				this.lifeCycle()
			}, this.getMetabolicInterval())
		}
		else {
			this.endLife()
		}
		
		return this
	}
	
	endLife() {
		this.log('end of ' + this.name)
		return this
	}
}

class Decision extends Commons {
	constructor(entity) {
		super()
		
		this.entity = entity
		this.SDO = [] //stored memory
	}
	
	takeDecision() {
		let input_data = [
			this.entity.proximityResource.n === 'x' ? 1 : 0,
			this.entity.proximityResource.e === 'x' ? 1 : 0,
			this.entity.proximityResource.s === 'x' ? 1 : 0,
			this.entity.proximityResource.w === 'x' ? 1 : 0,
			this.entity.proximityResource.here === 'x' ? 1 : 0,
			this.entity.energy_level,
			this.entity.location.position[0],
			this.entity.location.position[1],
			this.entity.location.temp_variation
		]
		
		/*
			output decision
				0 - stay and eat
				1 - move north
				2 - move east
				3 - move south
				4 - move west
		*/
		
		console.log(input_data)
		process.exit()
		//analyse situation vs stored situations, decisions and outcomes (SDOs) and take decision
		//store situation, decision and outcome (SDO)
		
		/*
			build individual network for each instantiation of the class
			train after each decision
				pattern:
					- input situation and outcome => output decision
					
			network structure will mutate from generation to generation
			higher network complexity will require more energy
			
			interaction between individuals can transfer stored memory on SDOs
				big network (size to be defined) individuals drop and update existent memory blocks
					others can access the memory blocks
		*/
	}
}

let new_world = new Bubble()
