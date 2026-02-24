---
title: 'Java基础算法模板'
date: 2026-02-14 09:29:05
categories:
  - 学习笔记
tags:
  - 算法与数据结构
---
需知：
- 本文提到的模板均为Java实现;
- 主要为基础算法和数据结构(滑动窗口、01背包等)，不会出现较为复杂的类型(线段树、替罪羊树);
- 会提及对应的知识点，但主要集中于模板，不适合完全不了解的读者；
- 题目来源于leetcode。

| 目录 |
| ---- |
| [前缀和与差分](#前缀和与差分) |
| [滑动窗口](#滑动窗口) |
| [单调栈](#单调栈) |
| [回溯](#回溯) |
| [DFS与BFS](#DFS与BFS) |
| [01背包与完全背包](#01背包与完全背包) |
| [杂项](#杂项) |

---
# 前缀和与差分
## 前缀和
### 思想
**用空间换时间**
将原始数据进行预处理，构建新数组，其中每个位置存储从起点到当前位置的和。
```
prefix[i] = nums[0] + nums[1] + ... + nums[i-1]
```
利用前缀和数组快速计算任意区间和 : 
```
sum[left, right] = prefix[right+1] - prefix[left]
```
### 模板
一维前缀和
```
class Main{
    // 求区间[x,y]之和
    public int PrefixSum1D(int[] nums, int x, int y){
        int n = nums.length;

        // 构建前缀和数组
        int[] prefix = new int[n + 1];
        for (int i = 0; i < n; i++) {
            prefix[i + 1] = prefix[i] + nums[i];
        }
        return query(prefix ,x, y);
    }
    // 查询区间[left, right]的和
    public int query(int[] prefix, int left, int right) {
        return prefix[right + 1] - prefix[left];
    }
}
```
二维前缀和
```
public class Main {
    // 求二维数组从 (row1, col1) 到 (row2, col2) 的元素之和
    public int PrefixSum2D(int[][] matrix, int row1, int col1, int row2, int col2) {
        int m = matrix.length, n = matrix[0].length;
        int[][] prefix = new int[m + 1][n + 1];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                prefix[i + 1][j + 1] = matrix[i][j]
                        + prefix[i][j + 1]
                        + prefix[i + 1][j]
                        - prefix[i][j];
            }
        }
        return query(prefix, row1, col1, row2, col2);
    }
    // 通过前缀和数组查询指定区域的元素之和
    public int query(int[][] prefix ,int row1, int col1, int row2, int col2) {
        return prefix[row2 + 1][col2 + 1]
                - prefix[row1][col2 + 1]
                - prefix[row2 + 1][col1]
                + prefix[row1][col1];
    }
}
```
- 注：二维数组会产生重合部分，在计算时要减去` 𝑆3,3=𝐴3,3+𝑆2,3+𝑆3,2−𝑆2,2` (设S为前缀和数组，A为原数组)

### 适用范围
1. 频繁查询区间和
2. 统计满足条件的子数组/子矩阵
3. 滑动窗口优化
4. 数据预处理后多次查询
### 例题
[209 长度最小的子数组](https://leetcode.cn/problems/minimum-size-subarray-sum/description/?envType=problem-list-v2&envId=prefix-sum)
给定一个含有 `n` 个正整数的数组和一个正整数 `target` 。

找出该数组中满足其总和大于等于 `target` 的长度最小的 **子数组** `[numsl, numsl+1, ..., numsr-1, numsr]` ，并返回其长度**。**如果不存在符合条件的子数组，返回 `0` 。

## 差分
### 思想
差分是前缀和的**逆运算**，核心思想是：将对区间的多次修改操作，转化为对差分数组的两次单点修改，最后通过一次前缀和得到最终结果。

预处理
```
diff[i] = a[i] - a[i-1]  (i ≥ 1)
diff[0] = a[0]
```
区间修改（对 a[l..r]加上 val）：
```
diff[l] += val
diff[r+1] -= val
```

二维
```
diff[i][j] = a[i][j] - a[i-1][j] - a[i][j-1] + a[i-1][j-1]

子矩阵修改 对(x1,y1)到(x2,y2)加上val
diff[x1][y1] += val
diff[x2+1][y1] -= val
diff[x1][y2+1] -= val
diff[x2+1][y2+1] += val
```
### 模板
```
public class Main {
    // 求数组的差分数组
    public int[] Diff(int[] nums) {
        int n = nums.length;
        int[] diff = new int[n];
        diff[0] = nums[0];
        for (int i = 0; i < n; i++) {
            diff[i] = diff[i + 1] - nums[i];
        }
        return diff;
    }
}
```
### 适用范围
1. 频繁进行区间修改，最后查询结果
2. 对数组/矩阵的多个区间加减操作
3. 批量更新后求最终状态
4. 优化多次区间修改的时间复杂度
### 例题
[1109 航班预订统计](https://leetcode.cn/problems/corporate-flight-bookings/description/)
这里有 n 个航班，它们分别从 1 到 n 进行编号。

有一份航班预订表 bookings ，表中第 i 条预订记录 bookings[i] = [firsti, lasti, seatsi] 意味着在从 firsti 到 lasti （包含 firsti 和 lasti ）的 每个航班 上预订了 seatsi 个座位。

请你返回一个长度为 n 的数组 answer，里面的元素是每个航班预定的座位总数。

---
# 滑动窗口
## 思想
滑动窗口本质是一种**双指针 + 区间维护**的技巧，用来处理**连续子数组 / 子串问题**。

通过维护一个 `[left, right)` 或 `[left, right]` 的窗口，使区间随着指针移动而“滑动”，避免重复计算。

核心思想：
- 每个元素**最多进窗口一次、出窗口一次**

## 定长窗口
窗口大小 k 固定，只需要关注窗口每次向右移动一格。
### 模板
```
class Solution {
    // 在长度为 k 的所有子数组中，求最大和
    public int fixedWindow(int[] nums, int k) {
        int n = nums.length;
        int sum = 0;

        // 初始化第一个窗口
        for (int i = 0; i < k; i++) {
            sum += nums[i];
        }
        int ans = sum;

        // 窗口滑动
        for (int i = k; i < n; i++) {
            sum += nums[i];
            sum -= nums[i - k];
            ans = Math.max(ans, sum);
        }
        return ans;
    }
}
```
### 适用范围
1. 子数组长度固定
2. 连续区间统计最大值 / 最小值 / 和
3. 平均值、区间计数类问题
### 例题
[1456.定长字串中元音的最大数目](https://leetcode.cn/problems/maximum-number-of-vowels-in-a-substring-of-given-length/)
给你字符串 s 和整数 k 。

请返回字符串 s 中长度为 k 的单个子字符串中可能包含的最大元音字母数。

## 不定长滑动窗口
### 模板
```
class Solution {
    // 求和 >= target 的最短子数组长度
    public int minSubArrayLen(int target, int[] nums) {
        int n = nums.length;
        int left = 0, sum = 0;
        int ans = Integer.MAX_VALUE;

        for (int right = 0; right < n; right++) {
            sum += nums[right];
            while (sum >= target) {
                ans = Math.min(ans, right - left + 1);
                sum -= nums[left];
                left++;
            }
        }
        return ans == Integer.MAX_VALUE ? 0 : ans;
    }
}
```
### 适用范围
1. 连续子数组 / 子串
2. 满足某种约束（和、字符种类数等）
3. 最短 / 最长 区间问题
### 例题
[904.水果成篮](https://leetcode.cn/problems/fruit-into-baskets/)
你正在探访一家农场，农场从左到右种植了一排果树。这些树用一个整数数组 fruits 表示，其中 fruits[i] 是第 i 棵树上的水果 种类 。

你想要尽可能多地收集水果。然而，农场的主人设定了一些严格的规矩，你必须按照要求采摘水果：

你只有 两个 篮子，并且每个篮子只能装 单一类型 的水果。每个篮子能够装的水果总量没有限制。
你可以选择任意一棵树开始采摘，你必须从 每棵 树（包括开始采摘的树）上 恰好摘一个水果 。采摘的水果应当符合篮子中的水果类型。每采摘一次，你将会向右移动到下一棵树，并继续采摘。
一旦你走到某棵树前，但水果不符合篮子的水果类型，那么就必须停止采摘。

给你一个整数数组 fruits ，返回你可以收集的水果的 最大 数目。

---
# 单调栈

## 思想
单调栈用于维护**栈内元素单调递增或递减**，常用于解决：
- 下一个更大元素
- 上一个更小元素
- 区间贡献问题

核心特性：
- 每个元素**最多入栈一次、出栈一次**
- 时间复杂度 **O(n)**
## 模板 (单调递减栈)
```
class Solution {
    // 返回每个元素右侧第一个更大的元素
    public int[] nextGreater(int[] nums) {
        int n = nums.length;
        int[] res = new int[n];
        Arrays.fill(res, -1);
        Deque<Integer> stack = new ArrayDeque<>();

        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
                int idx = stack.pop();
                res[idx] = nums[i];
            }
            stack.push(i);
        }
        return res;
    }
}
```
## 适用范围
1. 下一个 / 上一个更大或更小元素
2. 直方图最大矩形
3. 子数组最值贡献计算
## 例题
[215.数组中的第k个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/)
给定整数数组 nums 和整数 k，请返回数组中第 k 个最大的元素。

请注意，你需要找的是数组排序后的第 k 个最大的元素，而不是第 k 个不同的元素。

你必须设计并实现时间复杂度为 O(n) 的算法解决此问题。

---
# 回溯
## 思想
回溯是一种**暴力枚举 + 剪枝**的搜索方式，常用于组合、排列、子集等问题。
核心框架：
- 做选择
- 递归
- 撤销选择
## 模板
```
// 求一个数组的所有子集  
class Solution {  
    List<List<Integer>> res = new ArrayList<>();  
    List<Integer> path = new ArrayList<>();  
  
    public List<List<Integer>> subsets(int[] nums) {  
        backtrack(nums, 0);  
        return res;  
    }     
    // 回溯算法  
    private void backtrack(int[] nums, int start) {  
        res.add(new ArrayList<>(path));  
  
        for (int i = start; i < nums.length; i++) {  
            path.add(nums[i]);  
            backtrack(nums, i + 1);  
            path.remove(path.size() - 1);  
        }  
    }  
}
```
## 适用范围
- 全排列 / 组合 / 子集
- 搜索所有可行解
- 结果规模指数级
## 例题
[46.全排列](https://leetcode.cn/problems/permutations/)
给定一个不含重复数字的数组 nums ，返回其 所有可能的全排列 。你可以 按任意顺序 返回答案。

---
# DFS与BFS
## 思想
DFS 和 BFS 是图 / 树搜索的两种基本方式。

DFS：一路走到底（递归 / 栈）

BFS：一层一层扩展（队列）
## 模板
### DFS
```
void dfs(int node) {
    visited[node] = true;
    for (int next : graph[node]) {
        if (!visited[next]) {
            dfs(next);
        }
    }
}
```
### BFS
```
void bfs(int start) {
    Queue<Integer> queue = new ArrayDeque<>();
    queue.offer(start);
    visited[start] = true;

    while (!queue.isEmpty()) {
        int cur = queue.poll();
        for (int next : graph[cur]) {
            if (!visited[next]) {
                visited[next] = true;
                queue.offer(next);
            }
        }
    }
}

```
## 适用范围
1. 图、树遍历
2. 连通性问题
3. 最短路径（无权图）
## 例题
[200.岛屿数量](https://leetcode.cn/problems/number-of-islands/)
给你一个由 '1'（陆地）和 '0'（水）组成的的二维网格，请你计算网格中岛屿的数量。

岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。

此外，你可以假设该网格的四条边均被水包围。

---
# 01背包与完全背包
## 思想
用于在容量限制下选取物品。
- **01 背包**：每个物品只能选一次
- **完全背包**：每个物品可以无限选
## 模板
### 01背包
```
class Solution {
    public int knapsack01(int[] w, int[] v, int bag) {
        int n = w.length;
        int[] dp = new int[bag + 1];

        for (int i = 0; i < n; i++) {
            for (int j = bag; j >= w[i]; j--) {
                dp[j] = Math.max(dp[j], dp[j - w[i]] + v[i]);
            }
        }
        return dp[bag];
    }
}
```
### 完全背包
```
class Solution {
    public int completeKnapsack(int[] w, int[] v, int bag) {
        int n = w.length;
        int[] dp = new int[bag + 1];

        for (int i = 0; i < n; i++) {
            for (int j = w[i]; j <= bag; j++) {
                dp[j] = Math.max(dp[j], dp[j - w[i]] + v[i]);
            }
        }
        return dp[bag];
    }
}
```
## 适用范围
1. 资源有限的最优选择问题
2. 子集和、零钱兑换
3. 计数 / 最大值 DP
## 例题
[322.零钱兑换](https://leetcode.cn/problems/coin-change/) 给你一个整数数组 `coins` ，表示不同面额的硬币；以及一个整数 `amount` ，表示总金额。

计算并返回可以凑成总金额所需的 **最少的硬币个数** 。如果没有任何一种硬币组合能组成总金额，返回 `-1` 。

你可以认为每种硬币的数量是无限的。

---

# 杂项
## 二进制数字构建
``` 
val = (val << 1) | root.val;
```
### 1. `val << 1`

- `<<`是**左移运算符**
- `val << 1`表示将 `val`的二进制表示向左移动1位
- **效果相当于**：`val * 2`
- **二进制意义**：在二进制末尾添加一个0
### 2. `| root.val`
- `|`是**按位或运算符**
- `root.val`通常是0或1（表示二叉树节点的值）
- **效果**：将移位后的最低位设置为 `root.val`
### 3. 整体效果
**在已有的二进制数末尾添加一位新数字**
```
1 -> 0 -> 1

val = 0

// 第一个节点: root.val = 1
val = (0 << 1) | 1
    = 0 | 1
    = 1   // 二进制: 1

// 第二个节点: root.val = 0
val = (1 << 1) | 0
    = 2 | 0
    = 2   // 二进制: 10

// 第三个节点: root.val = 1
val = (2 << 1) | 1
    = 4 | 1
    = 5   // 二进制: 101
```
## 例题
[从根到叶的二进制数之和](https://leetcode.cn/problems/sum-of-root-to-leaf-binary-numbers/)
给出一棵二叉树，其上每个结点的值都是 0 或 1 。每一条从根到叶的路径都代表一个从最高有效位开始的二进制数。

例如，如果路径为 0 -> 1 -> 1 -> 0 -> 1，那么它表示二进制数 01101，也就是 13 。
对树上的每一片叶子，我们都要找出从根到该叶子的路径所表示的数字。

返回这些数字之和。题目数据保证答案是一个 32 位 整数。