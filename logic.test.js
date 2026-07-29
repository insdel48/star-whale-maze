"use strict";

const assert = require("node:assert/strict");
const logic = require("./logic.js");

let assertionCount = 0;

function test(description, assertion) {
  try {
    assertion();
    assertionCount += 1;
    console.log(`✓ ${description}`);
  } catch (error) {
    console.error(`✗ ${description}`);
    throw error;
  }
}

test("1 是有效因子", () => assert.equal(logic.isValidFactor(1), true));
test("9 是有效因子", () => assert.equal(logic.isValidFactor(9), true));
test("0 不是有效因子", () => assert.equal(logic.isValidFactor(0), false));
test("10 不是有效因子", () => assert.equal(logic.isValidFactor(10), false));
test("小数不是有效因子", () => assert.equal(logic.isValidFactor(2.5), false));
test("字符串不是有效因子", () => assert.equal(logic.isValidFactor("3"), false));

test("随机数下界生成 1×1", () => {
  const values = [0, 0];
  assert.deepEqual(logic.createQuestion(() => values.shift()), {
    first: 1,
    second: 1,
    product: 1,
  });
});
test("随机数上界附近生成 9×9", () => {
  const values = [0.999, 0.999];
  assert.deepEqual(logic.createQuestion(() => values.shift()), {
    first: 9,
    second: 9,
    product: 81,
  });
});
test("出题会正确计算乘积", () => {
  const values = [0.23, 0.67];
  const question = logic.createQuestion(() => values.shift());
  assert.equal(question.product, question.first * question.second);
});
test("出题拒绝等于 1 的随机数", () => {
  assert.throws(() => logic.createQuestion(() => 1), RangeError);
});

test("2×3 数阵有 2 行", () => {
  assert.equal(logic.createArrayData(2, 3).cells.length, 2);
});
test("2×3 数阵每行有 3 格", () => {
  assert.deepEqual(
    logic.createArrayData(2, 3).cells.map((row) => row.length),
    [3, 3],
  );
});
test("2×3 数阵共 6 格", () => {
  assert.equal(logic.createArrayData(2, 3).total, 6);
});
test("数阵格子序号连续", () => {
  assert.deepEqual(
    logic.createArrayData(2, 3).cells.flat().map((cell) => cell.ordinal),
    [1, 2, 3, 4, 5, 6],
  );
});
test("9×9 数阵共 81 格", () => {
  assert.equal(logic.createArrayData(9, 9).cells.flat().length, 81);
});
test("数阵拒绝第 0 行", () => {
  assert.throws(() => logic.createArrayData(0, 3), RangeError);
});
test("数阵拒绝第 10 列", () => {
  assert.throws(() => logic.createArrayData(3, 10), RangeError);
});

test("2 的跳数从 2 到 18", () => {
  assert.deepEqual(logic.createSkipSequence(2), [2, 4, 6, 8, 10, 12, 14, 16, 18]);
});
test("7 的跳数从 7 到 63", () => {
  assert.deepEqual(logic.createSkipSequence(7), [7, 14, 21, 28, 35, 42, 49, 56, 63]);
});
test("9 的跳数有九项", () => {
  assert.equal(logic.createSkipSequence(9).length, 9);
});
test("跳数拒绝 0", () => {
  assert.throws(() => logic.createSkipSequence(0), RangeError);
});

test("4×3 写成四个 3 相加", () => {
  assert.deepEqual(logic.createAdditionData(4, 3).terms, [3, 3, 3, 3]);
});
test("4×3 的加法式正确", () => {
  assert.equal(logic.createAdditionData(4, 3).expression, "3+3+3+3=12");
});
test("1×9 的加法式正确", () => {
  assert.equal(logic.createAdditionData(1, 9).expression, "9=9");
});

const threeByFour = { first: 3, second: 4, product: 12 };
test("数字答案正确时判对", () => {
  assert.equal(logic.checkAnswer(threeByFour, 12), true);
});
test("带空格的字符串答案可判对", () => {
  assert.equal(logic.checkAnswer(threeByFour, " 12 "), true);
});
test("错误答案判错", () => {
  assert.equal(logic.checkAnswer(threeByFour, 11), false);
});
test("空答案判错", () => {
  assert.equal(logic.checkAnswer(threeByFour, ""), false);
});
test("小数答案判错", () => {
  assert.equal(logic.checkAnswer(threeByFour, 12.5), false);
});
test("非法题目会报错", () => {
  assert.throws(
    () => logic.checkAnswer({ first: 0, second: 4 }, 0),
    TypeError,
  );
});

test("未答对时没有星星也没有负数", () => {
  assert.equal(logic.calculateStarReward(0).stickers, 0);
});
test("每答对一题得到一颗星", () => {
  assert.equal(logic.calculateStarReward(4).stickers, 4);
});
test("星星鼓励语会同步数量", () => {
  assert.match(logic.calculateStarReward(3).message, /3 颗星/);
});
test("星星规则拒绝负数", () => {
  assert.throws(() => logic.calculateStarReward(-1), RangeError);
});

console.log(`\n全部通过：${assertionCount} 条断言`);
