// script.js

// 从 URL 获取参数
const urlParams = new URLSearchParams(window.location.search);
const url = urlParams.get('url'); // 获取 URL 参数

const historyKey = 'editHistory';

// 如果没有提供 URL，跳转回主页
if (!url) {
    alert('未提供网址');
    window.location.href = '/';
}

// 使用 CORS 代理来获取网页内容
function fetchPageContent(url) {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // CORS 代理服务地址
    const targetUrl = encodeURIComponent(url);
    
    // 请求目标网页
    fetch(`${proxyUrl}${targetUrl}`)
        .then(response => {
            if (!response.ok) throw new Error('网络错误');
            return response.text();
        })
        .then(html => {
            const updatedHtml = convertRelativePathsToAbsolute(html, url);
            document.getElementById('editableContent').innerHTML = updatedHtml;
        })
        .catch(err => {
            console.error('获取网页内容失败:', err);
            alert('无法加载该网页，请检查网址。');
        });
}

// 转换网页中的相对路径为绝对路径
function convertRelativePathsToAbsolute(html, baseUrl) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const base = new URL(baseUrl);
    
    doc.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
            img.src = new URL(src, base).href;
        }
    });

    doc.querySelectorAll('link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('data:')) {
            link.href = new URL(href, base).href;
        }
    });

    return doc.documentElement.innerHTML;
}

// 编辑内容保存到本地历史记录
function saveContentToHistory() {
    const content = document.getElementById('editableContent').innerHTML;
    const timestamp = new Date().toLocaleString();
    const name = prompt('请输入保存内容的名称:', `内容 - ${timestamp}`) || `内容 - ${timestamp}`;
    
    let history = JSON.parse(localStorage.getItem(historyKey)) || [];
    
    if (history.length >= 50) {
        history.shift();  // 保持历史记录最大数量为 50
    }
    
    history.push({ name, timestamp, content });
    localStorage.setItem(historyKey, JSON.stringify(history));
    
    alert('内容已保存到历史记录！');
}

// 绑定按钮点击事件
document.getElementById('saveButton').addEventListener('click', saveContentToHistory);

document.getElementById('editButton').addEventListener('click', () => {
    document.getElementById('editableContent').contentEditable = "true";
    alert('您现在可以编辑内容！');
});

document.getElementById('backButton').addEventListener('click', () => {
    window.history.back();
});

document.getElementById('historyButton').addEventListener('click', () => {
    const historyList = document.getElementById('historyList');
    historyList.classList.toggle('show');
    
    const history = JSON.parse(localStorage.getItem(historyKey)) || [];
    historyList.innerHTML = '';
    
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `${item.name} - ${item.timestamp}`;
        historyList.appendChild(historyItem);
    });
});

// 加载目标网页
fetchPageContent(url);
