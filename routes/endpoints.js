const express = require("express");
const router = express.Router();

router.get("/custom", async (req, res) => {
  //Returns all custom labelled data
  custom
    .find()
    .then((result) => res.send(result))
    .catch((err) => console.log(err));
  console.log(`[ENDPOINT] GET ALL CUSTOM DATA`);
});

router.get("/userdata/version=:ver", async (req, res) => {
  //Returns all custom labelled data
  user_data
    .find({ version: req.params.ver })
    .then((result) => res.send(result))
    .catch((err) => console.log(err));
  console.log(`[ENDPOINT] USER DATA WITH VERSION: ${req.params.ver} REQUESTED`);
});

router.get("/custom/version=:ver", async (req, res) => {
  //Returns all custom labelled data
  custom
    .find({ version: req.params.ver })
    .then((result) => res.send(result))
    .catch((err) => console.log(err));
  console.log(`[ENDPOINT] CUSTOM DATA WITH VERSION: ${req.params.ver} REQUESTED`);
});

router.get("/custom/label=:var", async (req, res) => {
  //Returns all custom labelled data
  custom
    .find({ label: req.params.var })
    .then((result) => res.send(result))
    .catch((err) => console.log(err));
  console.log(`[ENDPOINT] CUSTOM DATA WITH LABEL: ${req.params.var} REQUESTED`);
});

router.get("/userdata", async (req, res) => {
  //Returns all user data
  user_data
    .find()
    .then((result) => res.send(result))
    .catch((err) => console.log(err));
  console.log("[ENDPOINT] GET ALL USER DATA");
});

router.get("/status", async (req, res) => {
  res.send("im online");
  console.log("[ENDPOINT] GET STATUS");
});

module.exports = router;
