const Data = require('./FlightsData');
const log = require('../LogDb/Repositories/FlightLogRepository')

const incomingFlights = 0;
const leg1 = 1;
const leg2 = 2;
const leg3 = 3;
const leg4 = 4;
const leg5 = 5;
const arrivalLeg6 = 6;
const arrivalLeg7 = 7;
const hangar = 0;
const departureLeg6 = 1;
const departureLeg7 = 2;
const leg8 = 3;
let check6First = false;

class Logic {
    //main arrival func, it calls all other funcs.
    async arrivalChangeLegAsync(flight) {
        const nextFlight = await this.arrivalChangeLeg(flight);

        //try to move departure if you can:
        if (nextFlight.departureNextFlight) {
            if (this.departureCheckAndMove(nextFlight.departureNextFlight)) {
                return;
            }
        }
        //try to move arrival:
        if (nextFlight.arrivalNextFlight) {
            this.arrivalCheckAndMove(nextFlight.arrivalNextFlight);
        }

    }
    //main departure func, it calls all other funcs.
    async departureChangeLegAsync(flight) {
        const nextFlight = await this.departureChangeLeg(flight);
        //try to move arrival if you can:
        if (nextFlight.arrivalNextFlight) {
            if (this.arrivalCheckAndMove(nextFlight.arrivalNextFlight)) {
                return;
            }
        }
        //try to move departure:
        if (nextFlight.departureNextFlight) {
            this.departureCheckAndMove(nextFlight.departureNextFlight);
        }

    }

    //call canMove func and if true, move arrival flight.
    async arrivalCheckAndMove(flight) {
        const canChangeLeg = await this.arrivalCanChangeLeg(flight);
        if (canChangeLeg) {
            this.arrivalChangeLegAsync(flight);
        }
        return canChangeLeg;
    }

    //call canMove func and if true, move departure flight.
    async departureCheckAndMove(flight) {
        const canChangeLeg = await this.departureCanChangeLeg(flight);
        if (canChangeLeg) {
            this.departureChangeLegAsync(flight);
        }
        return canChangeLeg;
    }

    //this func moves flight to the next leg in the landingProcess and returns the next flights to try and advance;
    arrivalChangeLeg(flight) {
        return new Promise((res, rej) => {
            if (!flight) {
                rej("func must get flight object!");
                return;
            }
            let arrivalNextFlight;
            let departureNextFlight;

            //update next flight based on current leg:
            switch (flight.currentLeg) {
                case leg4:
                    arrivalNextFlight = Data.landingProcess[flight.currentLeg - 1].flights[0];
                    departureNextFlight = Data.departureProcess[flight.currentLeg - 1].flights[0];
                    break;
                case arrivalLeg6:
                    arrivalNextFlight = Data.landingProcess[flight.currentLeg - 1].flights[0];
                    departureNextFlight = Data.departureProcess[departureLeg6 - 1].flights[0];
                    break;
                case arrivalLeg7:
                    arrivalNextFlight = Data.landingProcess[flight.currentLeg - 2].flights[0];
                    departureNextFlight = Data.departureProcess[departureLeg7 - 2].flights[0];
                    break;
                case incomingFlights:
                    break;
                default:
                    arrivalNextFlight = Data.landingProcess[flight.currentLeg - 1].flights[0];
                    break;
            }

            //removes flight from its current leg.
            Data.landingProcess[flight.currentLeg].flights.shift();

            //advance flight to next leg:
            if (flight.currentLeg < arrivalLeg6) {
                if (flight.currentLeg < 5) {
                    flight.currentLeg++;
                }
                else {
                    //try to enter leg6, but if cant enter leg 7.
                    if (Data.landingProcess[arrivalLeg6].flights.length < Data.landingProcess[arrivalLeg6].capacity) {
                        flight.currentLeg++;
                    }
                    else {
                        flight.currentLeg += 2;
                    }
                }
                //ciritcal flights enter first.
                if (flight.isCritical) {
                    Data.landingProcess[flight.currentLeg].flights.unshift();
                }
                else {
                    Data.landingProcess[flight.currentLeg].flights.push(flight);
                }
                flight.isReady = false;

                //flight starts to move in the new leg.
                this.completeLeg(flight, Data.landingProcess[flight.currentLeg].crossingTime);
                //log this action:
                log.create(flight.name, flight.isDeparture, `Entered ${Data.landingProcess[flight.currentLeg].number}`);
                console.log(`${flight.name} arrival entered leg ${Data.landingProcess[flight.currentLeg].number}`);
            }

            //flight finished the process and is out of the system:
            else {
                //log this action:
                log.create(flight.name, flight.isDeparture, `finished the landing process`);
                console.log(`${flight.name} finished the landing process.`);
            }

            // Data.landingProcess.forEach(leg => {
            //     console.log(`leg ${leg.number}: ${leg.flights.length}`);
            // });
            //returns the next flight to be called to the current leg:
            res({ departureNextFlight, arrivalNextFlight });
        })
    }

    //this func moves flight to the next leg in the departureProcess and returns the next flights to try and advance;
    departureChangeLeg(flight) {
        return new Promise((res, rej) => {
            if (!flight) {
                rej("func must get a flight object!");
                return;
            }
            let departureNextFlight;
            let arrivalNextFlight;

            //update next flights based on the current leg;
            switch (flight.currentLeg) {
                case leg4:
                    departureNextFlight = Data.departureProcess[flight.currentLeg - 1].flights[0];
                    arrivalNextFlight = Data.landingProcess[flight.currentLeg - 1].flights[0];
                    break;
                case departureLeg6:
                    departureNextFlight = Data.departureProcess[flight.currentLeg - 1].flights[0];
                    arrivalNextFlight = Data.landingProcess[arrivalLeg6 - 1].flights[0];
                    break;
                case departureLeg7:
                    departureNextFlight = Data.departureProcess[flight.currentLeg - 2].flights[0];
                    arrivalNextFlight = Data.landingProcess[arrivalLeg7 - 2].flights[0];
                case leg8:
                    //to avoid having a plane stuck in leg7, half the time try to take plane from 7 first!
                    check6First = !check6First;
                    if (check6First) {
                        let flightToCheck = Data.departureProcess[departureLeg6].flights[0];
                        if (flightToCheck) {
                            if (flightToCheck.isDeparture) {
                                departureNextFlight = flightToCheck;
                                break;
                            }
                        }
                        flightToCheck = Data.departureProcess[departureLeg7].flights[0];
                        if (flightToCheck) {
                            if (flightToCheck.isDeparture) {
                                departureNextFlight = flightToCheck;
                                break;
                            }
                        }
                        break;
                    }
                    else {
                        let flightToCheck = Data.departureProcess[departureLeg7].flights[0];
                        if (flightToCheck) {
                            if (flightToCheck.isDeparture) {
                                departureNextFlight = flightToCheck;
                                break;
                            }
                        }
                        flightToCheck = Data.departureProcess[departureLeg6].flights[0];
                        if (flightToCheck) {
                            if (flightToCheck.isDeparture) {
                                departureNextFlight = flightToCheck;
                                break;
                            }
                        }
                    }
            }
            Data.departureProcess[flight.currentLeg].flights.shift();

            //if flight not in last leg update the process.
            if (flight.currentLeg != leg4) {
                if (flight.currentLeg == departureLeg7 || flight.currentLeg == departureLeg6) {
                    flight.currentLeg = leg8;
                }
                else if (flight.currentLeg == hangar) {
                    if (Data.departureProcess[departureLeg6].flights.length < Data.departureProcess[departureLeg6].capacity) {
                        flight.currentLeg++;
                    }
                    else {
                        flight.currentLeg += 2;
                    }
                }
                else {
                    flight.currentLeg++;
                }
                Data.departureProcess[flight.currentLeg].flights.push(flight);

                flight.isReady = false;
                this.completeLeg(flight, Data.departureProcess[flight.currentLeg].crossingTime);
                //log action.
                log.create(flight.name, flight.isDeparture, `Entered ${Data.departureProcess[flight.currentLeg].number}`);
                console.log(`${flight.name} departure entered leg ${Data.departureProcess[flight.currentLeg].number}`);
            }
            //flight finished process and is out of the system:
            else {
                //log this action.
                log.create(flight.name, flight.isDeparture, `finished the departure process`);
                console.log(`${flight.name} finished the departure process.`);
            }
            // Data.departureProcess.forEach(leg => {
            //     console.log(`leg ${leg.number}: ${leg.flights.length}`);
            // });
            res({ departureNextFlight, arrivalNextFlight });
        })
    }

    //this func checks if arrival flight can proced to the next leg.
    arrivalCanChangeLeg(flight) {
        return new Promise((res, rej) => {
            if (!flight) {
                rej("func must get flight object!");
                return;
            }
            if (!flight.isDeparture) {
                //flight finished its current leg and is the first in line:
                if (flight.isReady && Data.landingProcess[flight.currentLeg].flights[0] == flight) {
                    switch (flight.currentLeg) {
                        case leg3:
                            //there must be room for the flight in the next leg:
                            if (Data.landingProcess[flight.currentLeg + 1].flights.length < Data.landingProcess[flight.currentLeg + 1].capacity) {
                                //moving from 3 to 4 depands on the state of 5.
                                if (Data.landingProcess[leg5].flights.length < Data.landingProcess[leg5].capacity) {
                                    res(true);
                                    return;
                                }
                            }
                            break;
                        case leg5:
                            //leg5 can move to either leg 6 or leg 7:
                            if (Data.landingProcess[flight.currentLeg + 1].flights.length < Data.landingProcess[flight.currentLeg + 1].capacity ||
                                Data.landingProcess[flight.currentLeg + 2].flights.length < Data.landingProcess[flight.currentLeg + 2].capacity) {
                                res(true);
                                return;
                            }
                            break;
                        case arrivalLeg6:
                        case arrivalLeg7:
                            res(true);
                            return;
                        default:
                            //there must be room for the flight in the next leg:
                            if (Data.landingProcess[flight.currentLeg + 1].flights.length < Data.landingProcess[flight.currentLeg + 1].capacity) {
                                res(true);
                                return;
                            }
                            break;
                    }
                }
            }
            res(false);
        })
    }

    //this func check if departure flight can proced to the next leg.
    departureCanChangeLeg(flight) {
        return new Promise((res, rej) => {
            if (!flight) {
                rej("func must get flight object");
                return;
            }
            if (flight.isDeparture) {
                //flight finished current leg and first in line:
                if (flight.isReady && Data.departureProcess[flight.currentLeg].flights[0] == flight) {
                    switch (flight.currentLeg) {
                        //form leg 6 flight moves to leg 8:
                        case departureLeg6:
                            if (Data.departureProcess[flight.currentLeg + 2].flights.length < Data.departureProcess[flight.currentLeg + 2].capacity) {
                                res(true);
                                return;
                            }
                            break;
                        case hangar:
                            //moving out of the hangar to leg 6 or 7:
                            if (Data.departureProcess[departureLeg6].flights.length < Data.departureProcess[departureLeg6].capacity ||
                                Data.departureProcess[departureLeg7].flights.length < Data.departureProcess[departureLeg7].capacity) {
                                res(true);
                                return;
                            }
                            break;
                        //flight in the last leg:
                        case leg4:
                            res(true);
                            break;
                        default:
                            if (Data.departureProcess[flight.currentLeg + 1].flights.length < Data.departureProcess[flight.currentLeg + 1].capacity) {
                                res(true);
                            }
                            break;
                    }
                }
            }
            res(false);
        })
    }

    //simulate the plane crossing a leg, and at the end asking the control tower to advance to next leg.
    completeLeg(flight, time) {
        return new Promise(res => {
            setTimeout(() => {
                flight.isReady = true;
                if (!flight.isDeparture) {
                    this.arrivalCheckAndMove(flight);
                    res();
                }
                else {
                    this.departureCheckAndMove(flight);
                    res();
                }
            }, time * 1000);
        })
    }

    //add flight to the landing process
    registerArrivalFlight(currentFlight) {
        //check if there is roomfor flight:
        if (Data.landingProcess[leg1].flights.length < Data.landingProcess[leg1].capacity) {
            currentFlight.currentLeg = 1;

            //critical flight are put at the front.
            if (currentFlight.isCritical) {
                Data.landingProcess[leg1].flights.unshift(currentFlight);
            }
            else {
                Data.landingProcess[leg1].flights.push(currentFlight);
            }
            //console.log(`${currentFlight.name} arrival entered leg 1`);
            //start flying across leg1.
            this.completeLeg(currentFlight, Data.landingProcess[leg1].crossingTime);
        }
        else {
            //flight in incomingFlights area are ready to continue.
            currentFlight.isReady = true;
            currentFlight.currentLeg = 0;
            //critical flight are put at the front.
            if (currentFlight.isCritical) {
                Data.landingProcess[0].flights.unshift(currentFlight);
            }
            else {
                Data.landingProcess[0].flights.push(currentFlight);
            }
            //console.log(`${currentFlight.name} arrival entered incoming`);
        }
        log.create(currentFlight.name, currentFlight.isDeparture, `Entered ${Data.landingProcess[currentFlight.currentLeg].number}`);
    }

    //add flight to the departure process:
    registerDepartureFlight(currentFlight) {
        if ((!Data.departureProcess[departureLeg6].flights[0] || !Data.departureProcess[departureLeg7].flights[0]) &&
            !Data.departureProcess[0].flights[0]) {
            if (Data.departureProcess[departureLeg6].flights.length < Data.departureProcess[departureLeg6].capacity) {
                currentFlight.currentLeg = 1;
                Data.departureProcess[departureLeg6].flights.push(currentFlight);
                this.completeLeg(currentFlight, Data.departureProcess[departureLeg6].crossingTime);
                console.log(`${currentFlight.name} departure entered leg 6`);
            }
            else if (Data.departureProcess[departureLeg7].flights.length < Data.departureProcess[departureLeg7].capacity) {
                currentFlight.currentLeg = 2;
                Data.departureProcess[departureLeg7].flights.push(currentFlight);
                this.completeLeg(currentFlight, Data.departureProcess[departureLeg7].crossingTime);
                console.log(`${currentFlight.name} departure entered leg 7`);
            }
        }
        else {
            currentFlight.currentLeg = 0;
            currentFlight.isReady = true;
            Data.departureProcess[0].flights.push(currentFlight);
            console.log(`${currentFlight.name} departure entered hangar`);
        }
        log.create(currentFlight.name, currentFlight.isDeparture, `Entered ${Data.departureProcess[currentFlight.currentLeg].number}`);
    }
}

module.exports = new Logic();

