import React from 'react';

const LegList = ({ name, list }) => {
    return (
        <div style={{display: 'inline-block', position: 'relative', margin: '5px'}}>
            {name}
            <div style={{border: '2px solid'}}>
                <ul>
                    {list.map(item => (
                        <li key={item.Id}>
                            {item.name}
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    )
}

export default LegList;