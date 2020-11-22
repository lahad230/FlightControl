const Leg = require('./Models/Leg');

const incomingFlights = new Leg("incomings");
const leg1 = new Leg(1, 10, 5);
const leg2 = new Leg(2, 5, 4);
const leg3 = new Leg(3, 3, 3);
const leg4 = new Leg(4, 1, 5);
const leg5 = new Leg(5, 5, 4);
const leg6 = new Leg(6, 1, 4);
const leg7 = new Leg(7, 1, 4);
const leg8 = new Leg(8, 5, 5);
const hangar = new Leg("hangar");

class FlightsData {
    landingProcess = [incomingFlights, leg1, leg2, leg3, leg4, leg5, leg6, leg7];
    departureProcess = [hangar, leg6, leg7, leg8, leg4];
}

module.exports = new FlightsData();