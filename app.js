(function () {
  "use strict";

  const logic = window.MultiplicationLogic;
  if (!logic) {
    throw new Error("乘法逻辑没有成功加载");
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function fillFactorSelect(select, selectedValue) {
    for (let value = 1; value <= 9; value += 1) {
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = String(value);
      option.selected = value === selectedValue;
      select.appendChild(option);
    }
  }

  function paintArray(container, arrayData, label) {
    container.replaceChildren();
    container.style.setProperty("--columns", String(arrayData.columns));
    container.setAttribute("aria-label", label);
    arrayData.cells.flat().forEach(function (cell, index) {
      const dot = document.createElement("span");
      dot.className = "array-cell";
      dot.textContent = "●";
      dot.style.animationDelay = `${Math.min(index * 18, 500)}ms`;
      dot.title = `第 ${cell.row} 行，第 ${cell.column} 个`;
      container.appendChild(dot);
    });
  }

  const rowsSelect = byId("array-rows");
  const columnsSelect = byId("array-columns");
  fillFactorSelect(rowsSelect, 3);
  fillFactorSelect(columnsSelect, 4);

  function renderMainArray() {
    const rows = Number(rowsSelect.value);
    const columns = Number(columnsSelect.value);
    const arrayData = logic.createArrayData(rows, columns);
    const addition = logic.createAdditionData(rows, columns);
    paintArray(
      byId("array-board"),
      arrayData,
      `${rows} 行、每行 ${columns} 个，共 ${arrayData.total} 个`,
    );
    byId("array-description").textContent = `${rows} 行，每行 ${columns} 个`;
    byId("array-addition").textContent = addition.expression;
    byId("array-equation").textContent = `${rows}×${columns}=${arrayData.total}`;
  }

  byId("build-array").addEventListener("click", renderMainArray);
  rowsSelect.addEventListener("change", renderMainArray);
  columnsSelect.addEventListener("change", renderMainArray);
  renderMainArray();

  let trainStep = 2;
  let litCarriages = 0;
  const picker = byId("step-picker");

  function renderTrain() {
    const values = logic.createSkipSequence(trainStep);
    const track = byId("train-track");
    track.replaceChildren();
    values.forEach(function (value, index) {
      const carriage = document.createElement("div");
      const isLit = index < litCarriages;
      carriage.className = `carriage${isLit ? " is-lit" : ""}`;
      carriage.textContent = isLit ? String(value) : "?";
      carriage.setAttribute(
        "aria-label",
        isLit ? `${trainStep} 的第 ${index + 1} 个倍数是 ${value}` : `第 ${index + 1} 节还没点亮`,
      );
      track.appendChild(carriage);
    });
  }

  function selectTrainStep(step) {
    trainStep = step;
    litCarriages = 0;
    picker.querySelectorAll("button").forEach(function (button) {
      button.setAttribute("aria-pressed", String(Number(button.dataset.step) === step));
    });
    byId("train-feedback").textContent = `这列火车每次跳 ${step} 格。`;
    renderTrain();
  }

  for (let step = 2; step <= 9; step += 1) {
    const button = document.createElement("button");
    button.className = "number-button";
    button.type = "button";
    button.dataset.step = String(step);
    button.textContent = `跳 ${step}`;
    button.setAttribute("aria-pressed", String(step === trainStep));
    button.addEventListener("click", function () {
      selectTrainStep(step);
    });
    picker.appendChild(button);
  }

  byId("train-next").addEventListener("click", function () {
    const sequence = logic.createSkipSequence(trainStep);
    if (litCarriages < sequence.length) {
      litCarriages += 1;
      const value = sequence[litCarriages - 1];
      byId("train-feedback").textContent = `${sequence.slice(0, litCarriages).join("、")}，现在到 ${value}。`;
      if (litCarriages === sequence.length) {
        byId("train-feedback").textContent = `到站啦！${trainStep} 的 9 倍是 ${value}。`;
      }
      renderTrain();
    } else {
      byId("train-feedback").textContent = "九节车厢都亮了，可以从头再玩一次。";
    }
  });

  byId("train-reset").addEventListener("click", function () {
    selectTrainStep(trainStep);
  });
  renderTrain();

  let currentQuestion;
  let questionSolved = false;
  let correctAnswers = 0;

  function hideQuestionHint() {
    byId("array-hint-wrap").hidden = true;
    byId("array-hint").replaceChildren();
    byId("hint-addition").textContent = "";
  }

  function nextQuestion() {
    currentQuestion = logic.createQuestion();
    questionSolved = false;
    byId("question-text").textContent = `${currentQuestion.first} × ${currentQuestion.second} = ?`;
    byId("answer-input").value = "";
    byId("answer-feedback").textContent = "准备好就试试看。";
    hideQuestionHint();
    byId("answer-input").focus();
  }

  function renderStars() {
    const reward = logic.calculateStarReward(correctAnswers);
    byId("star-stickers").textContent = reward.stickers > 0
      ? `${"★".repeat(reward.stickers)}\n${reward.message}`
      : "还没有星星，慢慢来";
  }

  byId("answer-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const answer = byId("answer-input").value;
    if (logic.checkAnswer(currentQuestion, answer)) {
      if (!questionSolved) {
        questionSolved = true;
        correctAnswers += 1;
        renderStars();
      }
      byId("answer-feedback").textContent = `答对啦！${currentQuestion.first} 组 ${currentQuestion.second} 个，合起来是 ${currentQuestion.product} 个。`;
    } else {
      byId("answer-feedback").textContent = "还差一点点。可以摆一摆再试，星星会在这里等你。";
    }
  });

  byId("show-array-hint").addEventListener("click", function () {
    const arrayData = logic.createArrayData(currentQuestion.first, currentQuestion.second);
    const addition = logic.createAdditionData(currentQuestion.first, currentQuestion.second);
    paintArray(
      byId("array-hint"),
      arrayData,
      `${currentQuestion.first} 行、每行 ${currentQuestion.second} 个的提示数阵`,
    );
    byId("hint-addition").textContent = `${currentQuestion.first} 行，每行 ${currentQuestion.second} 个：${addition.expression}`;
    byId("array-hint-wrap").hidden = false;
  });

  byId("next-question").addEventListener("click", nextQuestion);
  renderStars();
  nextQuestion();
})();
