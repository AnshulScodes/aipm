let testList: string = [  
    '{"prdData":" chat"}',
    '{"prdData":" and"}',
    '{"prdData":" learn"}',
    '{"prdData":" more"}',
    '{"prdData":" about"}',
    '{"prdData":" you"}',
    '{"prdData":"."}']
    .map(item => JSON.parse(item).prdData)
    .join('');

console.log(testList); // Output: "chat and learn more you about."