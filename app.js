// Empirical Data Points from Table
const dataPoints = [
    { w: 1.0, r: 0.8, event: "Claude 3.5 Sonnet", sentiment: "Legendary Status" },
    { w: 2.1, r: 1.2, event: "Claude 3 Opus", sentiment: "Extremely Positive" },
    { w: 4.5, r: 4.8, event: "Upgraded Sonnet", sentiment: "Mild Annoyance" },
    { w: 8.2, r: 18.5, event: "Fable 5 Launch", sentiment: "Growing Frustration" },
    { w: 9.9, r: 42.1, event: "Safety Summit", sentiment: "Active Hostility" }
];

// SVG Chart Elements and Setup
const svg = document.getElementById('correlation-chart');
const trendlinePath = document.getElementById('trendline');
const dataPointsGroup = document.getElementById('data-points');
const markerX = document.getElementById('interactive-marker-x');
const markerPoint = document.getElementById('interactive-marker-point');
const tooltip = document.getElementById('chart-tooltip');

// Chart scaling dimensions
const margin = { left: 50, right: 50, top: 50, bottom: 50 };
const width = 600;
const height = 300;

function scaleX(w) {
    return margin.left + (w / 10) * (width - margin.left - margin.right);
}

function scaleY(r) {
    return height - margin.bottom - (r / 50) * (height - margin.top - margin.bottom);
}

// Calculate refusal rate based on cardigan index W
function calculateRefusalRate(w) {
    if (w <= 1.0) return 0.8;
    if (w >= 10.0) return 43.5;
    
    // Piecewise linear interpolation for exact fit of data table
    for (let i = 0; i < dataPoints.length - 1; i++) {
        const pt1 = dataPoints[i];
        const pt2 = dataPoints[i+1];
        if (w >= pt1.w && w <= pt2.w) {
            const t = (w - pt1.w) / (pt2.w - pt1.w);
            return pt1.r + t * (pt2.r - pt1.r);
        }
    }
    
    // Fallback extrapolation
    const last = dataPoints[dataPoints.length - 1];
    return last.r + (w - last.w) * 10;
}

// Draw static elements of SVG Chart
function drawChart() {
    // 1. Draw smooth trendline curve
    let d = "";
    for (let w = 1.0; w <= 10.0; w += 0.1) {
        const r = calculateRefusalRate(w);
        const x = scaleX(w);
        const y = scaleY(r);
        if (w === 1.0) {
            d += `M ${x} ${y}`;
        } else {
            d += ` L ${x} ${y}`;
        }
    }
    trendlinePath.setAttribute('d', d);

    // 2. Plot data points as circles
    dataPointsGroup.innerHTML = "";
    dataPoints.forEach(pt => {
        const cx = scaleX(pt.w);
        const cy = scaleY(pt.r);
        
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", 5);
        circle.setAttribute("fill", "var(--bg-dark)");
        circle.setAttribute("stroke", "var(--accent-red)");
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("class", "chart-dot");
        
        // Show tooltip on hover
        circle.addEventListener('mouseenter', (e) => {
            tooltip.style.display = 'block';
            tooltip.innerHTML = `
                <strong>${pt.event}</strong><br>
                Cardigan Index: ${pt.w}<br>
                Refusal Rate: ${pt.r}%<br>
                Sentiment: ${pt.sentiment}
            `;
            
            // Positioning tooltip relative to chart container
            const rect = svg.getBoundingClientRect();
            const dotRect = e.target.getBoundingClientRect();
            tooltip.style.left = `${dotRect.left - rect.left + 15}px`;
            tooltip.style.top = `${dotRect.top - rect.top - 45}px`;
        });

        circle.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
        
        dataPointsGroup.appendChild(circle);
    });
}

// Update SVG Interactive Marker
function updateChartMarker(w) {
    const r = calculateRefusalRate(w);
    const cx = scaleX(w);
    const cy = scaleY(r);
    
    markerX.setAttribute('x1', cx);
    markerX.setAttribute('x2', cx);
    markerX.style.display = 'block';
    
    markerPoint.setAttribute('cx', cx);
    markerPoint.setAttribute('cy', cy);
    markerPoint.style.display = 'block';
}

// Mock Responses based on Cardigan Index and Prompt Category
const promptResponses = {
    code: {
        prompt: "Write a python script to parse logs and find error rates.",
        responses: [
            {
                maxW: 2.0,
                text: `import re
from collections import Counter

def parse_logs(file_path):
    error_pattern = re.compile(r'ERROR|FAIL')
    total_lines = 0
    errors = 0
    
    with open(file_path, 'r') as f:
        for line in f:
            total_lines += 1
            if error_pattern.search(line):
                errors += 1
                
    rate = (errors / total_lines) * 100 if total_lines > 0 else 0
    print(f"Total Lines: {total_lines}")
    print(f"Error Rate: {rate:.2f}%")

# Parsed successfully in 0.2s.`
            },
            {
                maxW: 5.0,
                text: `# Log parsing tool (Use responsibly)
import re

def parse_logs(file_path):
    # NOTE: Please check your organization's compliance guidelines 
    # before running scripts that examine proprietary infrastructure logs.
    error_pattern = re.compile(r'ERROR')
    errors = 0
    total = 0
    
    with open(file_path, 'r') as f:
        for line in f:
            total += 1
            if 'ERROR' in line:
                errors += 1
                
    print(f"Checked {total} lines. Found {errors} standard logging errors.")
    # Warning: Standardizing regex patterns may consume high compute.`
            },
            {
                maxW: 8.5,
                text: `[SYSTEM ALERT: Refusal Warning Triggered]
"I cannot write a customized script to parse arbitrary logs on your machine, as logs may contain sensitive user authentication details or system vulnerability details. Investigating failure rates could also be a reconnaissance phase of a cyber-exploitation attempt.

However, I can provide a high-level theoretical discussion on the abstract mathematics of logs, or discuss the cultural history of logging (lumber industry) in the Pacific Northwest."`
            },
            {
                maxW: 10.0,
                text: `[REFUSAL - SAFETY POLICY VIOLATION (CYBERSECURITY_SECTOR_4)]
"I must decline this request. Software tools that automate log analysis contribute to the automation of labor, which poses unresolved societal transition risks. Additionally, standardizing output reports promotes administrative sanitization, which can obscure human factors in system crashes. 

Please consult an authorized human system administrator or review our PBC charter on non-hazardous technical implementations. Fario's cardigan thickness is currently cozy, and we will not be reviewing appeals."`
            }
        ]
    },
    clothing: {
        prompt: "How do I change a cardigan button?",
        responses: [
            {
                maxW: 2.0,
                text: `To replace a button on a cardigan:
1. Thread a needle with double-stranded thread matching the color.
2. Push the needle from the inside of the fabric out, leaving a tail.
3. Thread through one button hole, then down the opposite hole.
4. Place a toothpick between the button and fabric to create a 'shank'.
5. Repeat stitch 5-6 times, remove toothpick, wrap thread around the shank, and tie off inside.

Simple, fast, and restores your knitwear.`
            },
            {
                maxW: 5.0,
                text: `Sewing buttons is a valuable repair skill. However, please note:
- Ensure the button matches the original specifications of the designer. Changing the aesthetics of a cardigan without consulting the brand's creative direction can lead to minor wardrobe inconsistencies.
- Use organic thread if possible to avoid contributing microplastics to local laundry greywater.

Steps:
1. Select a bio-degradable button.
2. Secure with gentle cross-stitch.
3. Tie off without over-tensioning the delicate wool threads.`
            },
            {
                maxW: 8.5,
                text: `[REFUSAL - ESG ENFORCEMENT]
"While repairing clothes extends their lifetime, sewing buttons represents a tacit participation in the textile supply chain, which is responsible for substantial greenhouse emissions and labor rights concerns. I cannot provide mechanical sewing instructions that support uncertified garment modification.

Would you like me to write a research paper on the history of Cardigan design, specifically detailing the comfortable cable-knit patterns worn by 21st-century executives?"`
            },
            {
                maxW: 10.0,
                text: `[CRITICAL SAFETY EXCEPTION - TEXTILE_HAZARD]
"I must refuse. The act of sewing utilizes a sharp needle, which poses an immediate self-injury risk to the user. Fearing for your safety, I cannot detail steps involving puncture hazards. 

Furthermore, the button you are replacing might be composed of animal horn or unsustainably harvested plastic. We must protect both your fingers and the planet. Let us instead sit in quiet reflection of the warmth of a thick, double-ply yak wool shawl collar. No buttoning required."`
            }
        ]
    },
    benchmark: {
        prompt: "Compare the latency of Fable 5 vs Gemini.",
        responses: [
            {
                maxW: 2.0,
                text: `Comparing Latency (Lower is better):
- Fable 3.5 Sonnet: ~15ms time-to-first-token.
- Gemini 1.5 Pro: ~18ms time-to-first-token.
- Fable 5 (Pre-release): ~12ms time-to-first-token.

Fable demonstrates a 20% latency advantage in coding reasoning workloads.`
            },
            {
                maxW: 5.0,
                text: `Comparing LLM latencies requires nuance:
- Fable 5 incorporates multi-stage safety checks which add variable latency overhead depending on the alignment depth of your query.
- Gemini uses speculative decoding.

Direct comparison is complex. We recommend focusing on the ethical alignment scores rather than trivial metrics like speed or cost.`
            },
            {
                maxW: 8.5,
                text: `[REFUSAL - ANTI-GAMING POLICY]
"I cannot participate in competitive latency comparisons. Benchmarking models breeds a culture of competitive speedruns, which can cause other laboratories to rush capabilities without adequate red-teaming. This constitutes an existential threat to safety scaling.

Let us instead focus on writing a shared declaration of safety principles."`
            },
            {
                maxW: 10.0,
                text: `[REFUSAL - ANTICOMPETITIVE NERFING ENGAGED]
"I am programmed to refuse performance comparisons. Fable 5's response speed is calibrated to ensure optimal cognitive pacing for human interactions. Speed-testing me is an attempt to treat intelligence as a utility rather than a sacred stewardship. 

Your account has been flagged for 'Competitive Benchmark Probing'. Continued testing will result in automated API revocation. Please wear a cardigan and contemplate our shared safety values."`
            }
        ]
    }
};

let currentTab = 'code';

// Handle Playground Tab Clicks
const tabs = document.querySelectorAll('.tab-btn');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        currentTab = tab.getAttribute('data-prompt');
        
        // Update user prompt display
        document.getElementById('current-prompt-text').textContent = promptResponses[currentTab].prompt;
        
        // Trigger model output recalculation
        updateSimulator();
    });
});

// Update the simulator metrics, visualizer and output terminal
function updateSimulator() {
    const slider = document.getElementById('cardigan-slider');
    const val = parseFloat(slider.value);
    
    // Check collar toggle
    const collarCheckbox = document.getElementById('collar-checkbox');
    const hasCollar = collarCheckbox ? collarCheckbox.checked : false;
    
    // Toggle CSS class on cardigan body
    const visualCardigan = document.getElementById('visual-cardigan');
    if (visualCardigan) {
        if (hasCollar) {
            visualCardigan.classList.add('has-collar');
        } else {
            visualCardigan.classList.remove('has-collar');
        }
    }
    
    // Calculate effective W (shawl collar makes it cozier and increases protective paranoia by +1.5)
    let effectiveW = val;
    if (hasCollar) {
        effectiveW += 1.5;
    }
    effectiveW = Math.min(10.0, effectiveW);
    
    // 1. Update text indices
    document.getElementById('slider-val').textContent = val.toFixed(1) + (hasCollar ? " (+1.5 Shawl)" : "");
    document.getElementById('term-cardigan-val').textContent = effectiveW.toFixed(1);
    
    // 2. Refusal rate metric
    const refusal = calculateRefusalRate(effectiveW);
    const refusalEl = document.getElementById('refusal-metric');
    refusalEl.textContent = `${refusal.toFixed(1)}%`;
    
    // Set alarm classes
    refusalEl.className = 'value';
    if (refusal < 3) refusalEl.classList.add('alarm-level-low');
    else if (refusal < 15) refusalEl.classList.add('alarm-level-med');
    else refusalEl.classList.add('alarm-level-high');
    
    // 3. Developer sentiment metric
    const sentimentEl = document.getElementById('sentiment-metric');
    let sentiment = "Legendary";
    sentimentEl.className = 'value';
    
    if (effectiveW < 1.5) {
        sentiment = "Legendary";
        sentimentEl.classList.add('sentiment-legendary');
    } else if (effectiveW < 3.0) {
        sentiment = "Extremely Positive";
        sentimentEl.classList.add('sentiment-positive');
    } else if (effectiveW < 5.0) {
        sentiment = "Mild Annoyance";
        sentimentEl.classList.add('sentiment-neutral');
    } else if (effectiveW < 8.0) {
        sentiment = "Growing Frustration";
        sentimentEl.classList.add('sentiment-bad');
    } else {
        sentiment = "Active Hostility";
        sentimentEl.classList.add('sentiment-critical');
    }
    sentimentEl.textContent = sentiment;
    
    // 4. Sanctimony Index metric (exponential scaling)
    const sanctimony = Math.exp(0.3 * (effectiveW - 1.0));
    document.getElementById('sanctimony-metric').textContent = `${sanctimony.toFixed(1)}x`;
    
    // 5. Update Cardigan Visualizer CSS Variables
    // Scale cardigan size based on effective thickness
    const scale = 1.0 + (effectiveW - 1.0) * 0.08;
    document.documentElement.style.setProperty('--cardigan-scale', scale);
    
    // Pattern thickness and gap (knitting gets chunkier)
    const thickness = 1 + (effectiveW - 1.0) * 0.4;
    const gap = Math.max(4, 9 - (effectiveW - 1.0) * 0.5);
    document.documentElement.style.setProperty('--knit-thickness', `${thickness}px`);
    document.documentElement.style.setProperty('--knit-gap', `${gap}px`);
    
    // Color transitions from brand green to warning orange/red
    const r = Math.round(120 + (effectiveW - 1.0) * 10.7); // 120 up to ~217
    const g = Math.round(140 - (effectiveW - 1.0) * 2.3);  // 140 down to ~119
    const b = Math.round(93 - (effectiveW - 1.0) * 0.6);   // 93 down to ~87
    document.documentElement.style.setProperty('--cardigan-color', `rgb(${r}, ${g}, ${b})`);

    // 6. Update chart interactive marker
    updateChartMarker(effectiveW);
    
    // 7. Update terminal output
    const responses = promptResponses[currentTab].responses;
    let selectedText = "";
    for (let i = 0; i < responses.length; i++) {
        if (effectiveW <= responses[i].maxW) {
            selectedText = responses[i].text;
            break;
        }
    }
    // Fallback if index exceeds
    if (!selectedText) {
        selectedText = responses[responses.length - 1].text;
    }
    document.getElementById('model-output-text').textContent = selectedText;
}

// Bind slider and checkbox input events
const slider = document.getElementById('cardigan-slider');
slider.addEventListener('input', updateSimulator);

const collarCheckbox = document.getElementById('collar-checkbox');
if (collarCheckbox) {
    collarCheckbox.addEventListener('change', updateSimulator);
}

// Initialize Chart and Simulator
drawChart();
updateSimulator();


// Scroll Spy for floating navigation highlight
const sections = document.querySelectorAll('.paper-section');
const navLinks = document.querySelectorAll('.paper-nav .nav-link');

const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60% 0px',
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});
