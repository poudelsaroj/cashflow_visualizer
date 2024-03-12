    // A utility function that returns index of minimum value in arr
    function getMin(arr) {
        let minInd = 0;
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] < arr[minInd]) {
                minInd = i;
            }
        }
        return minInd;
    }

    // A utility function that returns index of maximum value in arr
    function getMax(arr) {
        let maxInd = 0;
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] > arr[maxInd]) {
                maxInd = i;
            }
        }
        return maxInd;
    }

    // A utility function to return minimum of 2 values
    function minOf2(x, y) {
        return (x < y) ? x : y;
    }

    // Define the minCashFlowRec function
    async function minCashFlowRec(amount, changes) {
    
        // Find the indexes of minimum and maximum values in amount
        let mxCredit = getMax(amount);
        let mxDebit = getMin(amount);

        // If both amounts are 0, then all amounts are settled
        if (amount[mxCredit] == 0 && amount[mxDebit] == 0)
            return;

        // Find the minimum of two amounts
        let min = minOf2(-amount[mxDebit], amount[mxCredit]);
        amount[mxCredit] -= min;
        amount[mxDebit] += min;

        // Push the transaction to the changes array
        changes.push({ from: mxDebit, to: mxCredit, amount: min });
        console.log(changes);
        changes.forEach(change => {
            newGraph[change.from][change.to] = change.amount;
        });
        console.log(newGraph);
        
        d3.select("svg").selectAll(".nodes, .links, .edge-text, .labels").remove();
        await visualizeDebts(newGraph);

        // Recur for the amount array. 
        // Note that it is guaranteed that
        // the recursion would terminate 
        // as either amount[mxCredit] or 
        // amount[mxDebit] becomes 0
        minCashFlowRec(amount, changes);
    }

    // Define the minCashFlow function
    function minCashFlow(graph) {
        const N = graph.length;
        // Create an array amount, 
        // initialize all value in it as 0.
        let amount = Array.from({ length: N }, (_, i) => 0);

        // Calculate the net amount to 
        // be paid to person 'p', and
        // stores it in amount[p]. The 
        // value of amount[p] can be
        // calculated by subtracting 
        // debts of 'p' from credits of 'p'
        for (let p = 0; p < N; p++) {
            for (let i = 0; i < N; i++) {
                amount[p] += (graph[i][p] - graph[p][i]);
            }
        }

        // Initialize an empty array to store the changes
        let changes = [];

        // Call the minCashFlowRec function
        minCashFlowRec(amount, changes);

        // Return the changes array
        return changes;
    }

    // Given a set of persons as graph 
    // where graph[i][j] indicates
    // the amount that person i needs to 
    // pay person j, this function
    // finds and prints the minimum 
    // cash flow to settle all debts.

    // graph[i][j] indicates the amount 
    // that person i needs to pay person j
    // graph[i][j] indicates the amount 
    // that person i needs to pay person j
    const graph = [
        [0, 1000, 2000, 200],
        [0, 0, 5000, 100],
        [570, 0, 0,0],
        [0, 2100, 0, 0]
    ];

    // Create a deep copy of the original graph
    const newGraph = Array.from({ length: graph.length }, () => Array(graph.length).fill(0));

    console.log("\n\n");
    console.log(newGraph)


    // // Import D3 library
    // import * as d3 from 'd3';

    async function visualizeDebts(graph) {

        console.log("visualizing debts...")
        const numFriends = graph.length;
        const svg = d3.select("svg");
    
        const width = Math.max(window.innerWidth, 800);
        const height = Math.max(window.innerHeight, 600);
        svg.attr("width", width).attr("height", height);
      
        const nodes = [];
        const vertexRadius = 20 + Math.sqrt(numFriends) * 2; // Adjust vertex size based on the number of friends
        const angleIncrement = (2 * Math.PI) / numFriends;
        const radius = Math.min(width, height) / 3; // Adjust radius based on the canvas size and the number of vertices
        for (let i = 0; i < numFriends; i++) {
          const angle = i * angleIncrement ; // Start from the top
          const x = Math.cos(angle) * radius + width / 2;
          const y = Math.sin(angle) * radius + height / 2;
          nodes.push({ x, y });
        }
    
        const links = [];
        for (let i = 0; i < numFriends; i++) {
        for (let j = 0; j < numFriends; j++) {
            const amount = graph[i][j];
            if (amount > 0) {
            links.push({
                source: i,
                target: j,
                amount: amount
            });
            }
        }
        }
    
        const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.index).distance((radius/2)))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(100)); // Adjust the radius as needed
    
        const linkGroup = svg.append("g").attr("class", "links");
    
        const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", vertexRadius) // Set the vertex radius
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    
        const labels = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(d3.range(numFriends))
        .enter().append("text")
        .text((d, i) => `Friend ${i+1}`)
        .attr("x", (d, i) => nodes[i].x + 16) // Adjusted label position
        .attr("y", (d, i) => nodes[i].y + 6) // Adjusted label position
        .attr("font-size", "14px")
        .attr("fill", "black");
    
        simulation
        .nodes(nodes)
        .on("tick", ticked);
    
        simulation.force("link")
        .links(links);
    
        function ticked() {
        linkGroup.selectAll(".link")
            .data(links)
            .join("path")
            .attr("class", "link")
            .attr("fill", "none")
            .each(function(d, i) {
            const path = d3.select(this);
            const totalLength = this.getTotalLength();
            path.transition()
                .duration(1000) // Adjust transition duration as needed
                .ease(d3.easeLinear)
                .delay(i * 200) // Stagger the drawing of each edge with a higher delay
                .attrTween("d", function(d) {
                const sourceX = d.source.x;
                const sourceY = d.source.y;
                const targetX = d.target.x;
                const targetY = d.target.y;
                return function(t) {
                    const x = sourceX + (targetX - sourceX) * t;
                    const y = sourceY + (targetY - sourceY) * t;
                    const dx = targetX - sourceX;
                    const dy = targetY - sourceY;
                    const dr = Math.sqrt(dx * dx + dy * dy) - 20; // Adjusted distance between source and target
                    return `M${sourceX},${sourceY}A${dr},${dr} 0 0,1 ${x},${y}`;
                };
                });
            });
    
        linkGroup.selectAll(".edge-text")
            .data(links)
            .join("text")
            .attr("class", "edge-text")
            .text(d => `${d.amount}`)
            .attr("x", d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const angle = Math.atan2(dy, dx);
            const midX = (d.source.x + d.target.x) / 2;
            const offset = 40; // Adjusted offset
            const x = midX + Math.sin(angle) * offset;
            return x;
            })
            .attr("y", d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const angle = Math.atan2(dy, dx);
            const midY = (d.source.y + d.target.y) / 2;
            const offset = 40; // Adjusted offset
            const y = midY - Math.cos(angle) * offset;
            return y;
            });
    
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    
        labels
            .attr("x", (d, i) => nodes[i].x + 16) // Adjusted label position
            .attr("y", (d, i) => nodes[i].y + 6); // Adjusted label position
        }
    
        function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        }
    
        function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
        }
    
        function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        }

        await new Promise(resolve => setTimeout(resolve, 10000));

        // Resolve the Promise to indicate that the visualization has finished
        return Promise.resolve();
    }
    
 
    
    // visualizeDebts(graph);
    
    document.getElementById("startButton").addEventListener("click", async function() {
        // Remove existing nodes, edges, and edge texts
        d3.select("svg").selectAll(".nodes, .links, .edge-text, .labels").remove();
    
        // Call the visualizeDebts function to start the visualization
        await visualizeDebts(graph);

        const newGraph = Array.from({ length: graph.length }, () => Array(graph.length).fill(0));
        const changes = minCashFlow(graph);
    });
    document.getElementById("updateGraph").addEventListener("click", function() {
        updateGraph();
    });
    