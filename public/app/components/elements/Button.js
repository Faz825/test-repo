//Button
import React from 'react';

const Button = (props)=>{
    let size = "button col-xs-" + props.size;
    return(
        <div className={size}>
            <input type={props.type} className={props.classes} value={props.value} />
        </div>
    )
}
export default Button;