const { execSync } = require('child_process');
const adb = 'C:\\Users\\pro\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe';

function run(cmd) {
  try {
    return execSync(`"${adb}" -e ${cmd}`).toString();
  } catch (e) {
    return e.message;
  }
}

console.log('1. Focus email');
run('shell input tap 574 1247');
console.log('2. Clear email');
for (let i = 0; i < 35; i++) run('shell input keyevent 67');
console.log('3. Type email');
run('shell input text danielkgitahi@gmail.com');

console.log('4. Focus password');
run('shell input tap 535 1470');
console.log('5. Clear password');
for (let i = 0; i < 35; i++) run('shell input keyevent 67');
console.log('6. Type password');
run('shell input text AdminSecure2026\\!#\\$');

console.log('7. Dismiss keyboard');
run('shell input keyevent 4');

console.log('8. Wait 1 sec then Tap SIGN IN');
setTimeout(() => {
  run('shell input tap 540 1643');
  console.log('9. Waiting for response...');
  setTimeout(() => {
    run('shell screencap -p /sdcard/screen.png');
    run('pull /sdcard/screen.png "C:\\Users\\pro\\.gemini\\antigravity\\brain\\ea656267-a910-4c48-95d4-30759ac34a12\\emulator_login.png"');
    console.log('10. Done! Screenshot pulled.');
  }, 4000);
}, 1000);
