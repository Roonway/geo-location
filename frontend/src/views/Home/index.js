import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import crypto from 'crypto';
import id from 'uuid/v4';
import L from 'leaflet';

import './styles.css';
import LogoImg from '../../asset/logo.svg';

const redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});  

const goldIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});  

const myId = id();
const socket = io('http://localhost:3333');
socket.on('connect', () => console.log('[CLIENT] A New connection established with server'));

export default function Home() {
    //estados
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState([]);
    const [myPopUp, setMyPopUp] = useState(null);
    const [popUp, setPopUp] = useState(null);
    const [state, setState] = useState(navigator.geolocation.getCurrentPosition( e => {
        setState([e.coords.latitude, e.coords.longitude])
    }));


    useEffect(() => {
        const handleNewCoordinates = newAddress => {
            if(coordinates.length == 0){
                setCoordinates([...coordinates, newAddress]);
            } else {
                var repeat = false;

                coordinates.forEach((item) => {
                    if(item.extra.googlePlaceId == newAddress.extra.googlePlaceId && newAddress.id == myId){
                        repeat = true;
                    }
                });

                if(repeat){
                    alert("Você já setou esse Endereço, tente outro");
                } else {
                    setCoordinates([...coordinates, newAddress]);
                }
            }
        }
        socket.on('geocoding.address', handleNewCoordinates)
        return () => socket.off('geocoding.address', handleNewCoordinates)
    }, [coordinates]);

    function handleSubmit(event){
        event.preventDefault();

        // Para o if uma string vazia é falso
        if(address.trim()){
            socket.emit('geocoding.address', {
                id: myId,
                address
            })
            setAddress('');
        }
    }

    return (
        <div className="container">
            <div className="content">
                <section>
                    <img src={LogoImg} alt="GeoLocation" />
                </section>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Digite o Endereço" 
                        onChange={event => setAddress(event.target.value)}
                        value={address} 
                    />
                    <button className="button" type="submit">Enviar</button>            
                </form>
                
                <div>
                    <Map center={state} zoom={8} className="map-container" enableHighAccuracy={true}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                            <Marker 
                                key={myId}
                                position ={state}
                                onclick={() => {
                                    setMyPopUp(state);
                                }}
                            />

                        {myPopUp && (
                            <Popup 
                                position={state}
                                onClose={() => setMyPopUp(null)}
                            >
                            <div>
                                <h3>Você está Aqui</h3>
                            </div>
                            </Popup>
                        )}

                            
                        {coordinates.map((coordinate, index) => (
                            <Marker 
                                key={crypto.randomBytes(index).toString('HEX')}
                                position ={[ 
                                    coordinate.latitude,
                                    coordinate.longitude,
                                ]}
                                icon={coordinate.id == myId ? goldIcon : redIcon}
                                onclick={() => {
                                    setPopUp(coordinate);
                                }}
                            />
                        ))}
                        
                        {popUp && (
                            <Popup 
                                position={[
                                    popUp.latitude,
                                    popUp.longitude
                                ]}
                                onClose={() => setPopUp(null)}
                            >
                            <div>
                                <h4>Endereço</h4>
                                <p>
                                    {popUp.formattedAddress}
                                </p>
                            </div>
                            </Popup>
                        )}

                    </Map>
                </div>
            </div>
        </div>
    );
}