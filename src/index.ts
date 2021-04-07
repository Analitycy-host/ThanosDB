import nexpress from "nanoexpress";

const app = nexpress();
//@ts-ignore
const port:number = process.env.PORT || 8080

let mainStorage:object[] = []

app.get("/", (req, res) => {
    res.status(200)
    res.send({
        status: 200,
        message: "ThanosDB is up and online!"
    })
})

.post("/key/:keyName", (req, res) => {
    //@ts-ignore
    let { keyName } = req.params;
    let bodyUnParsed = req.body
    try {
        //@ts-ignore
        var body = JSON.parse(bodyUnParsed)
    } catch {
        res.status(400);
        return res.json({
            status: 400,
            message: "Value is not JSON string"
        })
    }
    //@ts-ignore
    if (!body || !body.value) {
        res.status(400);
        return res.json({
            status: 400,
            message: "No value specified"
        })
    }
    //@ts-ignore
    let { value } = body
    const isAlreadyDeclared = mainStorage.findIndex((array:any) => array.keyName === keyName)
    if (isAlreadyDeclared > -1) {
        mainStorage[isAlreadyDeclared] = {
            keyName,
            value
        }
    } else {
        mainStorage.push({
            keyName,
            value
        })
    }
    res.status(201)
    return res.json({
        status: 201,
        message: `Key ${keyName} with value ${value} added`
    })
})

.get("/key/:keyName", (req, res) => {
    //@ts-ignore
    let { keyName } = req.params;
    let isAlreadyDeclared = mainStorage.findIndex((array:any) => array.keyName == keyName)
    if (isAlreadyDeclared > -1) {
        res.status(200)
        return res.json({
            status: 200,
            key: mainStorage[isAlreadyDeclared]
        })
    }
    res.status(404)
    return res.json({
        status: 404,
        message: `Key ${keyName} does not exist`
    })
})

.del("/key/:keyName", (req, res) => {
    //@ts-ignore
    let { keyName } = req.params;
    const isAlreadyDeclared = mainStorage.findIndex((array:any) => array.keyName == keyName)
    if (isAlreadyDeclared > -1) {
        mainStorage.splice(isAlreadyDeclared, 1)
        res.status(200)
        return res.json({
            status: 200,
            message: `Key ${keyName} deleted`
        })
    }
    res.status(404)
    return res.json({
        status: 404,
        message: `Key ${keyName} does not exist`
    })
})

.get("/keys", (req, res) => {
    let numberOfKeys = mainStorage.length
    if (numberOfKeys === 0) {
        res.status(200)
        return res.json({
            status: 200,
            numberOfKeys,
            keys: []
        })
    }
    let keys:[] = []
    mainStorage.forEach(key => {
        //@ts-ignore
        keys.push(key.keyName)
    })
    res.status(200)
    return res.json({
        status: 200,
        numberOfKeys,
        keys
    })
})

app.listen(port, "0.0.0.0")

if (process.env.NODE_ENV !== "production") {
    async function checkMainStorage() {
        console.log(mainStorage)
        console.log(mainStorage.length)
    }
    
    setInterval(checkMainStorage, 1000)
}