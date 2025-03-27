/**
 * CSS文件加载器
 * 用于优化CSS文件的加载，减少内存占用
 */
class CSSLoader {
    constructor() {
        this.loadedFiles = new Set();
        this.baseUrl = './css/';
        this.essentialFiles = ['base.css', 'game-board.css', 'animations.css', 'layout.css'];
        this.featureFiles = {
            'modals': 'modals.css',
            'achievements': 'achievements.css',
            'leaderboard': 'leaderboard.css',
            'themes': 'themes.css',
            'enhanced-animations': 'enhanced-animations.css'
        };
    }

    /**
     * 初始化加载基础CSS文件
     */
    init() {
        // 加载必要的CSS文件
        this.essentialFiles.forEach(file => {
            this.loadCSS(file);
        });

        // 监听主题切换事件
        document.addEventListener('themeToggle', () => {
            this.loadFeature('themes');
        });
        
        // 默认加载增强动画
        this.loadFeature('enhanced-animations');
    }

    /**
     * 加载特定功能的CSS文件
     * @param {string} feature - 功能名称
     */
    loadFeature(feature) {
        if (this.featureFiles[feature] && !this.loadedFiles.has(this.featureFiles[feature])) {
            this.loadCSS(this.featureFiles[feature]);
        }
    }

    /**
     * 加载CSS文件
     * @param {string} filename - CSS文件名
     */
    loadCSS(filename) {
        if (this.loadedFiles.has(filename)) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = this.baseUrl + filename;
        
        // 添加加载事件
        link.onload = () => {
            console.log(`CSS文件 ${filename} 加载成功`);
            this.loadedFiles.add(filename);
        };
        
        link.onerror = () => {
            console.error(`CSS文件 ${filename} 加载失败`);
        };
        
        document.head.appendChild(link);
    }

    /**
     * 预加载所有CSS文件
     */
    preloadAll() {
        // 加载所有功能CSS文件
        Object.values(this.featureFiles).forEach(file => {
            this.loadCSS(file);
        });
    }
}

// 创建CSS加载器实例
const cssLoader = new CSSLoader();

// 页面加载完成后初始化CSS加载器
window.addEventListener('DOMContentLoaded', () => {
    cssLoader.init();
    
    // 根据设备性能决定是否预加载所有CSS
    if (navigator.hardwareConcurrency > 4) {
        // 如果设备CPU核心数大于4，预加载所有CSS
        setTimeout(() => {
            cssLoader.preloadAll();
        }, 1000); // 延迟1秒预加载，优先加载基础CSS
    }
});