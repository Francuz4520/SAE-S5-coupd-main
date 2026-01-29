import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./BirthDatePicker.css"
import { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
registerLocale('fr', fr);
export default function BirthDatePicker({value, onChange}) {
    return (
    <DatePicker 
        selected={value} 
        onChange={(value) => onChange(value)} 
        locale="fr" 
        dateFormat="dd/MM/yyyy"
        className="birthdate-input"
        />
    )
}
