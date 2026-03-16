import { parseTelopText, applyFileLevelConsistencyChecks } from './src/utils/textProcessor';

const text = `00:00:01:00 - 00:00:05:00
1か月前はこうでした。

00:00:06:00 - 00:00:10:00
2ヶ月経ちました。

00:00:11:00 - 00:00:15:00
あの時ですね。

00:00:16:00 - 00:00:20:00
あんなときは大変でした。`;

const parsed = parseTelopText(text);
const final = applyFileLevelConsistencyChecks(parsed);

final.filter(l => !l.isNoise).forEach(l => {
    console.log(`Original: ${l.originalText}`);
    console.log(`Reasons: ${JSON.stringify(l.reasons)}`);
    console.log('---');
});
