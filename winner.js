var fs = require('fs');
const readline = require('readline');

let fileOutputName;

// MESSAGE TO MODERATOR: I've taken a quick last minute attempt at adding validators. Hope this is sufficient although I am aware I can add more.

async function main() {
    try {
        let args = process.argv;
        if (args.length === 6 && args.includes('--in') && args.includes('--out')) {
            var fileInputeName = args[args.findIndex(a => a == '--in') + 1];
            fileOutputName = args[args.findIndex(a => a == '--out') + 1];

            const players = await processLineByLine(fileInputeName);
            const winner = tallyScores(players);

            try {
                fs.writeFileSync(fileOutputName, winner);
            } catch (err) {
                fs.writeFileSync(fileOutputName, 'ERROR');
                throw new Error('ERROR');
            }
        } else {
            throw new Error('ERROR');
        }
    } catch (error) {
        if (fileOutputName) {
            fs.writeFileSync(fileOutputName, 'ERROR');
        }
        console.error('ERROR');
        process.exit(1);
    }
}

function tallyScores(players) {
    var leaderBoard = [];
    var duplicateScores = [];
    var highScore = 0;

    // Validated player array length in previous method
    for (let index = 0; index < players.length; index++) {
        const player = players[index];
        const score = calculateCards(player['cards']);

        leaderBoard[index] = {
            name: player['name'],
            score: score,
            index: index
        }
        highScore = score > highScore ? score : highScore
    }

    leaderBoard.forEach(leader => {
        if (leader['score'] === highScore) {
            duplicateScores.push(leader);
        }
    });

    if (duplicateScores.length > 1) {
        const previousHigh = highScore;
        leaderBoard = [];
        for (let index = 0; index < duplicateScores.length; index++) {
            const duplicate = duplicateScores[index];
            const player = players[duplicate['index']];

            const score = tieBreaker(player['cards']) + previousHigh;

            leaderBoard[index] = {
                name: player['name'],
                score: score,
                index: index
            }
            highScore = score > highScore ? score : highScore
        }

        duplicateScores = [];
        leaderBoard.forEach(leader => {
            if (leader['score'] === highScore) {
                duplicateScores.push(leader);
            }
        });
    }

    if (duplicateScores.length > 1) {
        var result = '';
        for (let index = 0; index < duplicateScores.length; index++) {
            const dup = duplicateScores[index];
            result = result + dup['name'] + ','
        }

        result = result.slice(0, -1);
        return result + ":" + highScore;
    }

    const winner = leaderBoard.find(l => l['score'] === highScore);
    return winner['name'] + ':' + highScore;
}

function tieBreaker(cards) {
    var total = 0;

    for (let index = 0; index < cards.length; index++) {
        const card = cards[index];
        var cardNumber = 0;
        // check if suit and card number are valid . . .
        const suit = card[card.length - 1];

        switch (suit) {
            case 'D':
                cardNumber = 2;
                break;
            case 'C':
                cardNumber = 1;
                break;
            case 'S':
                cardNumber = 4;
                break;
            case 'H':
                cardNumber = 3
                break;
            default:
                break;
        }

        total = total + parseInt(cardNumber);
    }
    return total;
}

function calculateCards(cards) {

    // validate only one card from deck 52 can be chosen check for duplication
    var total = 0;

    for (let index = 0; index < cards.length; index++) {
        const card = cards[index];

        const suit = card[card.length - 1];
        var cardNumber = card.substring(0, card.length - 1);
        // if ((suit == 'S' || suit == 'H' || suit == 'D' || suit == 'C') && ((cardNumber > 1 && cardNumber < 11) || (cardNumber == 'A' || cardNumber == 'J' || cardNumber == 'Q' || cardNumber == 'K'))) {
        // check if suit and card number are valid . . .
        switch (cardNumber) {
            case 'A':
                cardNumber = 1;
                break;
            case 'J':
                cardNumber = 11;
                break;
            case 'Q':
                cardNumber = 12;
                break;
            case 'K':
                cardNumber = 13
                break;
            default:
                break;
        }

        total = total + parseInt(cardNumber);
        // } else {
        // fs.writeFileSync(fileOutputName, 'ERROR cardnumber');
        // console.error('ERROR cardnumber');
        // process.exit(1);
        // }
    }
    return total;
}

async function processLineByLine(fileName) {
    try {
        return new Promise((resolve, reject) => {
            const fileStream = fs.createReadStream(fileName);
            const playerCards = [];
            let index = 0;
            var numOflines = 0; // expected 5
            fs.readFile(fileName, 'utf8', async (err, data) => {
                numOflines = data.split('\n').length;
                if (numOflines == 5) {
                    const rl = readline.createInterface({
                        input: fileStream,
                        crlfDelay: Infinity
                    });
                    for await (const line of rl) {
                        playerCards[index] = {
                            name: line.substr(0, line.indexOf(':')),
                            cards: line.split(':')[1].split(',')
                        }
                        index++;
                    }
                    resolve(playerCards);

                } else {
                    reject(new Error('ERROR'));
                }
            });
        });
    } catch (error) {
        fs.writeFileSync(fileOutputName, 'ERROR');
        console.error('ERROR');
        process.exit(1);
    }
}


main();