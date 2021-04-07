import express from "express";
import fs from "fs";

const app = express();
//@ts-ignore
const port:number = process.env.PORT || 8080
//@ts-ignore
const persistent:boolean = process.env.PERSISTENT || false

let mainStorage:object[] = []

if (persistent) {
    try {
        const rawJson = fs.readFileSync("save.jsont");
        const parsedJson:object[] = JSON.parse(rawJson.toString())
        parsedJson.forEach(object => {
        mainStorage.push(object)
        })
    } catch {}
}
app.use(express.json())

app.get("/", (req, res) => {
    res.status(200)
    res.send({
        status: 200,
        message: "ThanosDB is up and online!"
    })
})

.post("/key/:keyName", (req, res) => {
    let { keyName } = req.params;
    let { value } = req.body
    console.log(req.body.value)
    if (value === undefined) {
        res.status(400);
        return res.json({
            status: 400,
            message: "No value specified"
        })
    }
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
        return res.status(200).json({
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

.delete("/key/:keyName", (req, res) => {
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
        return res.status(200).json({
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
    return res.status(200).json({
        status: 200,
        numberOfKeys,
        keys
    })
})

.delete("/drop", (req, res) => {
    mainStorage = []
    res.status(200).json({
        status: 200,
        message: "Values dropped"
    })
})

.get("/dump", (req, res) => {
    res.status(200).json({
        status: 200,
        dump: mainStorage
    })
})

app.listen(port, () => {
    console.log(`[Server]: Listening on ${port}`)
})

if (persistent) {
    function saveToFile() {
        fs.writeFileSync("save.jsont", JSON.stringify(mainStorage))
    }
    
    process.on("SIGINT", () => {
        saveToFile()
    })
    
    process.on("beforeExit", () => {
        saveToFile()
    })
    
    setInterval(saveToFile, 5000)
}

if (process.env.NODE_ENV !== "production") {
    async function checkMainStorage() {
        console.log(mainStorage)
        console.log(mainStorage.length)
    }
    setInterval(checkMainStorage, 1000)
}