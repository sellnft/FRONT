const express = require("express");
const app = express();
const port = 3000;

let goods = [
    {id: 1, name: "Колбаса", price: 150},
    {id: 2, name: "Сыр", price: 350},
    {id: 3, name: "Молоко", price: 200},
    {id: 4, name: "Батончик Snickers", price: 89},
]

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Main page");
});

app.post("/goods", (req, res) => {
    const { name, price } = req.body;

    // создаем модель товара для записи
    const newGood = { 
        id: Date.now(),
        name,
        price
    };

    goods.push(newGood); // добавляем новый товар
    res.status(201).json(newGood);
});

// просмотр всех товаров
app.get("/goods", (req, res) => {
    res.send(JSON.stringify(goods));
}); 

// просмотр товара по ID
app.get("/goods/:id", (res, req) => {
    let good = goods.find(u => u.id == req.params.id);
    res.send(JSON.stringify(good)); 
});

// редактирование
app.patch("/users/:id", (req, res) => {
    const good = goods.find(u => u.id == req.params.id);
    const { name, price } = req.body;

    good.name = name;
    good.price = price;

    res.json(good);
});

// удаление
app.delete("/users/:id", (req, res) => {
    goods = goods.filter(u => u.id != req.params.id);
    res.send("OK");
})

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
