const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.DirectMessages] });

const voteChannelId = '1230543664229384249'; // Identifiant du salon des votes
const scoreChannelId = '1230543681686212709'; // Identifiant du salon des scores

client.once('ready', () => {
  console.log('Le bot est prêt !');
});

client.on('messageCreate', async message => {
    if (message.channel.id === voteChannelId) {
        const usernameRegex = /([^\d]+)(?:\d+)?\s+vient de voter pour le serveur !/;
        const matchVote = message.content.match(usernameRegex);
        const username = matchVote ? matchVote[1] : null;

        if (username) {
            const test2Channel = await client.channels.fetch(scoreChannelId);
            const messages = await test2Channel.messages.fetch({ limit: 1 });
            const scoreMessage = messages.first();

            let newContent = '';
            if (scoreMessage) {
                const currentContent = scoreMessage.content;
                const scoreEntries = currentContent.split('\n').map(line => line.split(':'));
                let updated = false;
                for (const [pseudo, score] of scoreEntries) {
                    if (pseudo.trim() === username) {
                        const newScore = parseInt(score.trim()) + 100;
                        newContent += `${pseudo.trim()} : ${newScore}\n`;
                        updated = true;
                    } else {
                        newContent += `${pseudo.trim()} : ${score.trim()}\n`;
                    }
                }
                if (!updated) {
                    newContent += `${username} : 100\n`;
                }
            } else {
                newContent = `${username} : 100\n`;
            }

            if (scoreMessage) {
                await scoreMessage.delete();
            }

            await test2Channel.send(newContent);
        } else if (message.content.endsWith('Delet')) {
            const targetUsername = message.content.slice(0, -'Delet'.length).trim();

            const test2Channel = await client.channels.fetch(scoreChannelId);
            const messages = await test2Channel.messages.fetch({ limit: 1 });
            const scoreMessage = messages.first();

            if (scoreMessage) {
                let newContent = '';
                const currentContent = scoreMessage.content;
                const scoreEntries = currentContent.split('\n').map(line => line.split(':'));
                for (const [pseudo, score] of scoreEntries) {
                    if (pseudo.trim() !== targetUsername) {
                        newContent += `${pseudo.trim()} : ${score.trim()}\n`;
                    }
                }

                if (newContent !== currentContent) {
                    await scoreMessage.delete();
                    await test2Channel.send(newContent);
                    await message.delete();
                }
            }
        } else {
            const addFormatRegex = /([^\d]+)(?:\d+)?\+\d+/;
            const removeFormatRegex = /([^\d]+)(?:\d+)?-\d+/;
            const matchAdd = message.content.match(addFormatRegex);
            const matchRemove = message.content.match(removeFormatRegex);

            if (matchAdd || matchRemove) {
                if (matchAdd) {
                    const [pseudo, pointsStr] = matchAdd[0].split('+');
                    const points = parseInt(pointsStr);
                    
                    if (isNaN(points)) {
                        console.log("Nombre de points invalide.");
                        return;
                    }
                    
                    const test2Channel = await client.channels.fetch(scoreChannelId);
                    const messages = await test2Channel.messages.fetch({ limit: 1 });
                    const scoreMessage = messages.first();

                    let newContent = '';
                    if (scoreMessage) {
                        const currentContent = scoreMessage.content;
                        const scoreEntries = currentContent.split('\n').map(line => line.split(':'));
                        for (const [pseudoScore, score] of scoreEntries) {
                            if (pseudoScore.trim() === pseudo) {
                                const newScore = parseInt(score.trim()) + points;
                                newContent += `${pseudo} : ${newScore}\n`;
                            } else {
                                newContent += `${pseudoScore.trim()} : ${score.trim()}\n`;
                            }
                        }
                    } else {
                        console.log("Aucun message de score trouvé dans le salon des scores.");
                        return;
                    }

                    if (scoreMessage) {
                        await scoreMessage.delete();
                    }

                    await test2Channel.send(newContent);
                    await message.delete();
                } else {
                    const [pseudo, pointsStr] = matchRemove[0].split('-');
                    const points = parseInt(pointsStr);
                    
                    if (isNaN(points)) {
                        console.log("Nombre de points invalide.");
                        return;
                    }
                    
                    const test2Channel = await client.channels.fetch(scoreChannelId);
                    const messages = await test2Channel.messages.fetch({ limit: 1 });
                    const scoreMessage = messages.first();

                    let newContent = '';
                    if (scoreMessage) {
                        const currentContent = scoreMessage.content;
                        const scoreEntries = currentContent.split('\n').map(line => line.split(':'));
                        for (const [pseudoScore, score] of scoreEntries) {
                            if (pseudoScore.trim() === pseudo) {
                                const newScore = parseInt(score.trim()) - points;
                                newContent += `${pseudo} : ${newScore}\n`;
                            } else {
                                newContent += `${pseudoScore.trim()} : ${score.trim()}\n`;
                            }
                        }
                    } else {
                        console.log("Aucun message de score trouvé dans le salon des scores.");
                        return;
                    }

                    if (scoreMessage) {
                        await scoreMessage.delete();
                    }

                    await test2Channel.send(newContent);
                    await message.delete();
                }
            } else {
                console.log("Format incorrect pour ajouter ou retirer des points.");
            }
        }
    }
});

client.login("LA_TOKEN_SECRETE");
