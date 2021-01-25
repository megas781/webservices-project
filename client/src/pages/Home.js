import React, {useContext} from 'react';
import {Link} from 'react-router-dom';

import { CredentialsContext } from '../App';
import Todos from '../components/Todos';

export default function Home(){
    const [credentials, setCredentials] = useContext(CredentialsContext);


    return (
        <div>
            <h1>Паровозик Ту-Ду!</h1>
            <h3>{credentials && credentials.username}</h3>
            <div className="row">
            {!credentials && <Link to="/register"  style={{'marginRight': 18}}className="btn green">Зарегаться</Link>}
            {!credentials && <Link to="/login" className="btn green darken-2">Войти</Link>}
            </div>
            {credentials && <Todos />}
        </div>
        )
}
