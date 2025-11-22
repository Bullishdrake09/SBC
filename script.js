// XP data for each slayer type and tier
const slayerData = {
    revenant: {
        name: "Revenant Horror",
        tiers: [5, 25, 100, 500, 1500]
    },
    tarantula: {
        name: "Tarantula Broodfather",
        tiers: [5, 25, 100, 500, 3500]
    },
    sven: {
        name: "Sven Packmaster",
        tiers: [5, 25, 100, 500, 1500]
    },
    voidgloom: {
        name: "Voidgloom Seraph",
        tiers: [5, 25, 100, 500]
    }
};

// Total XP needed for each level
const levelXpRequirements = {
    0: 0,
    1: 5,
    2: 30,
    3: 155,
    4: 780,
    5: 3905,
    6: 19530,
    7: 97655,
    8: 488280,
    9: 2441405
};

// Voidgloom carry prices
const voidgloomPrices = {
    3: 800000,
    4: 1500000
};

const quotes = [
    "Lightning fast carries, zero hassle! ⚡",
    "Professional carriers, premium service! 🎯",
    "Get your runs done reliably! 💪",
    "Expert team, best prices! 🏆",
    "Trusted by the Skyblock community! 🤝"
];

let currentQuote = 0;

// Quote rotation
function rotateQuote() {
    const quoteEl = document.getElementById('quote');
    currentQuote = (currentQuote + 1) % quotes.length;
    
    quoteEl.style.animation = 'none';
    void quoteEl.offsetWidth;
    quoteEl.textContent = quotes[currentQuote];
    quoteEl.style.animation = 'quoteSlideIn 0.6s ease-out, quoteSlideOut 0.6s ease-out 4.4s forwards';
}

setInterval(rotateQuote, 5000);

// Navigation
function navigateTo(page) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.page);
    });
});

// Calculator functions
function getTotalXpNeeded(currentLevel, targetLevel) {
    return levelXpRequirements[targetLevel] - levelXpRequirements[currentLevel];
}

function getCheapestCarryMethod(slayerType, xpNeeded) {
    const slayer = slayerData[slayerType];
    const tierXpRewards = slayer.tiers;
    
    let bestMethod = [];
    let bestCost = Infinity;
    
    // Try all combinations of tiers
    function findBestCombination(remainingXp, currentMethod) {
        if (remainingXp <= 0) {
            const cost = calculateCost(currentMethod);
            if (cost < bestCost) {
                bestCost = cost;
                bestMethod = [...currentMethod];
            }
            return;
        }
        
        // Try each tier starting from highest
        for (let i = tierXpRewards.length - 1; i >= 0; i--) {
            if (tierXpRewards[i] <= remainingXp) {
                currentMethod.push(i + 1);
                findBestCombination(remainingXp - tierXpRewards[i], currentMethod);
                currentMethod.pop();
            }
        }
    }
    
    findBestCombination(xpNeeded, []);
    
    return bestMethod;
}

function calculateCost(method) {
    // For voidgloom carries, use the provided prices
    // T4 carries give the best XP per cost
    let cost = 0;
    for (let tier of method) {
        if (tier <= 4) {
            cost += voidgloomPrices[3] || 800000; // Use T3 price for T1-T3
        } else {
            cost += voidgloomPrices[4] || 1500000; // T4 price
        }
    }
    return cost;
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toString();
}

function calculateCheapest() {
    const slayerType = document.getElementById('slayer-type').value;
    const currentLevel = parseInt(document.getElementById('current-level').value);
    const targetLevel = parseInt(document.getElementById('target-level').value);
    
    if (currentLevel >= targetLevel) {
        alert('Target level must be higher than current level!');
        return;
    }
    
    const totalXpNeeded = getTotalXpNeeded(currentLevel, targetLevel);
    
    if (totalXpNeeded <= 0) {
        alert('Invalid level range!');
        return;
    }
    
    const bestMethod = getCheapestCarryMethod(slayerType, totalXpNeeded);
    
    if (bestMethod.length === 0) {
        alert('No viable carry combination found!');
        return;
    }
    
    // Count tier occurrences
    const tierCounts = {};
    for (let tier of bestMethod) {
        tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    }
    
    // Calculate total cost
    let totalCost = 0;
    let breakdown = [];
    
    for (let tier in tierCounts) {
        const count = tierCounts[tier];
        const tierPrice = tier <= 3 ? 800000 : 1500000;
        const tierCost = count * tierPrice;
        totalCost += tierCost;
        breakdown.push(`T${tier}: ${count}x (${formatNumber(tierCost)})`);
    }
    
    const resultsDiv = document.getElementById('calc-results');
    document.getElementById('xp-needed').textContent = `XP Needed: ${formatNumber(totalXpNeeded)}`;
    document.getElementById('cost-info').textContent = `Total Cost: ${formatNumber(totalCost)}`;
    document.getElementById('carry-breakdown').textContent = `Breakdown: ${breakdown.join(' + ')}`;
    
    resultsDiv.style.display = 'block';
}

// Allow Enter key to calculate
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('#slayer-type, #current-level, #target-level');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateCheapest();
            }
        });
    });
});
