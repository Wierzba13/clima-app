import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../styles/InfoBox.css";

const InforBox = ({text, icon}) => {
    return (
        <div className="infoBox">
            <FontAwesomeIcon icon={icon}/>
            <p>
                {text}
            </p>
        </div> 
    );
}

export default InforBox;