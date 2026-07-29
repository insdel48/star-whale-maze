(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.MultiplicationLogic = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function isValidFactor(value) {
    return Number.isInteger(value) && value >= 1 && value <= 9;
  }

  function requireFactor(value, name) {
    if (!isValidFactor(value)) {
      throw new RangeError(`${name}必须是 1 到 9 的整数`);
    }
  }

  function createQuestion(randomSource) {
    const random = randomSource || Math.random;
    const firstRoll = random();
    const secondRoll = random();
    if (
      typeof firstRoll !== "number" ||
      typeof secondRoll !== "number" ||
      firstRoll < 0 ||
      firstRoll >= 1 ||
      secondRoll < 0 ||
      secondRoll >= 1
    ) {
      throw new RangeError("随机数必须在 0（含）到 1（不含）之间");
    }
    const first = Math.floor(firstRoll * 9) + 1;
    const second = Math.floor(secondRoll * 9) + 1;
    return { first, second, product: first * second };
  }

  function createArrayData(rows, columns) {
    requireFactor(rows, "行数");
    requireFactor(columns, "列数");
    const cells = Array.from({ length: rows }, function (_, rowIndex) {
      return Array.from({ length: columns }, function (_, columnIndex) {
        return {
          row: rowIndex + 1,
          column: columnIndex + 1,
          ordinal: rowIndex * columns + columnIndex + 1,
        };
      });
    });
    return { rows, columns, total: rows * columns, cells };
  }

  function createSkipSequence(step) {
    requireFactor(step, "跳数");
    return Array.from({ length: 9 }, function (_, index) {
      return step * (index + 1);
    });
  }

  function createAdditionData(rows, columns) {
    requireFactor(rows, "行数");
    requireFactor(columns, "列数");
    const terms = Array.from({ length: rows }, function () {
      return columns;
    });
    return {
      terms,
      total: rows * columns,
      expression: `${terms.join("+")}=${rows * columns}`,
    };
  }

  function checkAnswer(question, answer) {
    if (
      !question ||
      !isValidFactor(question.first) ||
      !isValidFactor(question.second)
    ) {
      throw new TypeError("题目必须包含两个 1 到 9 的因子");
    }
    const normalized =
      typeof answer === "string" && answer.trim() !== ""
        ? Number(answer.trim())
        : answer;
    return Number.isInteger(normalized) &&
      normalized === question.first * question.second;
  }

  function calculateStarReward(correctAnswers) {
    if (!Number.isInteger(correctAnswers) || correctAnswers < 0) {
      throw new RangeError("答对题数必须是非负整数");
    }
    return {
      stickers: correctAnswers,
      message:
        correctAnswers === 0
          ? "慢慢摆一摆，准备好再试"
          : `你已经收集了 ${correctAnswers} 颗星`,
    };
  }

  return {
    isValidFactor,
    createQuestion,
    createArrayData,
    createSkipSequence,
    createAdditionData,
    checkAnswer,
    calculateStarReward,
  };
});
