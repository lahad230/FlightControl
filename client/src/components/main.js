import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import LegList from './legList';
import { Link } from 'react-router-dom';
const url = "http://localhost:5000";

const Main = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [data, setData] = useState(null);

    useEffect(() => {
        const socket = socketIOClient(url);
        socket.on('update', data => {
            setData(data);
            setIsLoaded(true);
        });
        return () => socket.disconnect();
    }, []);

    if (!isLoaded) {
        return (
            <div>
                Loading...
                <Link to="/log">Log</Link>
            </div>
        )
    }
    else {
        return (
            <div>
                <h1>Airport Legs:</h1>
                <div>
                    <LegList name="Leg1" list={data.landingProcess[1].flights} />
                    <LegList name="Leg2" list={data.landingProcess[2].flights} />
                    <LegList name="Leg3" list={data.landingProcess[3].flights} />
                </div>
                <div>
                    <LegList name="Leg4" list={data.landingProcess[4].flights} />
                </div>
                <div>
                    <LegList name="Leg5" list={data.landingProcess[5].flights} />
                    <LegList name="Leg8" list={data.departureProcess[3].flights} />
                </div>
                <div>
                    <LegList name="Leg6" list={data.departureProcess[1].flights} />
                    <LegList name="Leg7" list={data.departureProcess[2].flights} />
                </div>
                <Link to="/log">Log</Link>
            </div>
        )
    }
}

export default Main;