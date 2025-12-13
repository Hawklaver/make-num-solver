self.addEventListener("message", e => {

	const { nums, opes, result, sortable, limit } = e.data;
	const numsPerm = sortable ? permutation(nums) : [nums];
	const solutions = [];
	for (const nums of numsPerm) {
		if (traverse(nums, result, limit)) {
			break;
		}
	}
	self.postMessage({ complete: true });

	// 再帰で配列の順列を生成
	function permutation(arr) {
		if (arr.length <= 1) {
			return [arr];
		}
		const result = [];
		arr.forEach((value, index) => {
			// 重複した順列は列挙しない
			if (index === arr.indexOf(value)) {
				const perms = permutation(arr.filter((v, i) => i !== index));
				perms.forEach(perm => {
					result.push([value, ...perm]);
				});
			}
		});
		return result;
	}

	// 再帰で全パターンの数式を走査
	function traverse(nums, result, limit, expr = [], numCount = 0, opeCount = 0) {
		if (nums.length === 0 && numCount - opeCount === 1) {
			if (Math.abs(calcRPN(expr) - result) < 0.001) {
				const solution = rpn2in(expr);
				if (!solutions.includes(solution)) {
					solutions.push(solution);
					self.postMessage({ solution });
					if (limit === "one") {
						return true;
					}
				}
			}
		}
		for (const ope of opes) {
			if (ope === "n") {
				if (0 < nums.length) {
					expr.push(nums[0]);
					if (traverse(nums.slice(1), result, limit, expr, numCount + 1, opeCount)) {
						return true;
					}
					expr.pop();
				}
			} else {
				if (2 <= numCount - opeCount) {
					expr.push(ope);
					if (traverse(nums, result, limit, expr, numCount, opeCount + 1)) {
						return true;
					}
					expr.pop();
				}
			}
		}
	}

	// 逆ポーランド記法を計算
	function calcRPN(expr) {
		const stack = [];
		for (const c of expr) {
			switch (c) {
				case "+": stack.push(stack.splice(-2, 1)[0] + stack.pop()); break;
				case "-": stack.push(stack.splice(-2, 1)[0] - stack.pop()); break;
				case "*": stack.push(stack.splice(-2, 1)[0] * stack.pop()); break;
				case "/": stack.push(stack.splice(-2, 1)[0] / stack.pop()); break;
				case "%": stack.push(stack.splice(-2, 1)[0] % stack.pop()); break;
				case "**":
				case "^": stack.push(stack.splice(-2, 1)[0] ** stack.pop()); break;
				default: stack.push(c * 1); break;
			}
		}
		const result = stack.pop();
		return result;
	}

	// 逆ポーランド記法を中置記法に変換
	function rpn2in(expr) {
		const stack = [];
		for (const c of expr) {
			switch (c) {
				case "+": {
					const [l, r] = stack.splice(-2);
					stack.push({ str: `${l.str} ${c} ${r.str}`, priority: 4 });
					break;
				}
				case "-": {
					const [l, r] = stack.splice(-2);
					if (r.priority < 4) {
						stack.push({ str: `${l.str} ${c} ${r.str}`, priority: 4 });
					} else {
						stack.push({ str: `${l.str} ${c} (${r.str})`, priority: 4 });
					}
					break;
				}
				case "*": {
					const [l, r] = stack.splice(-2);
					const rStr = r.priority >= 3 ? `(${r.str})` : r.str;
					const lStr = l.priority === 4 ? `(${l.str})` : l.str;
					stack.push({ str: `${lStr} ${c} ${rStr}`, priority: 2 });
					break;
				}
				case "/": {
					const [l, r] = stack.splice(-2);
					const rStr = r.priority >= 2 ? `(${r.str})` : r.str;
					const lStr = l.priority === 4 ? `(${l.str})` : l.str;
					stack.push({ str: `${lStr} ${c} ${rStr}`, priority: 2 });
					break;
				}
				case "%": {
					const [l, r] = stack.splice(-2);
					const rStr = r.priority >= 2 ? `(${r.str})` : r.str;
					const lStr = l.priority === 4 ? `(${l.str})` : l.str;
					stack.push({ str: `${lStr} ${c} ${rStr}`, priority: 3 });
					break;
				}
				case "**":
				case "^": {
					const [l, r] = stack.splice(-2);
					const rStr = r.priority >= 2 ? `(${r.str})` : r.str;
					const lStr = l.priority >= 1 ? `(${l.str})` : l.str;
					stack.push({ str: `${lStr} ${c} ${rStr}`, priority: 1 });
					break;
				}
				default:
					stack.push({ str: c, priority: 0 });
			}
		}
		const output = stack.pop().str;
		return output;
	}

});
