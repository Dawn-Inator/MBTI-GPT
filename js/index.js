window.onload = function () {
    // 加载所有题目，并渲染组件
    const mainElement = document.querySelector("main");

    const questionObjectList = [];
    for (const questionJson of QUESTION_ARRAY) {
        let questionObject = new Question(questionJson);
        questionObjectList.push(questionObject);
    }

    for (let question of questionObjectList) {
        mainElement.appendChild(question.element);
    }

    // 做完题的加载方法
    const submitButton = document.querySelector(".submit");
    submitButton.onclick = function () {
        for (const question of questionObjectList) {
            if (!question.isFinish) {
                alert("还有题目没有做完");
                return;
            }
        }
        // 将结果区域显示
        document.querySelector("article.result").style.display = "block";
        sendChatGPT();
    };
};