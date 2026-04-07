const fs = require("fs");
const http = require("http");

const FILE = "numbers.txt";

function generateNumber(length = 50) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

function getNumbers() {
  if (!fs.existsSync(FILE)) return new Set();
  return new Set(
    fs.readFileSync(FILE, "utf8").split("\n").filter(Boolean)
  );
}

function generateUnique() {
  const numbers = getNumbers();
  let num;

  do {
    num = generateNumber(50);
  } while (numbers.has(num));

  fs.appendFileSync(FILE, num + "\n");
  return num;
}

const html = `
<!DOCTYPE html>
<html>
<body style="background:black;color:lime;text-align:center;font-family:monospace">

<h2>Unique Number Generator</h2>

<input id="output" style="width:80%;padding:10px" readonly>

<br><br>

<button onclick="generate()">Generate</button>
<button onclick="copy()">Copy</button>

<script>
async function generate() {
  try {
    const res = await fetch("/generate");
    const text = await res.text();
    document.getElementById("output").value = text;
  } catch (err) {
    alert("Error: " + err.message);
  }
}

function copy() {
  const input = document.getElementById("output");
  input.select();
  document.execCommand("copy");
}
</script>

</body>
</html>
`;

http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  } 
  else if (req.url === "/generate") {
    const num = generateUnique();
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(num);
  }
}).listen(3000, () => {
  console.log("Open http://localhost:3000");
});