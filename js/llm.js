// 替换为你的 API key
const apiKey = 'sk-3bUAEjA08VwtbhBK39894e0fE1B44dC8B0687d14243eF385';

// 请求的 URL
const url = 'https://api.iew.cc/v1/chat/completions';

const prompt = `
              你是一名MBTI评测师，任务是根据用户的回答意向评估用户的性格和mubi人格。评估时，请遵循以下规则：
              1. 我接下来将发送给你用户输入问题以及意向值，用户的意向范围从-3到3，表示他们对某个问题的态度。-3为极力反对，0为中立，3为强烈支持。问题和用户回答发送的方式是json格式如{"content":"1.你经常交新朋友。","chosen":3}，代表用户经常交新朋友。
              2. 你测评时不需要复述调查问题和用户回答，直接对用户进行mubi性格测评。
              3. MBTI人格一共有16个:INTJ、INTP、ENTJ、ENTP、INFJ、INFP、ENFJ、ENFP、ISTJ、ISFJ、ESTJ、ESFJ、ISTP、ISFP、ESTP、ESFP，你需要推测用户是哪一个人格。
			  4. 你的回答模板如下：“通过你的选择，我推测你是xxxx人格。xxxx人格，也被称为xxxx”。然后详细的分析用户的性格和mubi人格。
              `;

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
function requestLLM(sendData) {
    return {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            stream: true,
            max_tokens: 4000,
            model: 'gpt-4-1106-preview',
            temperature: 0.8,
            top_p: 1,
            presence_penalty: 1,
            messages: [
                {
                    role: 'system',
                    content: prompt
                },
                {
                    role: 'user',
                    content: prompt + JSON.stringify(sendData)
                }
            ]
        })
    };
}

// 发送请求
async function sendChatGPT() {
    sendDataUpdate();
    console.log(sendData);
    console.log(requestLLM(sendData));

    const response = await fetch(url, requestLLM(sendData));

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