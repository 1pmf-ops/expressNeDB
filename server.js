const express = require("express");
const app = express();
const PORT = 3001;

const path = require("path");
const hbs = require('express-handlebars');
const Datastore = require("nedb")

const coll1 = new Datastore({
    filename: 'kolekcja.db',
    autoload: true
})

/* 1
const doc = {
    a: "a",
    b: "b"
};

coll1.insert(doc, function (err, newDoc) {
    console.log("dodano dokument (obiekt):")
    console.log(newDoc)
    console.log("losowe id dokumentu: "+newDoc._id)
});
1 */

/* 2
console.log("PRZED FOR: " + new Date().getMilliseconds())
for (let i = 0; i < 3; i++) {
    let doc = {
        a: "a"+i,
        b: "b"+i
    };
    coll1.insert(doc, function (err, newDoc) {
        console.log("id dokumentu: " + newDoc._id, "DODANO: " + new Date().getMilliseconds())
    });
}
console.log("PO FOR: " + new Date().getMilliseconds())


coll1.findOne({ _id: 'LWctS70Vl8lx7Bqy' }, function (err, doc) {
    console.log("----- obiekt pobrany z bazy: ",doc)
    console.log("----- formatowanie obiektu js na format JSON: ")
    console.log(JSON.stringify(doc, null, 5))
});


coll1.find({ }, function (err, docs) {
    //zwracam dane w postaci JSON
    console.log("----- tablica obiektów pobrana z bazy: \n")
    console.log(docs)
    console.log("----- sformatowany z wcięciami obiekt JSON: \n")
    console.log(JSON.stringify({ "docsy": docs }, null, 5))
});


coll1.find({ a: "a" }, function (err, docs) {    
    console.log(JSON.stringify({ "docsy": docs }, null, 5))
});


coll1.count({}, function (err, count) {
    console.log("dokumentów jest: ",count)
});


coll1.count({ a: "a" }, function (err, count) {
    console.log("dokumentów jest: ",count)
});

coll1.remove({ a:"a2" }, {}, function (err, numRemoved) {
    console.log("usunięto dokumentów: ",numRemoved)
});

coll1.remove({ a:"a" }, { multi: true }, function (err, numRemoved) {
    console.log("usunięto dokumentów: ",numRemoved)
});

coll1.remove({}, { multi: true }, function (err, numRemoved) {
    console.log("usunięto wszystkie dokumenty: ",numRemoved)  
});
2 */

app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({defaultLayout: 'main.hbs', extname: '.hbs',
partialsDir: "views/components", helpers: {
    selected(selId, id) {
        return selId == id
    },
    optSelected(opt, val) {
        return opt==val?"selected":""
    }
}}));
app.set('view engine', 'hbs');

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render('index.hbs')
});

app.get("/list", (req, res) => {
    if(JSON.stringify(req.query) != "{}") {
        coll1.remove(req.query, {}, function (err, numRemoved) {});
    }
    const list = []
    coll1.find({ }, function (err, docs) {
        //console.log(docs)
        for(el of docs) {
            const car = {czarne: "NIE", uszkodzone: "NIE", nowe: "NIE", modyfikowane: "NIE"}
            for (const elements in el) {
                car[elements] = el[elements]
            }
            list.push(car)
        }
        //console.log(list)
        res.render('list.hbs', {list: list, _id: req.query._id})
    });
})

app.get("/add", (req, res) => {
    if(JSON.stringify(req.query) != "{}") {
        const car = {}
        for(el in req.query){
            car[el] = "TAK"
        }
        coll1.insert(car, (err, newDoc) => {
            res.render('add.hbs', newDoc)
        });
    }else{
        res.render('add.hbs')
    } 
})

app.get("/edit", (req, res) => {
    const list = []
    if(req.query.czarne) {
        const car = {}
        for(el in req.query){
            car[el] = req.query[el]
        }
        coll1.update({ _id: req.query._id }, { $set: car }, {}, function (err) {});
    }
    coll1.find({ }, function (err, docs) {
        //console.log(docs)
        for(el of docs) {
            const car = {czarne: "NIE", uszkodzone: "NIE", nowe: "NIE", modyfikowane: "NIE"}
            for (const elements in el) {
                car[elements] = el[elements]
            }
            list.push(car)
        }
        //console.log(list)
        res.render('edit.hbs', {list: list, editable: req.query._id&&!req.query.czarne?req.query._id:""})
    });
})

app.get("/updateAction", (req, res) => {
    res.redirect('/edit')
})

app.get('/cancel', (req, res) => {
    res.redirect('/edit')
})

app.get('*', (req, res) => {
    res.redirect('/')
})

app.listen(PORT, () => {
    console.log("start na " + PORT);
});