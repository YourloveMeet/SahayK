const fs = require('fs');

const logPath = 'C:/Users/Meet Patel/.gemini/antigravity-ide/brain/5d0c2abc-7394-4c6b-b5d7-9df457c3d58b/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i]) continue;
  try {
    const obj = JSON.parse(lines[i]);
    if (obj.tool_calls) {
      for (const call of obj.tool_calls) {
        if (call.name === 'view_file' || call.name === 'default_api:view_file') {
          // Look at the tool response
          // But wait, the content of view_file is in the next step, which is a tool response
        }
      }
    }
    // Alternatively, look at model steps where it read the file? No, I need the actual tool response.
    if (obj.type === 'ACTION_RESULT' && obj.content.includes('database.types.ts') && obj.content.includes('ngo_residents')) {
      fs.writeFileSync('extracted_types.ts', obj.content);
      console.log('Found in ACTION_RESULT at step ' + obj.step_index);
      return;
    }
  } catch (e) {}
}
console.log('Not found');
