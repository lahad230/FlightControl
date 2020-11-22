class Flight{
    constructor(brand, number, isCritical, isDeparture){
        this.name = brand + number; 
        this.isCritical = isCritical;
        this.isDeparture = isDeparture;
        this.isReady = false;
        this.currentLeg;
    }        
}

module.exports = Flight;

