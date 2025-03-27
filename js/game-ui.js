// 游戏用户界面
class GameUI {
    constructor(gameCore) {
        this.gameCore = gameCore;
        this.boardElement = document.querySelector('.game-board');
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.hintsElement = document.getElementById('hints');
        this.difficultySelect = document.getElementById('difficulty-select');
        this.startButton = document.getElementById('start-game-btn');
        this.hintButton = document.getElementById('hint-btn');
        this.shuffleButton = document.getElementById('shuffle-btn');
        this.resetButton = document.getElementById('reset-btn');
        
        this.cellSize = 60; // 默认单元格大小
        this.hintTimeout = null;
        this.pathLines = [];
    }
    
    // 初始化UI
    init() {
        // 调整单元格大小
        this.adjustCellSize();
        
        // 绑定按钮事件
        this.bindEvents();
    }
    
    // 根据屏幕大小调整单元格大小
    adjustCellSize() {
        const containerWidth = this.boardElement.parentElement.clientWidth;
        const maxCols = Math.max(8, this.gameCore.cols);
        this.cellSize = Math.floor((containerWidth - 20) / maxCols);
    }
    
    // 渲染游戏板
    renderBoard() {
        this.boardElement.innerHTML = '';
        this.boardElement.style.gridTemplateColumns = `repeat(${this.gameCore.cols}, 1fr)`;
        
        for (let row = 0; row < this.gameCore.rows; row++) {
            for (let col = 0; col < this.gameCore.cols; col++) {
                const cell = this.gameCore.board[row][col];
                const cellElement = document.createElement('div');
                cellElement.className = 'cell';
                cellElement.dataset.row = row;
                cellElement.dataset.col = col;
                
                const iconElement = document.createElement('div');
                iconElement.className = `element-icon element-${cell.type}`;
                cellElement.appendChild(iconElement);
                
                if (cell.matched) {
                    cellElement.classList.add('matched');
                }
                
                this.boardElement.appendChild(cellElement);
            }
        }
    }
    
    // 更新UI状态
    updateUI() {
        // 更新分数
        this.scoreElement.textContent = this.gameCore.score;
        
        // 更新提示数量
        this.hintsElement.textContent = this.gameCore.hintsLeft;
        
        // 更新时间
        this.timerElement.textContent = this.gameCore.timeLeft;
        
        // 更新按钮状态
        this.hintButton.disabled = !this.gameCore.gameStarted || this.gameCore.hintsLeft <= 0;
        this.shuffleButton.disabled = !this.gameCore.gameStarted;
        this.startButton.textContent = this.gameCore.gameStarted ? '重新开始' : '开始游戏';
    }
    
    // 处理单元格选择
    handleCellSelection(result) {
        if (!result) return;
        
        switch (result.action) {
            case 'select':
                this.highlightCell(result.cell, 'selected');
                break;
                
            case 'deselect':
                this.unhighlightCell(result.cell, 'selected');
                break;
                
            case 'switch':
                this.unhighlightCell(result.previousCell, 'selected');
                this.highlightCell(result.newCell, 'selected');
                break;
                
            case 'match':
                // 显示连接路径
                this.showPath(result.path);
                
                // 标记匹配的单元格
                for (const cell of result.cells) {
                    this.markCellAsMatched(cell);
                }
                
                // 更新分数
                this.scoreElement.textContent = this.gameCore.score;
                
                // 检查游戏是否胜利
                if (result.gameWon) {
                    this.showGameWon();
                }
                break;
        }
    }
    
    // 高亮单元格
    highlightCell(cell, className) {
        const cellElement = this.getCellElement(cell.row, cell.col);
        if (cellElement) {
            cellElement.classList.add(className);
        }
    }
    
    // 取消高亮单元格
    unhighlightCell(cell, className) {
        const cellElement = this.getCellElement(cell.row, cell.col);
        if (cellElement) {
            cellElement.classList.remove(className);
        }
    }
    
    // 标记单元格为已匹配
    markCellAsMatched(cell) {
        const cellElement = this.getCellElement(cell.row, cell.col);
        if (cellElement) {
            cellElement.classList.add('matched');
            cellElement.classList.remove('selected');
        }
    }
    
    // 获取单元格元素
    getCellElement(row, col) {
        return this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }
    
    // 显示连接路径
    showPath(path) {
        if (!path || path.length < 2) return;
        
        // 清除之前的路径
        this.clearPath();
        
        // 创建SVG覆盖层
        const overlay = document.createElement('div');
        overlay.className = 'path-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '100';
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        
        overlay.appendChild(svg);
        this.boardElement.appendChild(overlay);
        
        // 绘制路径
        for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];
            
            const startCell = this.getCellElement(start.row, start.col);
            const endCell = this.getCellElement(end.row, end.col);
            
            if (!startCell || !endCell) continue;
            
            const startRect = startCell.getBoundingClientRect();
            const endRect = endCell.getBoundingClientRect();
            const boardRect = this.boardElement.getBoundingClientRect();
            
            const startX = startRect.left + startRect.width / 2 - boardRect.left;
            const startY = startRect.top + startRect.height / 2 - boardRect.top;
            const endX = endRect.left + endRect.width / 2 - boardRect.left;
            const endY = endRect.top + endRect.height / 2 - boardRect.top;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', startX);
            line.setAttribute('y1', startY);
            line.setAttribute('x2', endX);
            line.setAttribute('y2', endY);
            line.setAttribute('stroke', '#4e73df');
            line.setAttribute('stroke-width', '3');
            line.setAttribute('stroke-linecap', 'round');
            
            svg.appendChild(line);
            this.pathLines.push(line);
        }
        
        // 设置定时器清除路径
        setTimeout(() => this.clearPath(), 500);
    }
    
    // 清除连接路径
    clearPath() {
        const overlay = this.boardElement.querySelector('.path-overlay');
        if (overlay) {
            overlay.remove();
        }
        this.pathLines = [];
    }
    
    // 显示提示
    showHint(hintPair) {
        if (!hintPair) return;
        
        // 清除之前的提示
        this.clearHint();
        
        // 高亮提示的单元格
        this.highlightCell(hintPair.cell1, 'hint');
        this.highlightCell(hintPair.cell2, 'hint');
        
        // 设置定时器清除提示
        this.hintTimeout = setTimeout(() => this.clearHint(), 2000);
    }
    
    // 清除提示
    clearHint() {
        if (this.hintTimeout) {
            clearTimeout(this.hintTimeout);
            this.hintTimeout = null;
        }
        
        const hintCells = this.boardElement.querySelectorAll('.hint');
        hintCells.forEach(cell => cell.classList.remove('hint'));
    }
    
    // 显示游戏胜利
    showGameWon() {
        setTimeout(() => {
            alert(`恭喜你赢了！\n得分: ${this.gameCore.score}`);
            this.gameCore.endGame();
            this.updateUI();
        }, 500);
    }
    
    // 显示游戏失败
    showGameLost(reason) {
        alert(`游戏结束！\n${reason}\n得分: ${this.gameCore.score}`);
        this.gameCore.endGame();
        this.updateUI();
    }
    
    // 绑定事件
    bindEvents() {
        // 这个方法将在game-events.js中实现
    }
}

// 导出GameUI类
if (typeof module !== 'undefined') {
    module.exports = { GameUI };
}