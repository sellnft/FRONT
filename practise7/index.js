const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



const app = express();
const PORT = 3000;
const JWT_SECRET = "access_token";
const TIME_OF_EXPIRING = "15m";


app.use(express.json());
app.use((req, res, next) => {
res.on('finish', () => {
console.log(`[${new Date().toISOString()}] [${req.method}] 
${res.statusCode} ${req.path}`);
if (req.method === 'POST' || req.method === 'PUT' || req.method ===
'PATCH') {
console.log('Body:', req.body);
}
});
next();
});

let users = [];

async function hashPassword(password) {
    const rounds = 10;
    const hashedPassword = await bcrypt.hash(password, rounds);
    return hashedPassword;
};

function findUserOr404(username, res) {
    const user = users.find(u => u.username == username)

    if (!user) {
        res.status(404).json({ error: "No users found!" });
        return null;
    };
    return user;
}

async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
};

app.post("/api/auth/register", async(req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Not all of required fields are completed!" });
    };
    

    const user = {
        id: String(users.length + 1),
        username: username,
        password: await hashPassword(password),
    };
    users.push(user)
    res.status(201).json({
        id: user.id,
        username: user.username
    });
});

app.post("/api/auth/login", async(req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Not all of field are completed!" });
    };

    const user = findUserOr404(username);

    if (!user) {
        return res.status(404).json({ error: "User doesn't exist!" });
    };

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
        return res.status(401).json({ error: "Incorrect password!" });
    };

    const newToken = jwt.sign(
        {
            sub: user.id,
            username: user.username,
        },
        JWT_SECRET,
        {
            expiresIn: TIME_OF_EXPIRING,
        }
    );

    res.json({
        newToken,
    });
});

app.listen(PORT, () => {
console.log(`Сервер запущен на http://localhost:${PORT}`);
});

