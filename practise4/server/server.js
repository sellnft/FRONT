const express = require("express")
const { nanoid } = require("nanoid")
const cors = require("cors")
const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const app = express()
const port = 3000
const JWT_SECRET = "secret_key"
const TIME_OF_EXPANDING = "15m"

let users = []

let goods = [
{id: nanoid(6), name: 'Тормозные колодки M Performance', category: 'Тормозная система', description: 'Передние, для M3/M4', price: 18990, stock: 15},
{id: nanoid(6), name: 'Масляный фильтр BMW M', category: 'Фильтры', description: 'Оригинал, для S58', price: 2450, stock: 42},
{id: nanoid(6), name: 'Воздушный фильр BMC', category: 'Фильтры', description: 'Спортивный, нулевик', price: 12990, stock: 8},
{id: nanoid(6), name: 'Тормозные диски M', category: 'Тормозная система', description: 'Перфорированные, 380мм', price: 45990, stock: 6},
{id: nanoid(6), name: 'Свечи зажигания NGK', category: 'Двигатель', description: 'Для M550i/M5', price: 6990, stock: 23},
{id: nanoid(6), name: 'Моторное масло Liqui Moly', category: 'Жидкости', description: '10W-60, для М-моторов', price: 11990, stock: 31},
{id: nanoid(6), name: 'Комплект ГРМ', category: 'Двигатель', description: 'Ремень+ролики, M54', price: 15490, stock: 4},
{id: nanoid(6), name: 'Сайлентблоки рычагов', category: 'Подвеска', description: 'Полиуретан, Powerflex', price: 8990, stock: 12},
{id: nanoid(6), name: 'Интеркулер Wagner Tuning', category: 'Турбо', description: 'Для M135/235i', price: 78990, stock: 2},
{id: nanoid(6), name: 'Глушитель Akrapovic', category: 'Выхлоп', description: 'Титан, для M2/M3/M4', price: 349990, stock: 1}
];

async function hashPassword(password) {
    const rounds = 10
    const hashedPassword = await bcrypt.hash(password, rounds)
    return hashedPassword
}

async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword)
}

function findUserOr404(email, res) {
    const user = users.find(u => u.email == email)

    if (!user) {
        res.status(404).json({ error: "User doesn't exist!"})
        return null
    }

    return user
}

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API управления товарами",
            version: "1.0.0",
            description: "Простое API для управления товарами",
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: "Локальный сервер",
            },
        ],
    },
    apis: [__filename],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

/**
 * @swagger
 * components:
 *   schemas:
 *     Good:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Автоматически сгенерированный уникальный ID
 *         name:
 *           type: string
 *           description: Название товара
 *         category:
 *           type: string
 *           description: Категория товара
 *         description:
 *           type: string
 *           description: Краткое описание товара
 *         price:
 *           type: number
 *           format: float
 *           description: Цена товара
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *       example:
 *         id: "#XkQc537"
 *         name: "Тормозные колодки M PERFOMANCE"
 *         category: "Тормозные системы"
 *         description: "Увеличенные тормозные колодки M PERFOMANCE"
 *         price: 220000
 *         stock: 25
 */

app.use(express.json())

app.use((req, res, next) => {
    res.on("finish", () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`)
        if (req.method == "POST" || req.method == "PATCH" || req.method == "PUT") {
            console.log("Body: ", req.body)
        }
    })
    next()
})

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || ""

    const [scheme, token] = header.split(" ")

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Пользователь не авторизован" })
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET)
        req.user = payload
        next()
    } catch(err) {
        return res.status(401).json({ error: "Невалидный токен" })
    }
}

app.post("/api/auth/me", authMiddleware, (req, res) => {
    const userID = req.user.sub
    const user = users.find(u => u.id === userID)

    if (!user) {
        return res.status(404).json({ error: "Пользователя не существует!" })
    }

    res.json({
        id: user.id,
        username: user.username,
    })
})

function findGoodOr404(id, res) {
    const good = goods.find(u => u.id == id)
    if (!good) {
        res.status(404).json({ error: "Good not found"});
        return null
    }
    return good
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     description: Создает нового пользователя с хешированным паролем
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - firstName
 *               - lastName
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: ivan
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ivan@example.com
 *               firstName:
 *                 type: string
 *                 example: Иван
 *               lastName:
 *                 type: string
 *                 example: Иванов
 *               password:
 *                 type: string
 *                 example: qwerty123
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: ab12cd
 *                 username:
 *                   type: string
 *                   example: ivan
 *                 email:
 *                   type: string
 *                   example: ivan@example.com
 *                 firstName:
 *                   type: string
 *                   example: Иван
 *                 lastName:
 *                   type: string
 *                   example: Иванов
 *                 password:
 *                   type: string
 *                   example: $2b$10$kO6Hq7ZKfV4cPzGm8u7mEuR7r4Xx2p9mP0q3t1yZbCq9Lh5a8b1QW
 *       400:
 *         description: Некорректные данные
 */

app.post("/api/auth/register", async(req, res) => {
    const { username, email, firstName, lastName, password } = req.body

    if (!username || !email || !firstName || !lastName || !password) {
        return res.status(400).json({ error: "Not all of required fileds are completed!" })
    }

    const newUser = {
        id: String(users.length + 1),
        username: username,
        email: email,
        firstName: firstName,
        lastName: lastName,
        password: await hashPassword(password)
    }

    users.push(newUser)
    res.status(201).json({
        id: newUser.id,
        username: newUser.username,
    })
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     description: Проверяет логин и пароль пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ivan@example.com
 *               password:
 *                 type: string
 *                 example: qwerty123
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 login:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверные учетные данные
 *       404:
 *         description: Пользователь не найден
 */

app.post("/api/auth/login", async(req, res) => {
    const { email, password } = req.body
    
    if (!email || !password) {
        return res.status(400).json({ error: "Not all of required fileds are completed!" })
    }

    const user = findUserOr404(email, res)

    if (!user) {
        return;
    }

    const check = await verifyPassword(password, user.password)

    if (!check) {
        return res.status(401).json({ error: "Incorrect password!" })
    }

    const accessToken = jwt.sign(
        {
            sub: user.id,
            username: user.id,
        },
        JWT_SECRET,
        {
            expiresIn: TIME_OF_EXPANDING,
        }
    )
    res.json({
        accessToken,
    })
})


/**
 * @swagger
 * /api/goods:
 *   post:
 *     summary: Создает новый товар
 *     tags: [Goods]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - description
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Good"
 *       400:
 *         description: Ошибка в теле запроса
 */
app.post("/api/goods", (req, res) => {
    const { name, category, description, price, stock } = req.body

    const newGood = {
        id: nanoid(6),
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
    }

    goods.push(newGood)
    res.status(201).json(newGood)
})

/**
 * @swagger
 * /api/goods:
 *   get:
 *     summary: Возвращает список всех товаров
 *     tags: [Goods]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Good"
 */
app.get("/api/goods", (req, res) => {
    res.json(goods)
})

/**
 * @swagger
 * /api/goods/{id}:
 *   get:
 *     summary: Получает товар по ID
 *     tags: [Goods]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Good"
 *       404:
 *         description: Товар не найден
 */
app.get("/api/goods/:id", authMiddleware, (req, res) => {
    const id = req.params.id
    const good = findGoodOr404(id, res)
    if (!good) {
        return
    }

    res.json(good)
})

/**
 * @swagger
 * /api/goods/{id}:
 *   patch:
 *     summary: Обновляет данные о товаре
 *     tags: [Goods]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Обновленное инфо о товаре
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Good"
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Товар не найден
 */
app.patch("/api/goods/:id", authMiddleware, (req, res) => {
    const id = req.params.id

    const good = findGoodOr404(id, res)
    if (!good) {
        return
    }

    if (req.body?.name == undefined && req.body?.category == undefined && req.body?.description == undefined && req.body?.price == undefined && req.body?.stock == undefined) {
        return res.status(400).json({
            error: "Nothing to update"
        })
    }

    const { name, category, description, price, stock } = req.body

    if (name !== undefined) good.name = name.trim()
    if (category !== undefined) good.category = category.trim()
    if (description !== undefined) good.description = description.trim()
    if (price !== undefined) good.price = Number(price)
    if (stock !== undefined) good.stock = Number(stock)

    res.json(good)
})

/**
 * @swagger
 * /api/goods/{id}:
 *   delete:
 *     summary: Удаляет товар
 *     tags: [Goods]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар успешно удалён
 *       404:
 *         description: Товар не найден
 */
app.delete("/api/goods/:id", authMiddleware, (req, res) => {
    const id = req.params.id

    const exists = goods.some((u) => u.id == id)
    if (!exists) {
        return res.status(404).json({ error: "Good not found "})
    }

    goods = goods.filter((u) => u.id != id)

    res.status(204).send()
})

app.use((req, res) => {
res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
console.error("Unhandled error:", err);
res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
console.log(`Сервер запущен на http://localhost:${port}`);
});
