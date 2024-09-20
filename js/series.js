// GPT配置
function requestContent() {
    return {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            stream: false,
            max_tokens: 4000,
            model: 'gpt-3.5-turbo',
            temperature: 0.8,
            top_p: 1,
            presence_penalty: 1,
            messages: [
                {
                    role: 'user',
                    content: promt_question
                }
            ]
        })
    };
}

// 让GPT生成问题
async function createQuestion() {
    const response = await fetch(url, requestContent());
    const data = await response.json();
    console.log(data.choices[0].message.content);
    return data.choices[0].message.content; // 返回 GPT 的回复
}

// 将GPT生成的问题压入QUESTION_ARRAY里面
async function pushQuestion() {
    try {
        const questionString = await createQuestion();
        const questionLines = questionString.trim().split('\n');

        // 遍历每一行，提取问题内容并存储在 QUESTION_ARRAY 中
        questionLines.forEach((line, index) => {
            // 去掉行号和句号，提取问题内容
            const content = line.replace(/^\d+\.\s*/, '');
            console.log(content);
            // 创建问题对象并存储在数组中
            QUESTION_ARRAY.push({
                content: content,
                chosen: 0,
            });
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

// 将问题展示到屏幕里面
function displayQuestions() {
    const container = document.getElementById('question-container');
    QUESTION_ARRAY.forEach((questionObject) => {
        const question = new Question(questionObject);
        container.appendChild(question.element);
    });
}

async function fetchQuestion() {
    const loadingIndicator = document.getElementById('loading-indicator');
	const submitButton = document.getElementById('submit-button');
    loadingIndicator.style.display = 'block'; // 显示加载指示器
    submitButton.style.display = 'none';
    await pushQuestion();
    displayQuestions();

    loadingIndicator.style.display = 'none'; // 隐藏加载指示器
	submitButton.style.display = 'block';
}

fetchQuestion();