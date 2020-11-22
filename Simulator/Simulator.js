const url = "http://localhost:5000/flight"

const flightNumbers = ["113", "456", "6780", "3456", "7569", "111", "777", "345", "435", "999", "223", "678", "2345"];
const flightBrands = ["XM", "EL", "AR", "KL", "TG", "FF", "ER", "ZZ", "GH", "TY", "LZ", "LT", "PO", "TQ", "GY", "GQ"];

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function createFlight() {
    const number = flightNumbers[getRndInteger(0, flightNumbers.length)];
    const brand = flightBrands[getRndInteger(0, flightBrands.length)];
    const isDeparture = getRndInteger(0, 2) == 1;
    let isCritical;
    if (!isDeparture) {
        // isCritical = getRndInteger(0, 10) == 0;
    }
    else {
        isCritical = false;
    }
    return { brand, number, isCritical, isDeparture };
}

setInterval(async () => {
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createFlight())
    });
}, 2000);


