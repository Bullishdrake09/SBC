// XP rewards per tier (single kill)
const xpPerKill = {
    revenant: [5, 25, 100, 500, 1500],
    tarantula: [5, 25, 100, 500, 3500],
    sven: [5, 25, 100, 500, 1500],
    voidgloom: [5, 25, 100, 500]
};

// Cumulative XP needed to reach each level from level 0
const cumulativeXpPerLevel = [
    0,        // Level 0
    5,        // Level 1: 0 + 5
    30,       // Level 2: 5 + 25
    155,      // Level 3: 30 + 125
    780,      // Level 4: 155 + 625
    3905,     // Level 5: 780 + 3125
    19530,    // Level 6: 3905 + 15625
    97655,    // Level 7: 19530 + 78125
    488280,   // Level 8: 97655 + 390625
    2441405   // Level 9: 488280 + 1953125
];

// Carry prices in coins
const CARRY_PRICE_T3 = 800000;
const CARRY_PRICE_T4 = 1500000;

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
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toString();
}

function getXpNeeded(currentLevel, targetLevel) {
    // Validate inputs
    if (currentLevel < 0 || currentLevel > 9 || targetLevel < 0 || targetLevel > 9) {
        return null;
    }
    if (currentLevel >= targetLevel) {
        return null;
    }
    
    const currentXp = cumulativeXpPerLevel[currentLevel];
    const targetXp = cumulativeXpPerLevel[targetLevel];
    
    return targetXp - currentXp;
}

function calculateCarries(slayerType, xpNeeded) {
    if (!xpPerKill[slayerType]) {
        return null;
    }
    
    const xpRewards = xpPerKill[slayerType];
    const carries = [];
    let remainingXp = xpNeeded;
    
    // Start from highest tier and work down
    for (let tierIndex = xpRewards.length - 1; tierIndex >= 0 && remainingXp > 0; tierIndex--) {
        const xpPerRun = xpRewards[tierIndex];
        const numRuns = Math.floor(remainingXp / xpPerRun);
        
        if (numRuns > 0) {
            carries.push({
                tier: tierIndex + 1,
                count: numRuns,
                xpGained: numRuns * xpPerRun
            });
            remainingXp -= numRuns * xpPerRun;
        }
    }
    
    // Handle any remaining XP with tier 1 if needed
    if (remainingXp > 0 && xpRewards[0] > 0) {
        carries.push({
            tier: 1,
            count: 1,
            xpGained: xpRewards[0]
        });
    }
    
    return carries;
}

function calculateTotalCost(carries) {
    let totalCost = 0;
    
    for (let carry of carries) {
        let pricePerRun;
        if (carry.tier <= 3) {
            pricePerRun = CARRY_PRICE_T3;
        } else {
            pricePerRun = CARRY_PRICE_T4;
        }
        totalCost += carry.count * pricePerRun;
    }
    
    return totalCost;
}

function calculateCheapest() {
    const slayerType = document.getElementById('slayer-type').value;
    const currentLevel = parseInt(document.getElementById('current-level').value);
    const targetLevel = parseInt(document.getElementById('target-level').value);
    const resultsDiv = document.getElementById('calc-results');
    
    // Validate levels
    if (currentLevel >= targetLevel) {
        document.getElementById('xp-needed').textContent = 'Error: Target level must be higher than current level!';
        document.getElementById('cost-info').textContent = '';
        document.getElementById('carry-breakdown').textContent = '';
        resultsDiv.style.display = 'block';
        return;
    }
    
    // Calculate XP needed
    const xpNeeded = getXpNeeded(currentLevel, targetLevel);
    
    if (xpNeeded === null || xpNeeded <= 0) {
        document.getElementById('xp-needed').textContent = 'Error: Invalid level range!';
        document.getElementById('cost-info').textContent = '';
        document.getElementById('carry-breakdown').textContent = '';
        resultsDiv.style.display = 'block';
        return;
    }
    
    // Calculate optimal carries
    const carries = calculateCarries(slayerType, xpNeeded);
    
    if (!carries || carries.length === 0) {
        document.getElementById('xp-needed').textContent = 'Error: Could not calculate carries!';
        document.getElementById('cost-info').textContent = '';
        document.getElementById('carry-breakdown').textContent = '';
        resultsDiv.style.display = 'block';
        return;
    }
    
    // Calculate total cost
    const totalCost = calculateTotalCost(carries);
    
    // Build breakdown string
    let breakdownStr = '';
    for (let i = 0; i < carries.length; i++) {
        const carry = carries[i];
        const price = carry.tier <= 3 ? CARRY_PRICE_T3 : CARRY_PRICE_T4;
        const subtotal = carry.count * price;
        
        if (i > 0) breakdownStr += ' + ';
        breakdownStr += `T${carry.tier}: ${carry.count}x (${formatNumber(subtotal)})`;
    }
    
    // Display results
    document.getElementById('xp-needed').textContent = `XP Needed: ${formatNumber(xpNeeded)}`;
    document.getElementById('cost-info').textContent = `Total Cost: ${formatNumber(totalCost)}`;
    document.getElementById('carry-breakdown').textContent = `Breakdown: ${breakdownStr}`;
    
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
