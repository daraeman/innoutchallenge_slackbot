const express = require( "express" );
const app = express();
const bodyParser = require( "body-parser" );
const port = process.env.PORT;
require( "dotenv" ).config();
const SlackBot = require( "slackbots" );
const bot = new SlackBot({
	token: process.env.SLACKBOT_TOKEN,
	name: process.env.SLACKBOT_NAME,
});
const max_received_messages = parseInt( process.env.SLACK_MESSAGE_HISTORY );
let received_messages = [];
let params = {
	icon_emoji: ":cat:"
};

app.use( bodyParser.json() );

app.post( "/event", ( request, response ) => {
	if ( request.body ) {
		if ( request.body.challenge ) {
			return response.send( request.body.challenge );
		}
		else if (
			request.body.event
			&& ! isReceived( request.body.event_id )
			&& request.body.event.type === "message"
			&& ! request.body.event.bot_id ) {

				if ( /\!test/.test( request.body.event.text ) ) {
					bot.postMessageToChannel( "testing", "Just replying!.", params );
				}
		}
	}
	
});

app.listen( port, () => {
	console.log( "Listening on port "+ port );
});

bot.on( "start", () => {
	bot.postMessageToChannel( "testing", "Just checking in.", params );
});

bot.on( "error", ( error ) => {
	console.error( "Error", error, error.stack );
});


/*
	Message De-duper
*/
function isReceived( id ) {
	let is_received = received_messages.includes( id );
	if ( ! is_received ) {
		received_messages.push( id );
		if ( received_messages.length > max_received_messages ) {
			received_messages.shift();
		}
		return false;
	}
	else {
		return true;
	}
}