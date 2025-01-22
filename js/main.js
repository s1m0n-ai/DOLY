let highscoreModalShown = false;
let code = "";
document.addEventListener("DOMContentLoaded", function() {
    const tism = document.getElementById('tism-header-main-container');
    const lowerLip = document.getElementById('lower-lip');

    function interpolate(start, end, progress) {
        return start + (end - start) * progress;
    }

    function animateLowerLip(from, to, duration) {
        const startTime = performance.now();

        function step(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const lowerControlY = interpolate(from, to, progress);
            lowerLip.setAttribute('d', `M0 25 Q 50 ${lowerControlY} 100 25 Z`);
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }
    tism.addEventListener('mouseenter', () => {
        animateLowerLip(25, 45, 500);
    });
    tism.addEventListener('mouseleave', () => {
        animateLowerLip(45, 25, 500);
    });
    const leftCol = document.getElementById('left-col');
    const rightCol = document.getElementById('right-col');
    const scrollBG = document.getElementById('scrollBG');
    const scrollBGtop = document.getElementById('scrollBGtop');
    const scrollContainer = document.querySelector('#scroll-container');
    const leftColHeight = leftCol.offsetHeight;
    scrollBG.style.height = leftColHeight + 'px';
    let originalHeight = scrollContainer.offsetHeight;
    let originalWidth = scrollContainer.offsetWidth;
    let isSticky = false;
    let stickyStartScrollY = 0;
    let isRelative = false;
    let previousScrollY = window.scrollY || window.pageYOffset;
    let marginTopApplied = false;
    let currentTransformOffset = 0;
    if (scrollContainer.getBoundingClientRect().top < 0) {
        scrollContainer.style.height = originalHeight + 'px';
        scrollContainer.style.width = originalWidth + 'px';
        scrollContainer.style.position = "relative";
        scrollContainer.style.marginTop = leftColHeight - originalHeight + "px";
        marginTopApplied = true;
        isSticky = false;
        isRelative = true;
        leftCol.style.transform = `translateY(${originalHeight - leftColHeight}px)`;
        rightCol.style.transform = `translateY(${leftColHeight - originalHeight}px)`;
        currentTransformOffset = leftColHeight - originalHeight
    }
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollContainerTop = scrollContainer.getBoundingClientRect().top;
        const leftColBottom = leftCol.getBoundingClientRect().bottom;
        const scrollContainerBottom = scrollContainer.getBoundingClientRect().bottom;
        const scrollBGtopBottom = scrollBGtop.getBoundingClientRect().bottom;
        const scrollingDown = scrollY > previousScrollY;
        previousScrollY = scrollY;
        if (scrollContainerTop <= 0 && !isSticky && !isRelative) {
            scrollContainer.style.position = "fixed";
            scrollContainer.style.height = originalHeight + 'px';
            scrollContainer.style.width = originalWidth + 'px';
            scrollContainer.style.top = '20px';
            isSticky = true;
            stickyStartScrollY = scrollY - currentTransformOffset;
        }
        if (scrollContainerTop < scrollBGtopBottom) {
            scrollContainer.style.position = "relative";
            isSticky = false;
        }
        if (isSticky) {
            const offset = scrollY - stickyStartScrollY;
            currentTransformOffset = offset;
            leftCol.style.transform = `translateY(${-offset}px)`;
            rightCol.style.transform = `translateY(${offset}px)`;
            if (leftColBottom <= scrollContainerBottom) {
                scrollContainer.style.position = "relative";
                scrollContainer.style.marginTop = leftColHeight - originalHeight + "px";
                marginTopApplied = true;
                isSticky = false;
                isRelative = true;
                leftCol.style.transform = `translateY(${-currentTransformOffset}px)`;
                rightCol.style.transform = `translateY(${currentTransformOffset}px)`;
            }
        }
        if (!scrollingDown && isRelative && scrollContainerTop >= 0 && marginTopApplied) {
            scrollContainer.style.position = "fixed";
            scrollContainer.style.top = '20px';
            scrollContainer.style.marginTop = '0px';
            marginTopApplied = false;
            isSticky = true;
            isRelative = false;
            stickyStartScrollY = scrollY - currentTransformOffset;
            leftCol.style.transform = `translateY(${-currentTransformOffset}px)`;
            rightCol.style.transform = `translateY(${currentTransformOffset}px)`;
        }
        if (!isSticky && !isRelative) {
            leftCol.style.transform = `translateY(${-currentTransformOffset}px)`;
            rightCol.style.transform = `translateY(${currentTransformOffset}px)`;
        }
    });

    let highscore = 0;
    fetch('/highscore')
        .then(response => response.json())
        .then(data => {
            highscore = data.highscore;
            document.getElementById('highscore').innerText = "Highscore: " + highscore;
        });
    const numberOfBirds = 9;
    const skyElement = document.getElementById('footer-section');
    const scoreElement = document.getElementById('score');
    let score = 0;

    function createBirdSVG(index) {
        const svgNS = "http://www.w3.org/2000/svg"
        const svg = document.createElementNS(svgNS, "svg");
        svg.classList.add("bird");
        svg.setAttribute("viewBox", "0 0 100 100");
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("id", `wing-${index}`);
        path.setAttribute("d", "M10 50 Q 20 20, 30 50 T 50 50 Q 70 20, 90 50");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "black");
        path.setAttribute("stroke-width", "2");
        svg.appendChild(path);
        skyElement.appendChild(svg);
        return {
            svg,
            path
        };
    }

    function showPoint(x, y) {
        const pointElement = document.createElement('div');
        pointElement.classList.add('point');
        pointElement.textContent = '+1';
        pointElement.style.left = `${x}px`;
        pointElement.style.top = `${y}px`;
        skyElement.appendChild(pointElement);
        setTimeout(() => {
            pointElement.style.transform = 'translateY(-30px)';
            pointElement.style.opacity = '0';
        }, 0);
        setTimeout(() => {
            pointElement.remove();
        }, 800);
    }
    const birds = Array.from({
        length: numberOfBirds
    }, (_, index) => {
        const birdSize = Math.random() * 1.5 + 0.5;
        const {
            svg,
            path
        } = createBirdSVG(index + 1);
        svg.style.width = `${50 * birdSize}px`;
        svg.style.height = `${50 * birdSize}px`;
        return {
            element: path,
            svgElement: svg,
            startX: Math.random() < 0.5 ? -100 : window.innerWidth,
            startY: Math.random() * window.innerHeight,
            amplitude: Math.random() * 10 + 5,
            speed: Math.random() * 0.005 + 0.002,
            direction: Math.random() < 0.5 ? -1 : 1,
            pathVariation: {
                controlPointY1: Math.random() * 30 + 10,
                controlPointY2: Math.random() * 30 + 10,
            },
            delay: Math.random() * 10000,
        };
    });

    function animateBird(bird) {
        let progress = 0;
        let wingFlap = 0;

        function update() {
            const x = bird.startX + bird.direction * progress * 50;
            const y = bird.startY + Math.sin(progress * Math.PI * 2) * bird.amplitude;
            wingFlap = Math.sin(progress * Math.PI * 2) * bird.amplitude;
            bird.element.setAttribute(
                "d",
                `M10 ${50 + wingFlap} Q 20 ${bird.pathVariation.controlPointY1 - wingFlap}, 30 ${50 + wingFlap} 
           T 50 ${50 + wingFlap} Q 70 ${bird.pathVariation.controlPointY2 - wingFlap}, 90 ${50 + wingFlap}`
            );
            progress += bird.speed;
            if (x > window.innerWidth || x < -100) {
                resetBird(bird);
                progress = 0;
            }
            bird.svgElement.style.transform = `translate(${x}px, ${y}px)`;
            requestAnimationFrame(update);
        }
        setTimeout(() => {
            bird.svgElement.style.opacity = 1;
            update();
        }, bird.delay);
    }

    function resetBird(bird) {
        bird.startX = Math.random() < 0.5 ? -100 : window.innerWidth;
        bird.startY = Math.random() * window.innerHeight;
        bird.amplitude = Math.random() * 10 + 5;
        bird.direction = bird.startX === -100 ? 1 : -1;
        bird.pathVariation = {
            controlPointY1: Math.random() * 30 + 10,
            controlPointY2: Math.random() * 30 + 10,
        };
    }
    birds.forEach(bird => {
        animateBird(bird);
        bird.svgElement.addEventListener('click', (event) => {
            bird.svgElement.style.display = 'none';
            showPoint(event.clientX, event.clientY);
            score += 1;
            if (score > highscore) {
                fetch('/highscore', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: 'score=' + score
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'Highscore updated') {
                            highscore = data.new_highscore;
                            document.getElementById('highscore').innerText = "Highscore: " + highscore;
                            document.getElementById('highscore').style.color = "#FF6E01";
                            if (!highscoreModalShown) document.getElementById('highscoreModal').classList.remove("d-none");
                            highscoreModalShown = true
                        }
                    });
            }
            scoreElement.textContent = score;
            bird.speed += 0.002;
            setTimeout(() => {
                resetBird(bird);
                bird.svgElement.style.display = 'block';
            }, 2000);
        });
    });
    const dittoElements = document.querySelectorAll('.ditto-1, .ditto-2, .ditto-3, .ditto-4');

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }

    function handleScroll() {
        dittoElements.forEach(element => {
            if (isElementInViewport(element)) {
                element.classList.add('animate-in');
            }
        });
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();



    function fetchScores() {
        fetch('/scores')
            .then(response => response.json())
            .then(data => {
                // document.getElementById('tismos1Score').textContent = data.tismos1;
                // document.getElementById('tismos2Score').textContent = data.tismos2;
                // document.getElementById('tismos3Score').textContent = data.tismos3;
                document.getElementById('total-score').textContent = "Total: " + (parseInt(data.tismos1) + parseInt(data.tismos2) + parseInt(data.tismos3));
            })
            .catch(error => console.error('Error fetching scores:', error));
    }
    fetchScores();

    function updateScore(tismo) {
        fetch('/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `tismo=${tismo}`,
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    fetchScores();
                } else {
                    console.error('Error updating score:', data.error);
                }
            })
            .catch(error => console.error('Error updating score:', error));
    }

    const sentences = [
        "Why explain emotions when you can explain ObamasonicDogeWifCat?",
        "Why fit in when you can decentralize? You were made for this.",
        "Social skills: low. Analytical skills: Crypto Overlord.",
        "LUPO level is over 9,000!",
        "Why try to understand sarcasm when you can understand tokenomics?",
        "Eye contact: 0%. Market analysis: 100%.",
        "Miss social cues, but never miss a bullish trend.",
        "Can’t tell if someone’s joking, but can definitely tell when the market’s crashing.",
        "Your brain’s wired for HODLing, not for small talk.",
        "Social skills on cooldown, trading skills maxed out.",
        "Can’t tell if your wife’s mad, but you can tell a coin is about to moon.",
        "Miss jokes, catch trends.",
        "Not good at parties, great at liquidity pools.",
        "Struggles with dating, dominates in staking.",
    ];
    const needle = document.getElementById('needle');
    const button = document.getElementById('testTismButton');
    const scoreDisplay = document.getElementById('gauge-score');
    const sentenceParagraph = document.getElementById('tismSentence');

    const tismos1Div = document.getElementById('tismos1');
    const tismos2Div = document.getElementById('tismos2');
    const tismos3Div = document.getElementById('tismos3');

    function animateNeedleWithJitter() {
        button.disabled = true;
        tismos1Div.classList.add('d-none');
        tismos2Div.classList.add('d-none');
        tismos3Div.classList.add('d-none');
        sentenceParagraph.textContent = "";

        const finalScore = (Math.random() * 100).toFixed(2);

        let jitterCount = 0;
        const maxJitterCount = 30;
        const jitterInterval = 50;

        function jitter() {
            const jitterScore = Math.random() * 100;

            const needleRotation = -90 + (jitterScore * 180 / 100);

            needle.style.transform = `rotate(${needleRotation}deg)`;
            scoreDisplay.textContent = `Score: ${jitterScore.toFixed(2)}`;

            if (jitterCount < maxJitterCount) {
                jitterCount++;
                setTimeout(jitter, jitterInterval);
            } else {
                settleNeedleAtScore(finalScore);
            }
        }

        jitter();
    }

    function settleNeedleAtScore(finalScore) {

        const finalNeedleRotation = -90 + (finalScore * 180 / 100);

        needle.style.transition = 'transform 1s ease-out';
        needle.style.transform = `rotate(${finalNeedleRotation}deg)`;

        scoreDisplay.textContent = `Score: ${finalScore}`;

        setTimeout(() => {
            const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
            sentenceParagraph.textContent = randomSentence;
            let tismo = 0;
            if (finalScore <= 20) {
                tismos1Div.classList.remove('d-none');
                tismo = 1;
            } else if (finalScore > 20 && finalScore <= 80) {
                tismos2Div.classList.remove('d-none');
                tismo = 2;
            } else if (finalScore > 80 && finalScore <= 100) {
                tismos3Div.classList.remove('d-none');
                tismo = 3;
            }
            updateScore(tismo);

            const divs = document.querySelectorAll('.showC');

            divs.forEach(function(div) {
                div.classList.remove('d-none');
            });

            button.disabled = false;

            scoreDisplay.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });

        }, 1000);
    }


    button.addEventListener('click', function() {
        animateNeedleWithJitter();
    });


    document.getElementById('highscoreCloseBtn').addEventListener('click', function() {
        document.getElementById('highscoreModal').classList.add("d-none");
    });

    // JavaScript: Fetch Expiration Time and Start Countdown
    document.getElementById('footerbtn').addEventListener('click', function() {
        document.getElementById('secretModal').classList.remove("d-none");

        // Fetch expiration time from the server
        fetch('/get-expiration-time')
            .then(response => response.text())
            .then(expirationTime => {
                expirationTime = parseInt(expirationTime); // Convert to integer
                if (expirationTime > 0) {
                    startCountdown(expirationTime);
                } else {
                    document.getElementById('codeCountdown').textContent = "No active code!";
                    document.querySelector('.part-1').classList.add('d-none');

                }
            })
            .catch(error => console.error('Error fetching expiration time:', error));
    });

    function startCountdown(expirationTime) {
        const countdownElement = document.getElementById('codeCountdown');

        const interval = setInterval(() => {
            const currentTime = Math.floor(Date.now() / 1000); // Current time in UNIX
            const timeLeft = expirationTime - currentTime;

            if (timeLeft <= 0) {
                clearInterval(interval);
                countdownElement.textContent = "Expired!";
                // document.getElementById('secretModal').classList.add('d-none');
            } else {
                countdownElement.textContent = `${timeLeft}s`; // Display time left in seconds
            }
        }, 1000);
    }
    document.getElementById('secretCodeCloseBtn').addEventListener('click', function() {
        document.getElementById('secretModal').classList.add("d-none");
    });


    document.getElementById('submitSuiAddy').addEventListener('click', async function() {
        document.querySelector('.error-msg').classList.add('d-none');
        document.querySelector('.error-msg').innerHTML = "";

        const secretCode = document.getElementById('secret-code').value;
        const suiAddress = document.getElementById('suiAddress').value;
        const twitterUsername = document.getElementById('twitterUsername').value;

        if (!suiAddress || !twitterUsername || !secretCode) {
            document.querySelector('.error-msg').classList.remove('d-none');
            document.querySelector('.error-msg').innerHTML = "All fields are required.";
            return;
        }

        const params = new URLSearchParams({
            sui_address: suiAddress,
            twitterUsername: twitterUsername,
            secret_code: secretCode
        });

        try {
            const response = await fetch(`/submit-sui-address?${params.toString()}`, {
                method: 'POST'
            });
            const text = await response.text();

            if (text === "success") {
                document.querySelector('.part-1').classList.add('d-none');
                document.querySelector('.part-2').classList.remove('d-none');
            } else {
                document.querySelector('.error-msg').classList.remove('d-none');
                document.querySelector('.error-msg').innerHTML = text + "<br>";
            }
        } catch (error) {
            console.error('Error:', error);
            document.querySelector('.error-msg').classList.remove('d-none');
            document.querySelector('.error-msg').innerHTML = "Submission failed. Please try again.";
        }
    });

});