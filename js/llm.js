var sendData = QUESTION_ARRAY.map(question => {
    return {
        content: question.content,
        chosen: question.chosen
    };
});

function sendDataUpdate() {
    sendData = QUESTION_ARRAY.map(question => {
        return {
            content: question.content,
            chosen: question.chosen
        };
    });
}


// 请求的配置
function requestMBTI(sendData) {
    return {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            stream: true,
            max_tokens: 4000,
            model: 'gpt-3.5-turbo',
            temperature: 0.8,
            top_p: 1,
            presence_penalty: 1,
            messages: [
                {
                    role: 'system',
                    content: prompt_mbti
                },
                {
                    role: 'user',
                    content: prompt_mbti + JSON.stringify(sendData)
                }
            ]
        })
    };
}

// 发送请求
async function sendChatGPT() {
    sendDataUpdate();
    console.log(sendData);
    console.log(requestMBTI(sendData));

    const response = await fetch(url, requestMBTI(sendData));

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    const resultElement = document.querySelector("article.result");
    resultElement.innerHTML = ''; // 清空结果区域

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // 处理 buffer 中的数据
        while (true) {
            const newlineIndex = buffer.indexOf('\n');
            if (newlineIndex === -1) break;

            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (line.startsWith('data: ')) {
                const jsonString = line.slice(6); // 去掉 'data: ' 前缀
                if (jsonString === '[DONE]') {
                    continue; // 忽略 [DONE] 标记
                }
                try {
                    const json = JSON.parse(jsonString);
                    if (json.choices && json.choices.length > 0) {
                        const content = json.choices[0].delta.content;
                        if (content) {
                            resultElement.innerHTML += content; // 将内容添加到结果区域
                        }
                    }
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                }
            }
        }
    }
}

