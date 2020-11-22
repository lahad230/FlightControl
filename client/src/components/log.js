import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
const url = "http://localhost:5000/log";

const Log = () => {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);

    //get log data from server when component starts:
    useEffect(() => {
        async function fetchData() {
            try {
                let data = await fetch(url);
                let result = await data.json()
                setItems(result);
                setIsLoaded(true);
            }
            catch (err) {
                setError(err);
                setIsLoaded(true);
            }
        }
        fetchData();
    }, [])

    if (error) {
        return (
            <div>
                Error: {error.message}
                <Link to="/">Main</Link>
            </div>
        )
    }
    else if (!isLoaded) {
        return <div>Loading...</div>;
    }
    else {
        return (
            <div>
                <h1>Log</h1>
                <Link to="/">Main</Link>
                <ul>
                    {items.map(item => (
                        <li key={item.Id}>
                            Id:{item.Id} Flight: {item.Flight}  {item.isDeparture ? 'departure' : 'arrival'} {item.Content} {item.Timestamp}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}

export default Log;