const express = require('express');
const cors = require('cors');
const app = express();
const port = 4000;
const mongoose = require('mongoose');
const config = require('./config.json')

//коннектимся к базе данных
mongoose.connect(config.db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
    console.log('к базе подсоединен!');
})
    .catch((e) => {
        console.log('ошибка!', e);
    });

//объектная модель пользователя
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

//инициализируем модель пользователя
const User = mongoose.model('User', userSchema);

//объектная модель туду
const todosSchema = new mongoose.Schema({
    userId: mongoose.Schema.ObjectId,
    todos: [
        {
            checked: Boolean,
            text: String,
            id: String,
        },
    ],
});
//инициализируем модель пользователя
const Todos = mongoose.model("Todos", todosSchema);

//разрешаем обмен данными с другими url
app.use(cors());
app.use(express.json());

//индикатор работы сервера
app.get("/", (req, res) => {
    res.send('Сервер бодрствует');
})

//обработка регистрации
app.post("/register", async (req, res) => {
    //достаем данные о пользователе
    const { username, password } = req.body;
    //Достаем модель пользователя из БД
    const user = await User.findOne({username});

    //проверка, существует ли пользователь
    if (user) {
        res.status(500);
        res.json({
            message: "User already exist",
        })
        return;
    }

    //всё хорошо, создаем пользователя
    await User.create({username, password});
    res.json({
        message: "успех!",
    });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({username});

    //проверка, существует ли пользователь, и правильный ли пароль
    if (!user || user.password !== password) {
        res.status(401);
        res.json({
            message: "ошибка входа!",
        })
        return;
    }

    res.json({
        message: "успех!",
    });
});

//Метод для обновления списка Ту-Ду'сов
app.post("/todos", async (req, res) => {

    //Парсим строку по ключу authorization и достаём из неё username и password

    const { authorization } = req.headers;
    const [,token] = authorization.split(' ');
    const [username, password] = token.split(':');
    //достаем обновленный список туду'сов (как для добавления, так и для удаления)
    const todosItems = req.body;

    //проверяем, залогинен ли пользователь, чтобы изменять список туду'сов
    const user = await User.findOne({username});
    if (!user || user.password !== password) {
        res.status(403);
        res.json({
            message: "нет доступа!",
        })
        return;
    }

    //запрашиваем
    const todos = await Todos.findOne({ userId: user._id }).exec();
    //если список еще не создан, то создаем, иначе обновляем
    if (!todos) {
        await Todos.create({
            userId: user._id,
            todos: todosItems,
        });
    } else {
        todos.todos = todosItems;
        await todos.save();
    }
    //отправляем json-response с обновлённим списком
    res.json(todosItems);
})


app.get("/todos", async (req, res) => {
    // console.log(req)
    // console.log(req.headers)
    const { authorization } = req.headers;
    const [,token] = authorization.split(' ');
    const [username, password] = token.split(':');

    // console.log(token)
    // console.log(username)
    // console.log(password)

    const user = await User.findOne({username});
    //проверяем, залогинен ли пользователь
    if (!user || user.password !== password) {
        res.status(403);
        res.json({
            message: "нет доступа",
        })
        return;
    }

    // console.log('am here')

    //Если пользователь есть, то достаем его туду'сы
    const todos = await Todos.findOne({ userId: user._id }).exec();

    console.log(todos)

    //Возвращаем туду'сы
    res.json(todos);
})


//Подключение к БД
const db = mongoose.connection;
//вывод логов при ошибках
db.on('error', console.error.bind(console, 'connection error:'));

//сообщение при запуске
db.once('open', function() {
    // we're connected!
    app.listen(port, () => {
        console.log(`Сервер работает здесь: http://localhost:${port}`);
    })
});

