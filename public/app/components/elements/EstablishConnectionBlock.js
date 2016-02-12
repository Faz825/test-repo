//establishConnectionBlock
import React from 'react'
import EstablishConnectionButton from './EstablishConnectionButton'


const EstablishConnectionBlock = ({connection,onConnectionSelect})=>{


    let _full_name = connection.first_name +" "+connection.last_name;
    let _image_name= (connection.imgLink)?connection.imgLink:"/images/secretary-pic.png"
    return (
        <div className={"row row-clr pgs-establish-connection-box "}>
            <div className="row">
                <div className="col-xs-2 pgs-establish-pro-pic">
                    <img src={_image_name} alt={_full_name} className="img-responsive"/>
                </div>
                <div className="col-xs-6 pgs-establish-pro-detail">
                    <h3>{_full_name}</h3>
                    <p>{connection.country}</p>
                </div>
                <EstablishConnectionButton size="4" classes="pgs-establish-pro-button" value="Connect" click={(isConnected) => onConnectionSelect(connection,isConnected)} />
            </div>
        </div>
    );
}

export default EstablishConnectionBlock;