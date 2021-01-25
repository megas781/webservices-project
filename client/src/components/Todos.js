import React, {useContext, useState, useEffect} from 'react';
import {CredentialsContext} from "../App";

export default function Todos() {
    const [todos, setTodos] = useState([]);
    const [todoText, setTodoText] = useState('');
    const [credentials] = useContext(CredentialsContext)

    const handleErrors = (response) => {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }

    const addTodo = () => {
        const newTodo = {id: todos.length, text: todoText, checked: true}
        const newTodos = [...todos, newTodo];
        setTodos(newTodos);
        persist(newTodos);
        setTodoText('');
    }

    const changeHandler = (e) => {
        setTodoText(e.target.value);
    }

    const toggleTodo = (id) => {
        const newTodos = todos.map((item) => {
            if (item.id === id) {
                item.checked = !item.checked;
            }
            return item;
        });

        setTodos(newTodos);
        persist(newTodos);
    }

    const removeTodo = (id) => {
        const newTodos = todos.filter((item) => item.id !== id);
        setTodos(newTodos);
        persist(newTodos);
    }

    const persist = (todos) => {
        fetch(`http://localhost:4000/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${credentials.username}:${credentials.password}`
            },
            body: JSON.stringify(todos)
        })
            .then(handleErrors)
            .then(() => {
            })
            .catch((e) => console.log(e));
    }

    useEffect(() => {

        fetch(`http://localhost:4000/todos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${credentials.username}:${credentials.password}`
            },
        })
            .then(function (response) {
                console.log(response)
                return response.json()
            })
            .then(function (data) {
                console.log('here am i!');
                console.log(data)

                if (data == null) {
                    return null
                } else {
                    return setTodos(data.todos)
                }
            });
    }, [])

    return (

        <div className="container">

            <div className="row">
                <div className="input-field col s9">
                    <input
                        onChange={changeHandler}
                        value={todoText}
                        placeholder="Добавь чё-ньть"
                        id="first_name"
                        type="text"
                        className="validate"/>
                </div>
                <div className="input-field col s3">
                    <div
                        onClick={addTodo}
                        disabled={!todoText.length}
                        className="waves-effect waves-light btn orange">Добавить вагончик!
                    </div>
                </div>
            </div>

            {todos.map((todo) => (
                <div className="row" key={todo.id}>
                    <div className={`card blue lighten-1 ${todo.checked ? 'card--active' : 'card--disabled'}`}>
                        <div className="card-content white-text">
                            <span className="card-title">{todo.text}</span>
                        </div>
                        <div className="card-action">
                            <a
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleTodo(todo.id)
                                }}
                                href="/#"
                                className="card-action-text white-text">{todo.checked ? 'Завершить!' : 'Завершенный вагончик('}</a>

                            <a
                                onClick={(e) => {
                                    e.preventDefault();
                                    removeTodo(todo.id)
                                }}
                                href="/#"
                                className="card-action-text white-text">Удалить!
                            </a>
                        </div>
                    </div>
                </div>
            ))}


        </div>
    )
}
