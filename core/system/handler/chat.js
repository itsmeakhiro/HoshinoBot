const axios = require("axios").default;
const styler = require("../../../Hoshino/resources/styler/styler");
const { MethodContextor } = require("./callable-obj-dist");

const ChatContextor = MethodContextor(
  {
    /**
     * @type {Record<string, any> | null}
     */
    event: null,
    /**
     * @type {HoshinoLia.Command | null}
     */
    command: null,

    styler,
    /**
     * @type {any}
     */
    api: null,
    /**
     * Sends a styled or plain message to the thread.
     * @param {HoshinoLia.MessageForm} message - Message to send
     * @param {string} [goal] - Thread ID (defaults to current thread)
     * @param {boolean} [noStyle=false] - If true, skip styling
     * @returns {Promise<any>} - Message send info or error
     */
    async send(message, goal, noStyle = false) {
      try {
        return await new Promise((res, rej) => {
          this.api.sendMessage(
            noStyle ? message : this.processStyle(message),
            goal || this.event?.threadID,
            (err, info) => {
              if (err) rej(err);
              else res(info);
            }
          );
        });
      } catch (err) {
        throw err;
      }
    },

    /**
     * Replies to a specific message in the thread.
     * @param {HoshinoLia.MessageForm} message - Reply content
     * @param {string} [goal] - Thread ID (defaults to current thread)
     * @param {boolean} [noStyle=false] - If true, skip styling

     * @returns {Promise<any>} - Message reply info or error
     */
    async reply(message, goal, noStyle = false) {
      return new Promise((res, rej) => {
        this.api.sendMessage(
          noStyle ? message : this.processStyle(message),
          goal || this.event?.threadID,
          (err, info) => {
            if (err) rej(err);
            else res(info);
          },
          this.event?.messageID
        );
      });
    },
    /**
     * @param {Object} config
     * @param {any} config.api - The API object for sending messages
     * @param {Record<string, any>} config.event - Contains event details like threadID and messageID
     * @param {HoshinoLia.Command?} [config.command] - Optional command object containing style/font info
     */
    create({ api, event, command }) {
      return ChatContextor({ api, event, command });
    },

    /**
     * Adds style, lmao.
     * @param {HoshinoLia.MessageForm} message - Reply content
     * */
    processStyle(message) {
      if (
        this.command &&
        this.command.style &&
        this.command.font &&
        this.styler
      ) {
        const { type, title, footer } = this.command.style;
        return this.styler(
          type,
          title,
          typeof message === "string" ? message : message.body ?? "",
          footer,
          this.command.font
        );
      }
      return message;
    },

    /**
     * A flexible wrapper for making HTTP requests using Axios, supporting both
     * method shorthands and full Axios config objects.
     *
     * Features:
     * - Supports both `"@method:url"` shorthand and explicit method in config
     * - Automatically assigns params to `params` (GET) or `data` (POST-like)
     * - Catches and formats errors to always return an `Error` object
     *
     * @async
     * @function req
     *
     * @param {string} url - The endpoint URL or a special format like "@METHOD:url"
     *                       (e.g., "@post:/api/user") to define the HTTP method inline.
     *
     * @param {Record<string, any>} [params={}] - Key-value pairs to be sent:
     *        - As query parameters (for GET, DELETE, etc.)
     *        - As request body (for POST, PUT, PATCH)
     *
     * @param {string | import("axios").AxiosRequestConfig} [configOrMethod="GET"] - Either:
     *        - A string representing the HTTP method (e.g., "GET", "POST")
     *        - An AxiosRequestConfig object (preferred for complex setups)
     *
     * @returns {Promise<any>} The response data from the server
     *
     * @throws {Error} If the request fails, throws a formatted error with message
     */

    async req(url, params = {}, configOrMethod = "GET") {
      let finalUrl = url;

      /**
       * @type {import("axios").AxiosRequestConfig}
       */
      let finalConfig =
        typeof configOrMethod !== "string"
          ? configOrMethod
          : { method: String(configOrMethod).toUpperCase() };

      if (finalUrl.startsWith("@")) {
        let [method, ...uurl] = finalUrl.slice(1).split(":");
        finalUrl = uurl.join(":");
        finalConfig.method = String(method).toUpperCase();
      }
      if (finalConfig.method === "POST") {
        finalConfig.data = params;
      } else {
        finalConfig.params = params;
      }

      try {
        const res = await axios(finalUrl, finalConfig);
        return res.data;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
      }
    },
  },
  function ({ api, event, command = null }) {
    this.api = api;
    this.event = event;
    this.command = command;
    this.styler = styler;
  }
);

module.exports = {
  ChatContextor,
};
