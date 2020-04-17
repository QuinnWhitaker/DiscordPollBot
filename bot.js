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

// Global variables for each thumbs up and thumbs down emoji
const thumbsup = '👍'
const thumbsup_tone1 = '👍' + '🏻'
const thumbsup_tone2 = '👍' + '🏼'
const thumbsup_tone3 = '👍' + '🏽'
const thumbsup_tone4 = '👍' + '🏾'
const thumbsup_tone5 = '👍' + '🏿'

const thumbsdown = '👎'
const thumbsdown_tone1 = '👎' + '🏻'
const thumbsdown_tone2 = '👎' + '🏼'
const thumbsdown_tone3 = '👎' + '🏽'
const thumbsdown_tone4 = '👎' + '🏾'
const thumbsdown_tone5 = '👎' + '🏿'

// Text for Yes No Votes
const yesVote = 'Yes';
const noVote = 'No';

// What does it say next to someone's name when they haven't voted?
const undecidedVote = 'No Vote';

// Text for vote statuses
const voteActive = '```diff + ACTIVE ```';
const voteClosed = '```diff - CLOSED ```';

// Function to determine whether a given map (or Collection) contains a given value
const findInMap = (map, val) => {
	
	for (let [k, v] of map) {
		if (v === val) { 
			return true; 
		}
	}  
	return false;
}


// When the bot is ready 
client.on('ready', () => {
	
  console.log('I am ready!');
  
});

function formatPollString(vote_title, issued_by, vote_status, multiple_choice, possible_reactions, vote_dictionary) {
	// This function takes in all the relevant information of a poll and generates a string for the message content to be updated as
	
	var poll = 	'==== **" ' + vote_title 	+ ' **" ====\n\n**Issued By:** ' 	+ issued_by + '\n\n' 
	poll +=		'**== Options ==** \n'
	poll += '*(React to this message with one of the following emojis.)*\n\n'
	
	if (multiple_choice) {
		
	} else {
		
		poll += ':thumbsup: : ' + yesVote + '\n\n'
		poll += ':thumbsdown: : ' + noVote + '\n\n'
		
		
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
			const possible_reactions = this_poll.possibleReactions;
			
			// Declare dictionary variable, to eventually replace that in the JSON
			var newVoteDictionary = {};
			
			// For each user with the Member class
			message.guild.roles.resolve(memberID).members.forEach(function (guildMember) {
				
				const user = guildMember.user;
				
				var userReacted = false;
				var theirReaction = null;
				
				// See if that user has reacted to this message with a reaction from the possible reactions
				
				// For each reaction in the message
				message.reactions.cache.forEach(function (iterated_reaction) {
					
					// If it is a valid reaction
					if (iterated_reaction.emoji.toString() in possible_reactions) {

						// And if the current user exists within that reaction's user list
						if (findInMap(iterated_reaction.users.cache, user)) {
							
							// We know the user reacted. Save the reaction to a variable.
							userReacted = true;
							theirReaction = iterated_reaction.emoji.toString();
						}

					}
					
				});

				// If they have reacted to the poll with a valid reaction
				if (userReacted) {
					
					// ! - Warning: The reaction collector should handle duplicate reactions. This block assumes that
					// each user has at most one reaction from among the possible reactions
					
					// Update newVoteDictionary with key = [that user] to value = [the saved reaction]
					newVoteDictionary[user] = theirReaction;
					
				} else {
					
					// update newVoteDictionary with key = [that user] to value = undecidedVote
					newVoteDictionary[user] = undecidedVote;
					
				}
			});
				
				
			// Determine whether the vote needs to be closed.
			
			// The tally dictionary will get filled with all the votes from each user, not discriminating from emoji skin tone.
			var tally = {};
			
			// For each reaction among the possible reactions
			for (var pr_vote in possible_reactions) {
				
				// Declare the text associated with this reaction
				const pr_text = possible_reactions[pr_vote];
				
				// If the tally hasn't begin counting the number of users that chose this vote
				if (tally[pr_text] == null) {
					 
					// Start the count at 0
					tally[pr_text] = 0;
					 
				}
			}
			
			// For each user that can vote
			for (var user in newVoteDictionary) {
				
				// Declare whether they have voted and what they voted for.
				const their_vote = newVoteDictionary[user];
				const their_text = possible_reactions[their_vote];
				
				// If their vote has been declared
				if (their_text != null) {
					
					// If the tally hasn't began counting the number of users that chose this vote
					if (tally[their_text] == null) {
						 
						 // Start the count at 1
						 tally[their_text] = 1;
						 
					} else {
						// If the tally already begun counting the number of users that chose this vote
						 
						// Increase that number by 1 
						tally[their_text]++;
						 
					}
					 
				}
			}
			
			function closeVote(result) {

			}
			
			console.log('tally: ', tally);
			console.log('5/2=', 5/2);

			const totalVoters = Object.keys(newVoteDictionary).length;
			
			for (var talliedVote in tally) {
				
			}
			
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
				
				message.edit(formatPollString(this_poll.voteTitle, this_poll.issuedBy, this_poll.voteStatus, this_poll.multipleChoice, this_poll.possibleReactions, this_poll.voteDictionary));
				
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
	// When users react, it deletes all other valid reactions from that user, then updates the poll
	
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
			const possible_reactions = this_poll.possibleReactions;
			
			
			// Whenever a user reacts to the message
			const filter = (reaction, user) => {
				
				console.log('Using filter...');
				console.log('reaction.emoji.toString(): ', reaction.emoji.toString());

				// If the user is not a bot, the filter will approve of the reaction.
				if (!user.bot) {
					
					return true;
					
				} else return false;
				
			}
			
			// Create a reaction collector variable with the above filter.
			const collector = message.createReactionCollector(filter);
			
			// Whenever the collector receives an approved reaction
			collector.on('collect', (reaction, user) => {
				
				console.log('On collect called');
				
				console.log('reaction.emoji.toString() in possible_reactions ? ', (reaction.emoji.toString() in possible_reactions));
				
				// If that reaction is a valid reaction for this poll
				
				if (reaction.emoji.toString() in possible_reactions) {
					
					// Remove all other valid reactions from that user
					
					// Whether all other reactions were deleted if they existed.
					// If they were not deleted successfully, we should NOT update the poll.
					var deletedSuccessfully  = true;
					
					// For each reaction in the message
					message.reactions.cache.forEach(function (iterated_reaction) {
						
						console.log('iterated_reaction.emoji.toString(): ', iterated_reaction.emoji.toString());
						
						// If it is a valid reaction AND it is not the current reaction
						if (iterated_reaction.emoji.toString() in possible_reactions && iterated_reaction != reaction) {
							
							// Remove that reaction
							console.log('Deleting this reaction');
							
							
							try {
								
								iterated_reaction.users.remove(user);
								
							} 	catch(err) {
		
								console.error(err);
								deletedSuccessfully =  false;
		
							}
							
						}
						
						
					});
					
					if (deletedSuccessfully) {
						
						// Update the poll
						updatePoll(message);
						
					}	

				}
					
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
		
		// Declare the pool of possible reactions.
		var possibleReactions = {};
		
		// If it is multiple choice
		if (multipleChoice) {
			// Grab each possible vote from the postPreFix
		} else {
			// Set the list of possible Reactions to thumbs up and thumbs down
			
			possibleReactions[thumbsup] = yesVote;
			possibleReactions[thumbsup_tone1] = yesVote;
			possibleReactions[thumbsup_tone2] = yesVote;
			possibleReactions[thumbsup_tone3] = yesVote;
			possibleReactions[thumbsup_tone4] = yesVote;
			possibleReactions[thumbsup_tone5] = yesVote;
			possibleReactions[thumbsdown] = noVote;
			possibleReactions[thumbsdown_tone1] = noVote;
			possibleReactions[thumbsdown_tone2] = noVote;
			possibleReactions[thumbsdown_tone3] = noVote;
			possibleReactions[thumbsdown_tone4] = noVote;
			possibleReactions[thumbsdown_tone5] = noVote;

		}
	
		
		// Get the author of the message
		const issuedBy = message.author.toString();
		
		// Declare the status of the vote as ACTIVE
		var voteStatus = voteActive;
		
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
					
					this.possibleReactions = possibleReactions;
					
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
				addCollector(resultingMessage);
				
			}, rejectionReason => {
				// If the message failed to send
				
				console.log("Failed to create poll in active votes channel. Reason: ", rejectionReason);
			}
		);
		
	
		

		
	}
});

client.on('messageReactionRemove', (reaction, user) => {
	updatePoll(reaction.message);
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('Njg1MzUxMTk3MDcwMDY1Njc1.XmIGIA.sgbayqZK1UY1A3KbBi5FJB3zwj4');

