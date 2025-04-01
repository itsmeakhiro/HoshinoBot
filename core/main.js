require("dotenv").config();

const path = require("path");
const fs = require("fs-extra");
const express = require("express");
const EventEmitter = require("events")

const app = express();
const bot = new EventEmitter();

global.bot = bot;

(global.Hoshino = {
    get config() {
        try{
            JSON.parse(
                fs.readFileSync(path.join(__dirname, "..", "settings.json"), "utf-8")
            )
        } catch (err) {
            // @ts-ignore
            console.log("Unexpected error: Cannot read file 'settings.json', ensure that this file exists.");
            return {}
        }
    },
    set config(config) {
       const data = global.Hoshino.config;
       const finalData = { ...data, ...config };
       const str = JSON.stringify(finalData, null, 2);
       fs.writeFileSync(path.join(__dirname, "..", "settings.json"), str);
    },
    commands: new Map,
    events: new Map,
    replies: new Map,
    reacts: new Map,
    cooldown: new Map,
});
 Object.assign(global.Hoshino, {
    get prefix() {
        return global.Hoshino.config.prefix;
    },
    get maintenance() {
        return global.Hoshino.config.maintenance;
    },
    get developer() {
        return global.Hoshino.config.developer;
    },
    get moderator() {
        return global.Hoshino.config.moderator;
    },
    get admin() {
        return global.Hoshino.config.admin;
    }
 });

 async function start() {
    app.listen("8080");

    const console = require("./UI/console");
    await console();
 }

 start()