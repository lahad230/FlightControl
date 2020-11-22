class Leg{
    constructor(number,capacity,crossingTime){
        this.number = number;
        this.capacity = capacity;
        this.crossingTime = crossingTime;
        this.flights = [];
    }
}

module.exports = Leg;