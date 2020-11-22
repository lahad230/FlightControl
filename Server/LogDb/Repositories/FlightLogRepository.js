const db = require("../DB.js")

const logRepository = {
    create(flight, isDeparture, content){
        db.run(`INSERT INTO LogEntries(Flight, isDeparture, Content, Timestamp) VALUES (?,?,?,datetime('now', 'localtime'))`, [flight, isDeparture, content],
        (err) =>{
            if(err){
                console.log(err);
            }
        })
    }
}
module.exports = logRepository;

