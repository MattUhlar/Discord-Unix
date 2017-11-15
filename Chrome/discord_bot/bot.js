'use strict';

let Discrord = require('discord.io');
let logger = require('winston');
let auth = require('./auth.json');
let app = require('http').createServer()
let io = require('socket.io')(app);

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {colorize: true});
logger.level = 'debug';

app.listen(8000);
io.on('connection', function (socket) {
	logger.info('Socket Connected');

	socket.on('history_response', (history) => {
		console.log(history)
		console.log(history.request_data)
		history.data.sort((a, b) => a.lastVisitTime > b.lastVisitTime);
	});

	let bot = new Discrord.Client({
		token: auth.token,
		autorun: true
	});

	const START_CMD_PREFIX = '>_';
	const BANG_CMD_PREFIX = '!';

	let curr_results = []

	function valid_cmd_prefix(cmd) {
		return cmd.substring(0, START_CMD_PREFIX.length) == START_CMD_PREFIX ||
			   cmd.substring(0, BANG_CMD_PREFIX.length) == BANG_CMD_PREFIX;
	}

	function get_cmd_prefix(cmd) {
		if (cmd.substring(0, START_CMD_PREFIX.length) == START_CMD_PREFIX) {
			return START_CMD_PREFIX;
		}
		return BANG_CMD_PREFIX;
	}

	function tokenize(cmd) {
		let tokens = cmd.substring(START_CMD_PREFIX.length, cmd.length).split(' ')
		return tokens.filter(token => token).map(token => token.toLowerCase())
	}

	function send_message(msg, channel_id) {
		bot.sendMessage({to: channel_id, message: msg});
	}

	function valid_cmd(tokens, err) {
		return true;
	}

	function format_response(response) {	
		return response.reduce((acc, res) => {
			acc += res.index + 1;
			acc += '.\t' + res.title + '\n';
			return acc;
		}, '');
	}

	function execute_cmd(cmd_tokens, channel_id) {
		let request_data = {
			tokens: cmd_tokens,
			channel: channel_id
		};
		socket.emit('history', {data: request_data});
	}

	function handle_start_cmd(msg, channel_id) {
		let err = {msg: ''};
		let tokens = tokenize(msg);
		valid_cmd(tokens, err) ? execute_cmd(tokens, channel_id) : send_message(err.msg, channel_id);
	}

	function handle_bang_cmd(msg, channel_id) {
		let target_cmd = parseInt(msg.substring(1, msg.length));
		let url = curr_results[target_cmd - 1].url
		send_message(url, channel_id)
	}

	bot.on('message', (user, user_id, channel_id, msg, evnt) => {
		if (valid_cmd_prefix(msg)) {
			switch (get_cmd_prefix(msg)) {
				case START_CMD_PREFIX:
					handle_start_cmd(msg, channel_id);
					break;
				case BANG_CMD_PREFIX:
					handle_bang_cmd(msg, channel_id);
					break;
			}
		}
	});

	bot.on('ready', (e) => {
		logger.info('Connected');
		logger.info('Logged in as: ');
		logger.info(bot.username + ' -(' + bot.id + ')');
	});
});
