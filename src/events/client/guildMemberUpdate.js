module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember, client) {
        if (oldMember.nickname !== newMember.nickname) {
            client.sql.connection.query('SELECT * FROM members WHERE discordId = ?', [newMember.id], async (err, rows, results) => {
                if (err) throw err;

                // flagged terms
                let combinedFlags = 0
                const usernameWarnTerms = [
                    'kanye',
                    'hitler',
                    'tate'
                ];
                const altTerms = [
                    'alt',
                    'alt account',
                    'altaccount',
                    'alt-account',
                    'altacc',
                    'alt-acc',
                    'two',
                    'three',
                    'second',
                    'third',
                    '2nd',
                    '3rd',
                    '2nd account',
                    '3rd account',
                    '2nd-account',
                    '3rd-account',
                    '2ndacc',
                    '3rdacc',
                    '2nd-acc',
                    '3rd-acc',
                    '2ndaccount',
                    '3rdaccount',
                ];
                const created = newMember.user.createdTimestamp;
                const joined = newMember.joinedTimestamp;
                if (joined - created < 604800000) { combinedFlags += 1 }
                for (const altTerm of altTerms) {
                    if (newMember.nickname?.toLowerCase().includes(altTerm) || newMember.user.username.toLowerCase().includes(altTerm)) {
                        combinedFlags += 2
                        break;
                    };
                }
                for (const usernameWarnTerm of usernameWarnTerms) {
                    if (newMember.nickname?.toLowerCase().includes(usernameWarnTerm) || newMember.user.username.toLowerCase().includes(usernameWarnTerm)) {
                        combinedFlags += 4
                        break;
                    };
                }
                // Check if the user joined with a suspicious username
                // TODO

                /*
                Flag Values:
                0: none
                1: new
                2: username
                3: new + username
                4: alt
                5: username + alt
                6: new + alt
                7: new + username + alt
                */

                if (!rows[0]) {
                    return client.sql.connection.query('INSERT INTO members (discordId, joinTimestamp flags) VALUES (?, ?, ?)', [newMember.id, Math.floor(newMember.joinedTimestamp / 1000), combinedFlags], (err, rows) => {
                        if (err) throw err;
                    })
                }

                client.sql.connection.query('UPDATE members SET flags = ? WHERE discordId = ?', [combinedFlags, newMember.id], (err, rows) => {
                    if (err) throw err;
                })
            })
        }
    }
}
