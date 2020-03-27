const router = require("express").Router();
const Purchasing = require("../models/purchasing.js");

router.post("/api/purchasing", ({ body }, res) => {
  Purchasing.create(body)
    .then(Purchasing => {
      res.json(Purchasing);
    })
    .catch(err => {
      res.status(400).json(err);
    });
});

router.post("/api/purchasing/bulk", ({ body }, res) => {
  Purchasing.insertMany(body)
    .then(Purchasing => {
      res.json(Purchasing);
    })
    .catch(err => {
      res.status(400).json(err);
    });
});

router.get("/api/purchasing", (req, res) => {
  Purchasing.find({})
    .sort({ date: -1 })
    .then(Purchasing => {
      res.json(Purchasing);
    })
    .catch(err => {
      res.status(400).json(err);
    });
});

module.exports = router;
