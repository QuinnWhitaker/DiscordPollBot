'use strict';

// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();

// The id of the channel where active votes will be posted.
// const voteChannelId = '677690362029932594'; // Main channel - comment out when testing
const voteChannelId = '685413820096577573'; // Test channel - comment out when deploying

// The id of the Member role, the role that voters must have to participate in the vote.
const memberID = '677562715799027713';

// Declare the prefix command for voting
const voteCommand = '!vote1 ';

// What does it say next to someone's name when they haven't voted?
const noVote = 'No Vote';

// Declare the list of all thumbs up and thumbs down votes
const yesNoVotes = {
	':thumbsup:': 			'Yay',
	':thumbsup_tone1:': 	'Yay',
	':thumbsup_tone2:': 	'Yay',
	':thumbsup_tone3:': 	'Yay',
	':thumbsup_tone4:': 	'Yay',
	':thumbsup_tone5:': 	'Yay',
	':thumbsdown:': 		'Nay',
	':thumbsdown_tone1:': 	'Nay',
	':thumbsdown_tone2:': 	'Nay',
	':thumbsdown_tone3:': 	'Nay',
	':thumbsdown_tone4:': 	'Nay',
	':thumbsdown_tone5:': 	'Nay'
};


// When the bot is ready 
client.on('ready', () => {
	
  console.log('I am ready!');
  
});

function formatPollString(vote_title, issued_by, vote_status, multiple_choice, possible_votes, vote_dictionary) {
	// This function takes in all the relevant information of a poll and generates a string for the message content to be updated as
	
	var poll = 	'==== **" ' + vote_title 	+ ' **" ====\n\n**Issued By:** ' 	+ issued_by + '\n\n' 
	poll +=		'**== Options ==** \n'
	poll += '*(React to this message with one of the following emojis.)*\n\n'
	
	if (multiple_choice) {
		
	} else {
		
		poll += ':thumbsup: : Yay\n\n'
		poll += ':thumbsdown: : Nay\n\n'
		
		
		poll += '**== Current Votes ==** \n'
		
		for (var member in vote_dictionary) {
			
			poll += member.toString() + ' : ' + vote_dictionary[member] + '\n';
			
		}
	}
	
	poll += 	'\n**Status: ' 	+ vote_status 	+ '**\n\n'
	
	return poll;
}

function updatePoll(message) {
	// This function updates a poll by performing the following actions
		// 1) Takes the poll as a message argument
		// 2) Identifies the JSON associated with the poll and confirms its existence
		// 3) Confirms that the message still exists
		// 4) Checks who has currently reacted to the message and uses this information to balance the votes
		// 5) Uses the new information to update the JSON file as well as the text of the message
		// 6) Closes the poll if it is concluded, sending a message to the records channel
	
	// Find the JSON file associated with the message_id
	const fs = require('fs')

	const path = '.\\votes\\' + message.id + '.json'

	try {
		
		// If the JSON exists
		if (fs.existsSync(path)) {
			
			// Import the JSON file
			let rawdata = fs.readFileSync(path);
			let this_poll = JSON.parse(rawdata);
			
			// Get the pool of possible reactions from the JSON file
			const possible_reactions = this_poll.possibleVotes;
			
			// Declare dictionary variable, to eventually replace that in the JSON
			var newVoteDictionary = {};
			
			// For each user with the Member class
			message.guild.roles.resolve(memberID).members.forEach(function (guildMember) {
				
				const user = guildMember.user;
				
				var userReacted = false;
				
				// See if that user has reacted to this message with a reaction from the possible votes (For now, assume NO)
				
				// For each messageReaction in the ReactionManager of this message
				/*
				message.reactions.cache.forEach(function (messageReaction) {
					// If the list of possibleReactions includes the name of the emoji of this messageReaction
						// If this user exists within the users cache of this MessageReaction
							// Return true
					
				});
				*/
					
				
				// If they have reacted to the poll
				if (userReacted) {
					// ! - Warning: The reaction collector should handle duplicate reactions. This block assumes that
					// each user has at most one reaction from among the possible votes
					
					// Update newVoteDictionary with key = [that user] to value = [that reaction]
				} else {
					// update newVoteDictionary with key = [that user] to value = noVote
					newVoteDictionary[user] = noVote;
				}
			});
				
				
			// Determine whether the vote needs to be closed.
			// If the vote is NOT multipleChoice
				// Count the number of thumbs up symbols (of all types) as well as thumbs down symbols in the newVoteDictionary
			// Otherwise count the number of each unique reaction in the poll (from the pool of possible reactions)
			// If all votes of one type exceed the other by more than 50%, OR every possible voter has voted, close the poll by setting the newVoteStatus
			
			// Update the JSON file with the newVoteDictionary and newVoteStatus

			this_poll.voteDictionary = newVoteDictionary;
			
			var json = JSON.stringify(this_poll);

			try {
				
				fs.writeFileSync(path, json);
				
			} catch (err) {
				
				console.error(err)
			
			}
			
			// Update the poll message content with the new information
			
			try {
				
				message.edit(formatPollString(this_poll.voteTitle, this_poll.issuedBy, this_poll.voteStatus, this_poll.multipleChoice, this_poll.possibleVotes, this_poll.voteDictionary));
				
			} catch (err) {
				
				console.error(err)
			
			}
		}
		
	// If the JSON doesn't exist
	} catch(err) {
		
		console.error(err)
		
	}
}

function addCollector(message) {
	// This function takes a poll and adds a collector to await reactions from users
	
	// Find the JSON file associated with the message_id
	const fs = require('fs')

	const path = '.\\votes\\' + message.id + '.json'
	
	try {
		
		// If the JSON exists
		if (fs.existsSync(path)) {
			
			// Import the JSON file
			let rawdata = fs.readFileSync(path);
			let this_poll = JSON.parse(rawdata);
			
			// Get the pool of possible reactions from the JSON file
			const possible_reactions = this_poll.possibleVotes;
			
			// Whenever a user reacts to the message
			const filter = (reaction, user) => {
				
				// If the user is not a bot and the reaction is included in the list of approved reactions, the filter will approve of the reaction.
				if ((!user.bot) && (possible_reactions.includes(reaction.emoji.name))) {
					
					return true;
					
				} else return false;
				
			}
			
			// Create a reaction collector variable with the above filter.
			const collector = resultingMessage.createReactionCollector(filter);
			
			// Whenever the collector receives an approved reaction
			collector.on('collect', (reaction, user) => {
				
				console.log('reaction.emoji.name: ', reaction.emoji.name);
				
				// Remove all other reactions from that user that exist in possibleReactions
				
				// For each messageReaction in the ReactionManager of the message
				message.reactions.cache.forEach(function (messageReaction) {
					
					console.log('messageReaction.emoji.name: ', messageReaction.emoji.name);
					// If the list of possibleReactions includes the name of the emoji of this messageReaction
					
				});
				
				// update the poll
				
				
				

			});
			
		}
		
	// If the JSON doesn't exist
	} catch(err) {
		
		console.error(err)
		
	}
}

// Whenever a user types a message
client.on('message', message => {
	
	// If the message starts with the prefix command
	if (message.content.startsWith(voteCommand)) {
		
		// Get all content of the message beyond the prefix.
		const postPreFix = message.content.replace(voteCommand, '');
		
		// Get the title of the vote (Same as postPreFix until multiple choice has been implemented)
		const voteTitle = postPreFix;
		
		const multipleChoice = false;
		
		// Declare the pool of possible votes.
		var possibleVotes = {}
		
		// If it is multiple choice
		if (multipleChoice) {
			// Grab each possible vote from the postPreFix
		} else {
			// Set the list of possible votes to thumbs up and thumbs down
			possibleVotes = yesNoVotes;
		}
		
		// Get the author of the message
		const issuedBy = message.author.toString();
		
		// Declare the status of the vote as ACTIVE
		var voteStatus = 'ACTIVE';
		
		var voteDictionary = {};
		
		// Attempt to send the sendString message to the active vote channel 
		let promisedMessage = client.channels.resolve(voteChannelId).send(voteTitle);
			
		promisedMessage.then(

			resultingMessage => {
				// If the message successfully sent
				
				// Declare the ID of the new message
				const messageID = resultingMessage.id;
				
				console.log("Poll created. Message ID: ", messageID);
				
				// Declare the class that will be converted to a JSON object
				function JsonMessage() {
					
					this.pollId = messageID;
					
					this.multipleChoice = multipleChoice;
					
					this.possibleVotes = possibleVotes;
					
					this.voteTitle = voteTitle;
					
					this.issuedBy = issuedBy;
					
					this.voteStatus = voteStatus;
					
					this.voteDictionary = voteDictionary;
					
				}
				
				// Create a local JSON file documenting the poll and its contents

				var data = new JsonMessage();
				
				var json = JSON.stringify(data);
				
				var path = '.\\votes\\' + messageID + '.json'
				
				const fs = require('fs');

				try {
					
					fs.writeFileSync(path, json);
					
				} catch (err) {
					
					console.error(err)
				
				}
				
				// Update the poll with the current vote status.
				updatePoll(resultingMessage);
				
				// Add the Collector for this message (future runs of the program will instead add the collector on ready)
				addCollector(resultingMessage)
				
			}, rejectionReason => {
				// If the message failed to send
				
				console.log("Failed to create poll in active votes channel. Reason: ", rejectionReason);
			}
		);
		
	
		

		
	}
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('Njg1MzUxMTk3MDcwMDY1Njc1.XmIGIA.sgbayqZK1UY1A3KbBi5FJB3zwj4');

