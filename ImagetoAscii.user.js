// ==UserScript==
// @name         Image to Ascii
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Analyze image memory size and show ASCII data on click near image with loading indicator and Mac-style UI
// @author       Maptnh@S-H4CK13
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function createLoadingIndicator() {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.textContent = 'Loading...';
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.padding = '10px 20px';
        loadingIndicator.style.border = 'none';
        loadingIndicator.style.background = '#007aff';
        loadingIndicator.style.color = '#fff';
        loadingIndicator.style.fontFamily = 'Arial, sans-serif';
        loadingIndicator.style.fontSize = '16px';
        loadingIndicator.style.borderRadius = '4px';
        loadingIndicator.style.zIndex = '10001';
        loadingIndicator.style.display = 'none';
        return loadingIndicator;
    }

    function createAnalyzeButton() {
        const button = document.createElement('button');
        button.textContent = 'Analyze Image';
        button.style.position = 'absolute';
        button.style.top = '0';
        button.style.left = '0';
        button.style.padding = '5px 10px';
        button.style.border = 'none';
        button.style.background = '#007aff';
        button.style.color = '#fff';
        button.style.fontFamily = 'Arial, sans-serif';
        button.style.fontSize = '14px';
        button.style.cursor = 'pointer';
        button.style.zIndex = '9999';
        button.style.display = 'none';

        button.addEventListener('click', async function() {
            const loadingIndicator = createLoadingIndicator();
            document.body.appendChild(loadingIndicator);
            loadingIndicator.style.display = 'block';

            const imageUrl = analyzeButton.targetImage.src;
            const analysisResult = await analyzeImage(imageUrl);

            loadingIndicator.style.display = 'none';
            loadingIndicator.remove();

            const panel = createAnalysisPanel(analysisResult);
            document.body.appendChild(panel);

            panel.querySelector('.close-button').addEventListener('click', function() {
                panel.remove();
            });
        });

        return button;
    }

    function createAnalysisPanel(analysisResult) {
        const panel = document.createElement('div');
        panel.style.position = 'fixed';
        panel.style.top = '50px';
        panel.style.left = '50px';
        panel.style.width = '80%';
        panel.style.height = '80%';
        panel.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        panel.style.color = '#fff';
        panel.style.padding = '20px';
        panel.style.borderRadius = '8px';
        panel.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        panel.style.zIndex = '10000';
        panel.style.overflow = 'auto';

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.border = 'none';
        closeButton.style.background = '#007aff';
        closeButton.style.color = '#fff';
        closeButton.style.fontFamily = 'Arial, sans-serif';
        closeButton.style.fontSize = '14px';
        closeButton.style.cursor = 'pointer';
        closeButton.classList.add('close-button');
        panel.appendChild(closeButton);

        const content = document.createElement('div');
        const memorySize = document.createElement('h3');
        memorySize.textContent = `Memory Size: ${analysisResult.byteLength} bytes`;
        content.appendChild(memorySize);

        const asciiDataSection = document.createElement('div');
        asciiDataSection.style.marginTop = '10px';
        const asciiDataTitle = document.createElement('h4');
        asciiDataTitle.textContent = 'ASCII Data:';
        asciiDataSection.appendChild(asciiDataTitle);
        const asciiData = document.createElement('pre');
        asciiData.textContent = analysisResult.ascii;
        asciiData.style.whiteSpace = 'pre-wrap';
        asciiData.style.maxHeight = 'calc(50vh - 60px)';
        asciiData.style.overflow = 'auto';
        asciiData.style.background = '#333';
        asciiData.style.color = '#fff';
        asciiData.style.padding = '10px';
        asciiData.style.borderRadius = '8px';
        asciiDataSection.appendChild(asciiData);
        content.appendChild(asciiDataSection);

        panel.appendChild(content);

        asciiData.addEventListener('scroll', () => {
          
        });

        return panel;
    }

    async function analyzeImage(url) {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();

        const asciiArray = [];

        const view = new DataView(buffer);
        for (let i = 0; i < view.byteLength; i++) {
            const ascii = view.getUint8(i);
            asciiArray.push(ascii >= 32 && ascii <= 126 ? String.fromCharCode(ascii) : '.');
        }

        const asciiString = asciiArray.join('');

        return {
            byteLength: view.byteLength,
            ascii: asciiString
        };
    }

    const analyzeButton = createAnalyzeButton();
    document.body.appendChild(analyzeButton);

    document.addEventListener('mousemove', function(event) {
        const target = event.target;
        if (target.tagName === 'IMG') {
            const rect = target.getBoundingClientRect();
            analyzeButton.style.top = `${rect.top + window.scrollY}px`;
            analyzeButton.style.left = `${rect.left + window.scrollX}px`;
            analyzeButton.style.display = 'block';
            analyzeButton.targetImage = target;
        } else if (!analyzeButton.contains(event.target)) {
            analyzeButton.style.display = 'none';
        }
    });

    document.addEventListener('click', function(event) {
        if (!analyzeButton.contains(event.target)) {
            analyzeButton.style.display = 'none';
        }
    });

})();
