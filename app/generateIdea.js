import adjectives from "./adjectives";

let counter = 0;
const limit = 1000;

async function generateNewText(prompt, openai) {
    counter++;
    if (counter > limit) return "Generation stopped for safety. (Max " + limit + " generations)";
    
    if (openai === undefined) return "OpenAI not initialized.";
    if (prompt === "") return "Prompt not defined.";

    console.log(prompt)

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const chatCompletion = await openai.chat.completions.create({
        messages: [{
            role: 'user',
            content: "Generate: " + prompt + "\n" +
            "Language: Japanese.\n" + 
            "Generated text must be " + adjective + ".\n" +
            "Only output the idea.",
        }],
        model: 'gpt-3.5-turbo',
        max_tokens: 150,
    });
    console.log(chatCompletion);
    const newText = chatCompletion.choices[0].message.content;
    return newText;
}

export default generateNewText;