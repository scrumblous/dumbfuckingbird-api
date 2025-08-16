const { WebSocketServer, WebSocket } = require("ws");
const port = 1212;
const wss = new WebSocketServer({ port: port });
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { setInterval } = require("timers");
const sql = require("mysql2")
const { db_password, username } = require('./routes/secrets.json')

const clients = new Map();
const times = new Map();

const char_limit = 300;
const username_limit = 50;

function cooldown_passed(id, cooldown_time) {
  // cooldown in milliseconds. Checks by uuid
  let now = Date.now();
  let last_time = times.get(id) || 0;
  if (now - last_time > cooldown_time) {
    return true;
  } else {
    return false;
  }
}

function censor_message(string, ip){
  let slur_regexes = [
    /\bn[\W_]*[i1!|][\W_]*g[\W_]*g[\W_]*[e3][\W_]*r\b/i,                                // hard r
    /\bf[\W_]*[a@4][\W_]*[gq][\W_]*[gq][\W_]*[o0]*[\W_]*[t+]\b/i,                       // f slur
    /\bt[\W_]*[r][\W_]*[a@][\W_]*[nñ][\W_]*[nñ]*[\W_]*[y+]\b/i,                         // t slur
    /\br[\W_]*[e3][\W_]*[t+][\W_]*[a@][\W_]*[r][\W_]*[d]+(?:[\W_]*[e3][\W_]*[d])?\b/i,  // r slur
    /1488/i,
  ];
  for (let regex of slur_regexes) {
    if (regex.test(string)){
      return `i love men and my ip address is: ${ip}`
    }
  }
  return string
}

function censor_username(name, ip){
let slur_regexes = [
    /\bn[\W_]*[i1!|][\W_]*g[\W_]*g[\W_]*[eе3][\W_]*r\b/i,                                // hard r
    /\bf[\W_]*[a@4][\W_]*[gq][\W_]*[gq][\W_]*[o0]*[\W_]*[t+]\b/i,                       // f slur
    /\bt[\W_]*[r][\W_]*[a@][\W_]*[nñ][\W_]*[nñ]*[\W_]*[y+]\b/i,                         // t slur
    /\br[\W_]*[e3][\W_]*[t+][\W_]*[a@][\W_]*[r][\W_]*[d]+(?:[\W_]*[e3][\W_]*[d])?\b/i,  // r slur
    /1488/i,
  ];

  for (let regex of slur_regexes){
    if (regex.test(name)){
      return ip
    }
  }
  return name
}

function send_connections_amount() {
  let ids = []
  let users = []
  clients.forEach((ws, id) => {
    ids.push(id)
    users.push(ws[1])
  })
  clients.forEach((ws, id) => {
    ws[0].send(
      JSON.stringify({
        type: "CONNECTIONS_AMOUNT",
        total_clients: clients.size,
        all_ids: ids,
        all_users: users
      }),
    );
  });
}

function send_to_all_clients(type, message){
    clients.forEach((ws, id) => {
        ws[0].send(
            JSON.stringify({
                type: type,
                message: message
            })
        )
    })
}

async function save_message(user_id, user_name, message_text, user_ip){
  let connection
  try {
    connection = await sql.createConnection({
      host: '62.60.247.163',
      user: username,
      password: db_password,
      database: "my_experiments"
    })
    let query = 'INSERT INTO messages (sender_username, sender_id, message_content, timestamp, ip) VALUES (?, ?, ?, NOW(), ?)'
    await connection.execute(query, [user_name, user_id, message_text, user_ip])
  } catch (err) {
    console.error("sql error:", err)
    throw err
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

wss.on("connection", (ws, req) => {
  ws.local_cooldown = 300
  ws.local_cooldown_errors = 0;
  ws.ip_address = req.socket.remoteAddress;
  if (req.headers["x-forwarded-for"]) {
    ws.ip_address = req.headers["x-forwarded-for"].split(",")[0].trim();
  }
  ws.isAlive = true;
  client_id = uuidv4();
  ws.client_id = client_id;
  clients.set(client_id, [ws, null]);

  console.log(`client connected with uuid: ${client_id}`);
  console.log(`total clients currently: ${clients.size}`);

  send_connections_amount();

  ws.send(
    JSON.stringify({
      type: "YOUR_ID",
      id: client_id,
    }),
  );

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (message) => {
    let time = Date().split(" ").slice(1, 5).join(" ")
    let received_message = message.toString();

    let parsed_message = JSON.parse(received_message);
    let client_username;
    if (parsed_message.username) {
      parsed_message.username = censor_username(parsed_message.username, ws.ip_address)
      clients.set(ws.client_id, [ws, parsed_message.username]);
      client_username = parsed_message.username;
      ws.username = client_username.slice(0, username_limit);
    }
    cd_passed = cooldown_passed(ws.client_id, ws.local_cooldown);
    times.set(ws.client_id, Date.now());

    if (!cd_passed) {
      ws.local_cooldown_errors++
      ws.send(
        JSON.stringify({
          type: "COOLDOWN_ERROR",
        }),
      );
      console.log("cooldown error for ", ws.client_id);
      if (ws.local_cooldown_errors > 10){
        ws.local_cooldown_errors = 0
        ws.local_cooldown = 3000;
        ws.send(JSON.stringify({
          type: "RATE_LIMITED",
        }))
        console.log(`${ws.client_id} (${ws.ip_address}) rate limited`)
      }
      return;
    }

    console.log(
      `${time}: client with id ${ws.client_id} and ip of ${ws.ip_address} and username "${parsed_message.username}" sent a message with type ${parsed_message.type}: ${parsed_message.message.slice(0, 100)}`,
    );
    send_connections_amount()

    if (parsed_message.type === "PRIVATE") {
      let sender_id = ws.client_id;
      let recipient_id = parsed_message.recepient;
      let message_content = parsed_message.message.slice(0, char_limit);
      let recipient_ws = clients.get(recipient_id)[0];

      if (recipient_ws && recipient_ws.readyState === WebSocket.OPEN) {
        recipient_ws.send(
          JSON.stringify({
            type: "PRIVATE_MESSAGE",
            sender: sender_id,
            message: message_content,
            sender_username: client_username,
          }),
        );
      } else {
        console.log(`recipient ${recipient_id} is not connected`);
      }
    } else if (parsed_message.type === "GLOBAL") {
      let sender_id = ws.client_id;
      let global_message = parsed_message.message.slice(0, char_limit);
      global_message = censor_message(global_message, ws.ip_address)
      if (!global_message){
        return
      }
      clients.forEach((client_ws, id) => {
        if (client_ws[0] !== ws && client_ws[0].readyState === WebSocket.OPEN) {
          client_ws[0].send(
            JSON.stringify({
              type: "GLOBAL_MESSAGE",
              sender: sender_id,
              message: global_message,
              sender_username: client_username,
            }),
          );
        }
      });
      save_message(sender_id, client_username, global_message, ws.ip_address)
    } else {
      console.error("message type error");
    }
  });
  ws.on("close", () => {
    console.log("client disconnected: ", ws.client_id);
    clients.delete(ws.client_id);
    console.log("total number of clients: ", clients.size);
    send_connections_amount();
  });
});

const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log(`Terminating unresponsive client: ${ws.client_id}`);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 10 * 1000);


console.log(`started a websocket server on port: ${port}`);
