import OpenAI from 'openai';

const apiKey = localStorage.getItem('openaiKey');

console.log(apiKey);

const openai = new OpenAI({
    dangerouslyAllowBrowser: true,
    apiKey,
});


const custom = async (
    query = 'Classify the sentiment in these tweets',
    item = "I can't stand homework",
    examples = [],
    model = 'gpt-4-0314',
    max_tokens = 150,
) => {
    try {
        const processedExamples = [];
        if (examples.length > 0) {
            examples.forEach((example) => {
                if (example?.item) {
                    processedExamples.push({ role: 'user', content: example.item });
                }
                if (example?.answer) {
                    processedExamples.push({ role: 'assistant', content: example.answer });
                }
            });
        }

        if (item) {
            processedExamples.push({ role: 'user', content: item });
        }

        const prompt = [{ role: 'system', content: query }, ...processedExamples];
        console.log('prompt:', prompt);

        const response = await openai.chat.completions.create({
            model,
            messages: prompt,
            temperature: 0,
            max_tokens: max_tokens,
        });
        console.log('response:', response);
        if (response.choices[0].text === 'undefined') {
            console.log('bah', response);
        }
        console.log(response.choices[0]);
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.log(JSON.stringify(error));
        if (error?.status === 429) {
            console.log('openai error', error);
            console.log('Trying again');
            return custom(query, item, max_tokens, examples);
        }
        console.error('openai error', error);
        return '';
    }
};

const conversation = async (textIn, history, system) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
        try {
            const { onOutput, onComplete } = await custom(system, textIn, history);
            let output = '';

            onOutput((partial) => {
                process.stdout.write(partial);
                output += partial;
            });

            onComplete(() => {
                resolve(output);
            });
        } catch (error) {
            resolve('Error');
            console.log(error);
        }
    });
};

export default { conversation, custom };