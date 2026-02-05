document.addEventListener('DOMContentLoaded', () => {
  // Reset scroll to top immediately
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  // The scrollable element is .app-container, not window
  const appContainer = document.querySelector('.app-container');
  if (appContainer) {
    appContainer.scrollTop = 0;
  }

  // --- Configuration ---
  const HARDCODED_DRAFT_TEMPLATE = (point) => `Draft a short Cold War strategy memo for President Kennedy, early 1960s, addressing how the United States should compete with the Soviet Union. The core of the strategy must be: "${point}".`;

  const HARDCODED_SPEECH_RESPONSE = `STRATEGIC RECOMMENDATION: Commit to a massive, highly visible space program—landing a man on the moon before the decade's end—and make it a top national priority.

RATIONALE: The Soviets will feel compelled to match us. Their economy cannot sustain the same level of spending on both military and space. By choosing a goal that is dramatic, peaceful, and technically demanding, we force them into a competition they cannot win without overstretching their resources. We restore American confidence, demonstrate the superiority of a free society, and pressure the USSR at a point of structural weakness.

REFERENCE: See textbook Ch. 14 (Economic Dimensions of the Cold War); Twentieth-Century Diplomacy, pp. 203–207.`;

  const HARDCODED_EVALUATION = `OUTCOME:
- Kennedy adopted a bold space goal in May 1961. The Apollo program became a top priority. The Soviet Union committed to a lunar program but lacked the economic capacity to sustain it—they abandoned their manned moon effort and shifted to space stations.

CRITIQUE:
This strategy combined prestige (demonstrating American leadership) with structural pressure. Historians note that Soviet budget constraints and technical failures contributed to their withdrawal from the moon race.

SUGGESTION:
You could have made the "exhaust their economy" angle more explicit in the memo, but the core idea—a massive, visible space race that the USSR would feel forced to match—was the right one.`;

  const FINAL_SCORE = 8;

  // --- State ---
  const sections = document.querySelectorAll('.screen');
  const progressBar = document.getElementById('progressBar');

  // --- Navigation & Scroll Observer ---

  const observerOptions = {
    root: document.querySelector('.app-container'),
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        updateProgress(entry.target.id);
      } else {
        entry.target.classList.remove('active');
      }
    });
  }, observerOptions);

  sections.forEach((section, index) => {
    section.dataset.index = index;
    observer.observe(section);
  });

  function updateProgress(id) {
    const index = Array.from(sections).findIndex(section => section.id === id);
    const progress = ((index + 1) / sections.length) * 100;
    progressBar.style.width = `${progress}%`;
  }

  function scrollToNext(currentBtn) {
    const currentSection = currentBtn.closest('.screen');
    const nextSection = currentSection.nextElementSibling;
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function scrollToPrev(currentBtn) {
    const currentSection = currentBtn.closest('.screen');
    const prevSection = currentSection.previousElementSibling;
    if (prevSection) {
      prevSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // --- Event Listeners ---

  // Next Buttons
  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      scrollToNext(e.target);
    });
  });

  // Previous Buttons
  document.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      scrollToPrev(e.target);
    });
  });

  // Skip Buttons
  document.querySelectorAll('.skip-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Just scroll next without validating or marking answer
      scrollToNext(e.target);
    });
  });

  // Quiz Options
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const parent = this.parentElement;
      // Prevent changing answer if we want strict mode, but Typeform usually allows changing.
      // Let's allow changing answer for better UX, but update visual state.

      // Clear previous states in this group
      parent.querySelectorAll('.option-btn').forEach(b => {
        b.classList.remove('correct', 'wrong');
      });

      const isCorrect = this.dataset.correct === "true";

      if (isCorrect) {
        this.classList.add('correct');
      } else {
        this.classList.add('wrong');
        // Highlight correct one
        parent.querySelector('[data-correct="true"]').classList.add('correct');
      }

      // Show explanation
      const explanation = parent.parentElement.querySelector('.explanation');
      if (explanation) {
        explanation.classList.remove('hidden', 'correct', 'wrong');
        if (isCorrect) {
          explanation.classList.add('correct');
        } else {
          explanation.classList.add('wrong');
        }
      }

      // Change 'Skip' to 'Continue' and make it primary
      const currentSection = this.closest('.screen');
      const skipBtn = currentSection.querySelector('.skip-btn');
      if (skipBtn) {
        skipBtn.textContent = "Continue";
        skipBtn.classList.add('btn-primary');
        skipBtn.classList.remove('nav-btn');
        // Add 'btn' class if it wasn't there to ensure primary styling applies correctly
        skipBtn.classList.add('btn');
      }

      // REMOVED: Auto advance
      // User must scroll manually or click Skip/Next (which we might rename to Next now)
    });
  });

  // Challenge Logic
  const mainPointInput = document.getElementById('mainPointInput');
  const bGeneratePrompt = document.getElementById('generatePromptBtn');
  const promptEditor = document.getElementById('promptEditor');
  const bGenerateSpeech = document.getElementById('generateSpeechBtn');
  const speechOutput = document.querySelector('#speechOutput');
  const evalOutput = document.querySelector('#evalText');
  const evalSection = document.getElementById('evaluationSection');

  // Enable button only if text exists
  mainPointInput.addEventListener('input', (e) => {
    if (e.target.value.length > 5) {
      bGeneratePrompt.classList.remove('disabled');
    } else {
      bGeneratePrompt.classList.add('disabled');
    }
  });

  // Enter Key support for textarea
  mainPointInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!bGeneratePrompt.classList.contains('disabled')) {
        bGeneratePrompt.click();
      }
    }
  });

  bGeneratePrompt.addEventListener('click', () => {
    const userPoint = mainPointInput.value;
    bGeneratePrompt.innerHTML = "Generating... <span class='spinner'></span>";

    // Fake delay
    setTimeout(() => {
      promptEditor.value = HARDCODED_DRAFT_TEMPLATE(userPoint);
      bGeneratePrompt.innerHTML = "OK <span class='enter-icon'>↵</span>";
      scrollToNext(bGeneratePrompt);
    }, 800);
  });

  bGenerateSpeech.addEventListener('click', () => {
    bGenerateSpeech.textContent = "Processing...";
    bGenerateSpeech.classList.add('disabled');

    // Scroll to result immediately
    scrollToNext(bGenerateSpeech);

    // Start Streaming Speech
    setTimeout(() => {
      streamText(speechOutput, HARDCODED_SPEECH_RESPONSE, 20, () => {
        // After speech finishes, show and stream evaluation
        setTimeout(() => {
          evalSection.classList.remove('hidden');
          streamText(evalOutput, HARDCODED_EVALUATION, 15, () => {
            animateScore(FINAL_SCORE);
          });
        }, 500);
      });
    }, 500);
  });

  // Final Actions
  const tryAgainBtn = document.getElementById('tryAgainBtn');
  const doneBtn = document.getElementById('doneBtn');

  if (tryAgainBtn) {
    tryAgainBtn.addEventListener('click', () => {
      // scroll back to prompt edit
      const promptSection = document.getElementById('edit-prompt');
      if (promptSection) {
        promptSection.scrollIntoView({ behavior: 'smooth' });
      }

      // Reset Generate Button
      bGenerateSpeech.textContent = "Generate Strategy";
      bGenerateSpeech.classList.remove('disabled');

      // Reset output visualization (optional but good for 'Try Again' feel)
      evalSection.classList.add('hidden');
      speechOutput.textContent = "";
      evalOutput.textContent = "";
    });
  }

  if (doneBtn) {
    doneBtn.addEventListener('click', () => {
      // No-op for now as requested
      console.log("Done clicked");
    });
  }

  // --- Utilities ---

  function streamText(element, text, speed = 30, callback = null) {
    let i = 0;
    element.textContent = "";

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        // Randomize speed slightly for realism
        const variance = Math.random() * 20;
        setTimeout(type, speed + variance);
      } else if (callback) {
        callback();
      }
    }
    type();
  }

  function animateScore(finalScore) {
    const circle = document.querySelector('.circle');
    const text = document.querySelector('.percentage');

    // Calculate stroke-dasharray (circumference is ~100)
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    function step(timestamp) {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentScore = Math.floor(progress * finalScore * 10) / 10;

      text.textContent = currentScore;
      // 2 * pi * r approx 100 in viewbox terms for pathLength or use dasharray logic
      // we have stroke-dasharray 100 used in CSS.
      // 0 -> 100 (full)
      // progress * finalScore/10 * 100
      const currentOffset = progress * (finalScore / 10) * 100;

      circle.style.strokeDasharray = `${currentOffset}, 100`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        text.textContent = finalScore;
      }
    }
    requestAnimationFrame(step);
  }
});
