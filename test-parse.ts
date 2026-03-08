import { parseTelopText } from './src/utils/textProcessor.js';

const input = `
00:00:29,000 --> 00:00:35,000
多分 世の中には
本当に稼いでいるフリーランスより
`;

console.log(JSON.stringify(parseTelopText(input), null, 2));
