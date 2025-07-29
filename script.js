// Sephirot data structure positioned exactly like Giorgia Lupi's image
const sephirotStructure = [
    { name: "Keter (crown)", x: 0.5, y: 0.14, color: "#d4c48f" },
    { name: "Hokhmah (wisdom)", x: 0.29, y: 0.19, color: "#d4c48f" },
    { name: "Binah (understanding)", x: 0.71, y: 0.19, color: "#d4c48f" },
    { name: "Hesed (kindness)", x: 0.68, y: 0.30, color: "#d4c48f" },
    { name: "Din (severity)", x: 0.32, y: 0.30, color: "#d4c48f" },
    { name: "Tiferet (beauty)", x: 0.5, y: 0.43, color: "#d4c48f" },
    { name: "Netzah (eternity)", x: 0.68, y: 0.52, color: "#d4c48f" },
    { name: "Hod (splendor)", x: 0.32, y: 0.52, color: "#d4c48f" },
    { name: "Yesod (foundation)", x: 0.5, y: 0.62, color: "#d4c48f" },
    { name: "Malkut (kingdom)", x: 0.5, y: 0.74, color: "#d4c48f" }
];

// Sephirot connections
const sephirotPaths = [
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 1, target: 3 },
    { source: 1, target: 5 },
    { source: 2, target: 4 },
    { source: 2, target: 5 },
    { source: 3, target: 5 },
    { source: 3, target: 6 },
    { source: 4, target: 5 },
    { source: 4, target: 7 },
    { source: 5, target: 6 },
    { source: 5, target: 7 },
    { source: 5, target: 8 },
    { source: 6, target: 8 },
    { source: 7, target: 8 },
    { source: 8, target: 9 }
];

// Map Sephirot names to their array indices
const sephirotNameToIndex = {};
sephirotStructure.forEach((s, i) => {
    // Extract just the name before the parentheses
    const simpleName = s.name.split(' ')[0];
    sephirotNameToIndex[simpleName] = i;
});

// Add mapping for "Gevurah" to "Din" for compatibility with dataset
sephirotNameToIndex["Gevurah"] = sephirotNameToIndex["Din"];

// Create a map of fields to colors - precisely matching Giorgia Lupi's colors
const fieldColors = {
    "Philosophy": "#b5dbb9",   // Soft mint green
    "Literature": "#a4d7d0",   // Soft teal
    "Theology": "#e8daae",     // Soft sand/mustard
    "Poetry": "#d9e8b8",       // Soft yellow-green
    "Religious Texts": "#e8daae", // Soft sand/mustard (same as Theology)
    "History": "#e8daae",      // Soft sand/mustard (same as Theology)
    "Biography": "#f5ccad",    // Soft peach
    "Psychology": "#a4d7d0",   // Soft teal (same as Literature)
    "Theatre": "#d6d2eb",      // Soft lavender
    "Fiction": "#a4d7d0",      // Soft teal (same as Literature)
    "Essay": "#b5dbb9",        // Soft mint green (same as Philosophy)
    "Criticism": "#d6d2eb"     // Soft lavender
};

// Initialize the visualization when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initLegend();
    loadDataAndCreateVisualization();
});

// Initialize the legend to exactly match the image
function initLegend() {
    const legendContent = document.querySelector('.legend-content');
    
    // Field colors legend
    const fieldLegend = document.createElement('div');
    fieldLegend.className = 'legend-section';
    fieldLegend.innerHTML = '<h3>Field</h3>';
    
    // Define fields in the order shown in the image
    const fieldsToShow = [
        { field: "Poetry", color: fieldColors["Poetry"] },
        { field: "Fiction", color: fieldColors["Fiction"] },
        { field: "Essay", color: fieldColors["Essay"] },
        { field: "Philosophy", color: fieldColors["Philosophy"] },
        { field: "Religious Texts", color: fieldColors["Religious Texts"] },
        { field: "Criticism", color: fieldColors["Criticism"] }
    ];
    
    fieldsToShow.forEach(({ field, color }) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-color" style="background-color: ${color}"></div>
            <div class="legend-label">${field}</div>
        `;
        fieldLegend.appendChild(item);
    });
    
    // Circle position legend
    const positionLegend = document.createElement('div');
    positionLegend.className = 'legend-section';
    positionLegend.innerHTML = `
        <h3>Circle position</h3>
        <div class="legend-item">
            <div class="legend-label">chronological order</div>
        </div>
        <div class="legend-item">
            <div class="legend-label" style="font-size: 0.65rem; opacity: 0.8">from left to right, oldest to newest</div>
        </div>
    `;
    
    // Circle size legend
    const sizeLegend = document.createElement('div');
    sizeLegend.className = 'legend-section';
    sizeLegend.innerHTML = `
        <h3>Circle size</h3>
        <div class="legend-item">
            <div class="legend-label">number of pages dedicated in the book</div>
        </div>
    `;
    
    // Lustre legend with circles
    const lustreLegend = document.createElement('div');
    lustreLegend.className = 'legend-section';
    lustreLegend.innerHTML = '<h3>Number in circles</h3>';
    
    const lustreExplanation = document.createElement('div');
    lustreExplanation.className = 'legend-item';
    lustreExplanation.innerHTML = '<div class="legend-label">lustre level (1 to 10 scale)</div>';
    lustreLegend.appendChild(lustreExplanation);
    
    const lustreContainer = document.createElement('div');
    lustreContainer.className = 'lustre-container';
    lustreLegend.appendChild(lustreContainer);
    
    for (let i = 1; i <= 4; i++) {
        const item = document.createElement('div');
        item.className = 'lustre-item';
        item.innerHTML = `
            <div class="lustre-circle">
                <span class="lustre-number">${i}</span>
            </div>
        `;
        lustreContainer.appendChild(item);
    }
    
    // Append all legend sections in order shown in image
    legendContent.appendChild(fieldLegend);
    legendContent.appendChild(positionLegend);
    legendContent.appendChild(sizeLegend);
    legendContent.appendChild(lustreLegend);
}

// Load the dataset and create the visualization
function loadDataAndCreateVisualization() {
    d3.csv("data/geniuses_dataset_updated.csv").then(data => {
        // Apply field colors based on contribution field
        data.forEach(d => {
            d['Field Color'] = fieldColors[d['Field of Contribution']] || "#c7e1bc";
        });
        createVisualization(data);
    }).catch(error => {
        console.error("Error loading the dataset:", error);
    });
}

// Create the visualization
function createVisualization(data) {
    // Set dimensions to match Giorgia Lupi's proportions, but larger
    const margin = { top: 50, right: 150, bottom: 50, left: 150 };
    const width = 1400 - margin.left - margin.right;
    const height = 1100 - margin.top - margin.bottom;
    
    // Create the SVG container
    const svg = d3.select("#visualization")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create the tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    // Process data
    // Remove placeholder geniuses if needed
    const realGeniuses = data.filter(d => !d.Name.includes("Placeholder"));
    
    // Group geniuses by Sephirot
    const geniesBySephirot = {};
    sephirotStructure.forEach((s, i) => {
        const simpleName = s.name.split(' ')[0];
        geniesBySephirot[simpleName] = [];
    });
    
    realGeniuses.forEach(d => {
        if (geniesBySephirot[d['Assigned Sephirot']]) {
            geniesBySephirot[d['Assigned Sephirot']].push(d);
        }
    });
    
    // Sort by time period within each Sephirot
    Object.keys(geniesBySephirot).forEach(key => {
        geniesBySephirot[key].sort((a, b) => {
            // Extract years for comparison
            const yearA = parseTimePeriod(a['Time Period']);
            const yearB = parseTimePeriod(b['Time Period']);
            return yearA - yearB;
        });
    });
    
    // Draw Sephirot structure
    drawSephirotStructure(svg, width, height);
    
    // Draw geniuses nodes
    drawGeniusesNodes(svg, width, height, geniesBySephirot, tooltip);
    
    // Create name lists on the right side
    createNameLists(geniesBySephirot);
}

// Parse time period string to approximate year for sorting
function parseTimePeriod(timePeriod) {
    if (!timePeriod || timePeriod === "Unknown") return 2000; // Default for unknown
    
    // Extract first number that appears
    const match = timePeriod.match(/-?\d+/);
    if (match) {
        let year = parseInt(match[0]);
        if (timePeriod.includes("BCE")) {
            year = -year; // BCE years are negative
        }
        return year;
    }
    
    return 1000; // Default if parsing fails
}

// Generate a gentle curved path between two points
function generateCurvedPath(x1, y1, x2, y2) {
    // Calculate control points for a quadratic curve
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Control point offset - adjust for desired curve amount
    const offsetFactor = 0.2;
    const offsetX = dy * offsetFactor;
    const offsetY = -dx * offsetFactor;
    
    // Control point - creating a slight curve
    const cpX = (x1 + x2) / 2 + offsetX;
    const cpY = (y1 + y2) / 2 + offsetY;
    
    return `M${x1},${y1} Q${cpX},${cpY} ${x2},${y2}`;
}

// Create the name lists on the right side exactly as in the image
function createNameLists(geniesBySephirot) {
    const nameListsContainer = document.querySelector('.name-lists');
    nameListsContainer.innerHTML = '';
    
    // Create a list for each Sephirot in the order shown in the image
    sephirotStructure.forEach((sephirot) => {
        const simpleName = sephirot.name.split(' ')[0];
        const geniuses = geniesBySephirot[simpleName] || [];
        
        if (geniuses.length > 0) {
            const listContainer = document.createElement('div');
            listContainer.className = 'name-list-section';
            
            const header = document.createElement('h3');
            header.textContent = sephirot.name;
            header.style.fontSize = '12px';
            header.style.fontStyle = 'italic';
            header.style.color = '#8c1a1a';
            header.style.marginBottom = '8px';
            header.style.opacity = '0.9';
            
            const list = document.createElement('div');
            list.className = 'names-container';
            
            // Add each genius to the list with numbers as in image
            geniuses.forEach((genius, i) => {
                const nameItem = document.createElement('div');
                nameItem.className = 'name-item';
                
                // Format: "01) Name (Country)" - exactly matching image styling
                const index = (i + 1).toString().padStart(2, '0');
                nameItem.innerHTML = `<span style="opacity:0.8">${index})</span> ${genius.Name} <span style="opacity:0.7">(${genius['Country of Origin']})</span>`;
                nameItem.style.fontSize = '8.5px';
                nameItem.style.marginBottom = '4px';
                nameItem.style.color = '#5c4738';
                nameItem.style.lineHeight = '1.2';
                
                list.appendChild(nameItem);
            });
            
            listContainer.appendChild(header);
            listContainer.appendChild(list);
            nameListsContainer.appendChild(listContainer);
        }
    });
}

// Draw the Sephirot structure exactly like the image
function drawSephirotStructure(svg, width, height) {
    // Draw paths between Sephirot
    sephirotPaths.forEach(path => {
        const source = sephirotStructure[path.source];
        const target = sephirotStructure[path.target];
        
        svg.append("path")
            .attr("class", "sephirot")
            .attr("d", `M${source.x * width},${source.y * height} L${target.x * width},${target.y * height}`);
    });
    
    // Draw Sephirot nodes - small and subtle
    svg.selectAll(".sephirot-node")
        .data(sephirotStructure)
        .enter()
        .append("circle")
        .attr("class", "sephirot-node")
        .attr("cx", d => d.x * width)
        .attr("cy", d => d.y * height)
        .attr("r", 5)
        .attr("fill", d => d.color)
        .attr("opacity", 0.7);
    
    // Add Sephirot labels - positioned as in image
    svg.selectAll(".sephirot-label")
        .data(sephirotStructure)
        .enter()
        .append("text")
        .attr("class", "sephirot-label")
        .attr("x", d => d.x * width)
        .attr("y", (d, i) => {
            // Adjust label position based on Sephirot
            if (i === 0) return d.y * height - 35; // Keter - higher
            if (i === 5) return d.y * height + 30; // Tiferet - lower
            if (i === 9) return d.y * height + 30; // Malkut - lower
            return d.y * height - 25;
        })
        .text(d => d.name);
}

// Draw the genius nodes exactly like the attached image
function drawGeniusesNodes(svg, width, height, geniesBySephirot, tooltip) {
    // For each Sephirot
    Object.entries(geniesBySephirot).forEach(([sephirot, geniuses]) => {
        if (!sephirotNameToIndex.hasOwnProperty(sephirot)) return;
        
        const sephirotIndex = sephirotNameToIndex[sephirot];
        const sephirotPos = sephirotStructure[sephirotIndex];
        
        // Define arc geometry for arranging geniuses - adjust based on Sephirot position
        let startAngle, endAngle, radius;
        
        // Customize arc parameters based on Giorgia Lupi's exact design but larger
        switch(sephirot) {
            case "Keter":
                radius = 100;
                startAngle = -Math.PI * 0.8;
                endAngle = -Math.PI * 0.2;
                break;
            case "Hokhmah":
                radius = 95;
                startAngle = -Math.PI * 0.2;
                endAngle = Math.PI * 0.7;
                break;
            case "Binah":
                radius = 95;
                startAngle = -Math.PI * 0.7;
                endAngle = Math.PI * 0.2;
                break;
            case "Hesed":
                radius = 90;
                startAngle = -Math.PI * 0.6;
                endAngle = Math.PI * 0.2;
                break;
            case "Din":
                radius = 90;
                startAngle = -Math.PI * 0.2;
                endAngle = Math.PI * 0.6;
                break;
            case "Tiferet":
                radius = 95;
                startAngle = -Math.PI * 0.8;
                endAngle = Math.PI * 0.8;
                break;
            case "Netzah":
                radius = 90;
                startAngle = -Math.PI * 0.6;
                endAngle = Math.PI * 0.2;
                break;
            case "Hod":
                radius = 90;
                startAngle = -Math.PI * 0.2;
                endAngle = Math.PI * 0.6;
                break;
            case "Yesod":
                radius = 95;
                startAngle = -Math.PI * 0.8;
                endAngle = Math.PI * 0.8;
                break;
            case "Malkut":
                radius = 100;
                startAngle = -Math.PI * 0.8;
                endAngle = Math.PI * 0.8;
                break;
            default:
                radius = 90;
                startAngle = -Math.PI * 0.6;
                endAngle = Math.PI * 0.6;
        }
        
        const angleStep = (endAngle - startAngle) / (geniuses.length + 1);
        
        // Draw paths and nodes for each genius
        geniuses.forEach((genius, i) => {
            // Calculate position along the arc
            const angle = startAngle + (i + 1) * angleStep;
            const x = sephirotPos.x * width + radius * Math.cos(angle);
            const y = sephirotPos.y * height + radius * Math.sin(angle);
            
            // Draw straight path from Sephirot to genius - matching the image
            svg.append("path")
                .attr("class", "path-line")
                .attr("d", `M${sephirotPos.x * width},${sephirotPos.y * height} L${x},${y}`);
            
            // Determine node size based on pages in the book (using Wikipedia views as proxy)
            // Make nodes significantly larger to match Giorgia Lupi's design
            const pageViews = +genius['Wikipedia Page Views'];
            const nodeSize = Math.max(14, Math.min(24, Math.sqrt(pageViews) / 20));
            
            // Draw genius node
            svg.append("circle")
                .attr("class", "genius-node-circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", nodeSize)
                .attr("fill", genius['Field Color'] || fieldColors[genius['Field of Contribution']] || "#999")
                .on("mouseover", (event) => {
                    tooltip
                        .style("display", "block")
                        .style("opacity", 1)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px")
                        .html(`
                            <h3>${genius.Name}</h3>
                            <p><strong>Origin:</strong> ${genius['Country of Origin']}</p>
                            <p><strong>Period:</strong> ${genius['Time Period']}</p>
                            <p><strong>Field:</strong> ${genius['Field of Contribution']}</p>
                            <p><strong>Lustre:</strong> ${genius['Lustre']}</p>
                            <p><strong>Pages in Book:</strong> ${genius['Wikipedia Page Views']}</p>
                        `);
                })
                .on("mouseout", () => {
                    tooltip
                        .style("opacity", 0)
                        .style("display", "none");
                });
            
            // Add lustre indicator - number inside node - like in Giorgia Lupi's design
            const lustreNum = genius['Lustre'].split(' ')[1];
            svg.append("text")
                .attr("class", "genius-node-text")
                .attr("x", x)
                .attr("y", y + 3)
                .attr("font-size", "14px")
                .text(lustreNum);
                
            // Add name labels for nodes just like in Giorgia Lupi's image
            // Only showing names that appear in her original design
            const prominentNames = ["Homer", "Shakespeare", "Dante", "Cervantes", "Tolstoy",
                                   "Socrates", "Plato", "Aristotle", "Saint Paul",
                                   "Augustine", "Kant", "Spinoza", 
                                   "Milton", "Goethe", "Virgil",
                                   "Montaigne", "Freud", "Nietzsche",
                                   "Proust", "Beckett", "Joyce"];
            
            if (prominentNames.includes(genius.Name) || 
                i === 0 || i === geniuses.length - 1 || 
                (genius['Lustre'] === "Lustre 1" || genius['Lustre'] === "Lustre 2")) {
                svg.append("text")
                    .attr("class", "genius-label")
                    .attr("x", x + nodeSize + 6)
                    .attr("y", y + 4)
                    .text(genius.Name);
            }
        });
    });
}
