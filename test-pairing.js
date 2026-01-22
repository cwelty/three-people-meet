// Test script for pairing algorithm
// Run with: node test-pairing.js

// Mock the Pairing module functions (copy from pairing.js)
const Pairing = {
    getSharedInterests(members) {
        if (members.length < 2) return [];
        const allInterests = members.map(m => m.interests || []);
        const shared = allInterests[0].filter(interest =>
            allInterests.every(memberInterests => memberInterests.includes(interest))
        );
        return shared;
    },

    calculatePairingScore(members, history, currentRound = 1) {
        const memberIds = members.map(m => m.id).sort();

        const pairs = [
            [memberIds[0], memberIds[1]],
            [memberIds[0], memberIds[2]],
            [memberIds[1], memberIds[2]]
        ];

        let pairsMet = 0;
        for (const pair of pairs) {
            const hasMetBefore = history.some(entry =>
                entry.memberSet.includes(pair[0]) && entry.memberSet.includes(pair[1])
            );
            if (hasMetBefore) pairsMet++;
        }

        const newPairs = 3 - pairsMet;
        let score = newPairs * 1000;

        const trioKey = memberIds.join(',');
        const exactTrioMet = history.some(entry =>
            entry.memberSet.sort().join(',') === trioKey
        );
        if (exactTrioMet) {
            score -= 500;
        }

        const shared = Pairing.getSharedInterests(members);
        if (currentRound <= 3 && shared.length > 0) {
            score += 50;
        }

        return score;
    },

    generateTrios(members) {
        const trios = [];
        const n = members.length;
        for (let i = 0; i < n - 2; i++) {
            for (let j = i + 1; j < n - 1; j++) {
                for (let k = j + 1; k < n; k++) {
                    trios.push([members[i], members[j], members[k]]);
                }
            }
        }
        return trios;
    },

    // Simplified generatePairings for testing (no Firebase)
    generatePairings(members, history, currentRound, priorityMemberIds = []) {
        const allTrios = Pairing.generateTrios(members);

        const scoredTrios = allTrios.map(trio => {
            let score = Pairing.calculatePairingScore(trio, history, currentRound);
            const priorityCount = trio.filter(m => priorityMemberIds.includes(m.id)).length;
            score += priorityCount * 100;
            return { members: trio, score };
        }).sort((a, b) => b.score - a.score);

        const selectedPairings = [];
        const usedMembers = new Set();

        for (const trioData of scoredTrios) {
            const memberIds = trioData.members.map(m => m.id);
            const hasOverlap = memberIds.some(id => usedMembers.has(id));

            if (!hasOverlap) {
                selectedPairings.push(trioData);
                memberIds.forEach(id => usedMembers.add(id));
                if (usedMembers.size >= members.length) break;
            }
        }

        return {
            pairings: selectedPairings,
            leftover: members.filter(m => !usedMembers.has(m.id))
        };
    }
};

// Create test members (11 people for the TV reveal scenario)
const testMembers = [
    { id: 'A', name: 'Alice', interests: ['hiking', 'cooking', 'music'] },
    { id: 'B', name: 'Bob', interests: ['hiking', 'gaming', 'movies'] },
    { id: 'C', name: 'Carol', interests: ['cooking', 'reading', 'yoga'] },
    { id: 'D', name: 'Dave', interests: ['gaming', 'music', 'sports'] },
    { id: 'E', name: 'Eve', interests: ['hiking', 'yoga', 'photography'] },
    { id: 'F', name: 'Frank', interests: ['cooking', 'sports', 'movies'] },
    { id: 'G', name: 'Grace', interests: ['reading', 'music', 'art'] },
    { id: 'H', name: 'Henry', interests: ['gaming', 'photography', 'hiking'] },
    { id: 'I', name: 'Ivy', interests: ['yoga', 'art', 'cooking'] },
    { id: 'J', name: 'Jack', interests: ['sports', 'movies', 'music'] },
    { id: 'K', name: 'Kate', interests: ['reading', 'photography', 'hiking'] },
];

// Track all pair meetings
function getAllPairsMet(history) {
    const pairsMet = new Set();
    for (const entry of history) {
        const ids = entry.memberSet.sort();
        pairsMet.add(`${ids[0]}-${ids[1]}`);
        pairsMet.add(`${ids[0]}-${ids[2]}`);
        pairsMet.add(`${ids[1]}-${ids[2]}`);
    }
    return pairsMet;
}

// Calculate total possible pairs
function totalPossiblePairs(n) {
    return (n * (n - 1)) / 2;
}

// Run simulation
console.log('='.repeat(60));
console.log('PAIRING ALGORITHM TEST - 11 Members');
console.log('='.repeat(60));
console.log(`\nTotal possible unique pairs: ${totalPossiblePairs(11)} (11 choose 2)\n`);

let history = [];
let priorityMemberIds = [];

for (let round = 1; round <= 8; round++) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`ROUND ${round}`);
    console.log('─'.repeat(60));

    const result = Pairing.generatePairings(testMembers, history, round, priorityMemberIds);

    // Display pairings
    result.pairings.forEach((p, i) => {
        const names = p.members.map(m => m.name).join(', ');
        const shared = Pairing.getSharedInterests(p.members);
        const memberIds = p.members.map(m => m.id).sort();

        // Check which pairs are new
        const pairs = [
            [memberIds[0], memberIds[1]],
            [memberIds[0], memberIds[2]],
            [memberIds[1], memberIds[2]]
        ];
        const newPairCount = pairs.filter(pair => {
            return !history.some(entry =>
                entry.memberSet.includes(pair[0]) && entry.memberSet.includes(pair[1])
            );
        }).length;

        console.log(`  Trio ${i + 1}: ${names}`);
        console.log(`          Score: ${p.score} | New pairs: ${newPairCount}/3 | Shared: ${shared.length > 0 ? shared.join(', ') : 'none'}`);
    });

    if (result.leftover.length > 0) {
        console.log(`  Leftover: ${result.leftover.map(m => m.name).join(', ')} (prioritized next round)`);
    }

    // Add to history
    for (const p of result.pairings) {
        history.push({
            memberSet: p.members.map(m => m.id).sort(),
            sharedInterests: Pairing.getSharedInterests(p.members),
            round
        });
    }

    // Update priority members
    priorityMemberIds = result.leftover.map(m => m.id);

    // Stats
    const pairsMet = getAllPairsMet(history);
    const coverage = ((pairsMet.size / totalPossiblePairs(11)) * 100).toFixed(1);
    console.log(`\n  Coverage: ${pairsMet.size}/${totalPossiblePairs(11)} pairs have met (${coverage}%)`);
}

console.log(`\n${'='.repeat(60)}`);
console.log('FINAL ANALYSIS');
console.log('='.repeat(60));

const finalPairsMet = getAllPairsMet(history);
console.log(`\nTotal unique pairs that have met: ${finalPairsMet.size}/${totalPossiblePairs(11)}`);

// Find pairs that haven't met
const allMembers = testMembers.map(m => m.id);
const unmetPairs = [];
for (let i = 0; i < allMembers.length; i++) {
    for (let j = i + 1; j < allMembers.length; j++) {
        const pairKey = `${allMembers[i]}-${allMembers[j]}`;
        if (!finalPairsMet.has(pairKey)) {
            const m1 = testMembers.find(m => m.id === allMembers[i]);
            const m2 = testMembers.find(m => m.id === allMembers[j]);
            unmetPairs.push(`${m1.name} & ${m2.name}`);
        }
    }
}

if (unmetPairs.length > 0) {
    console.log(`\nPairs that haven't met yet (${unmetPairs.length}):`);
    unmetPairs.forEach(p => console.log(`  - ${p}`));
} else {
    console.log('\nAll pairs have met!');
}

// Check for repeated trios
const trioCounts = {};
for (const entry of history) {
    const key = entry.memberSet.join(',');
    trioCounts[key] = (trioCounts[key] || 0) + 1;
}
const repeatedTrios = Object.entries(trioCounts).filter(([_, count]) => count > 1);
if (repeatedTrios.length > 0) {
    console.log(`\nRepeated trios:`);
    repeatedTrios.forEach(([trio, count]) => {
        const names = trio.split(',').map(id => testMembers.find(m => m.id === id).name).join(', ');
        console.log(`  - ${names} (${count} times)`);
    });
} else {
    console.log('\nNo repeated trios!');
}
