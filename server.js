const fs = require("fs");
const http = require("http");

const FILE = "numbers.txt";
const FILE_NAMES = "filenames.txt";

function generateNumber(length = 50) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

function generateRandomString(length = 20) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getNumbers(file = FILE) {
  if (!fs.existsSync(file)) return new Set();
  return new Set(
    fs.readFileSync(file, "utf8").split("\n").filter(Boolean)
  );
}

function generateUnique() {
  const numbers = getNumbers(FILE);
  let num;

  do {
    num = generateNumber(50);
  } while (numbers.has(num));

  fs.appendFileSync(FILE, num + "\n");
  return num;
}

// mixed generator (letters + numbers)
function generateUniqueFilename(ext = ".txt") {
  const names = getNumbers(FILE_NAMES);
  let name;

  if (!ext.startsWith(".")) {
    ext = "." + ext;
  }

  do {
    const letters = generateRandomString(10);
    const numbers = generateNumber(20);
    name = letters + numbers + ext;
  } while (names.has(name));

  fs.appendFileSync(FILE_NAMES, name + "\n");
  return name;
}

const html = `
<!DOCTYPE html>
<html>
<body style="background:black;color:lime;text-align:center;font-family:monospace">

<h2>Unique Number Generator</h2>

<input id="output" style="width:80%;padding:10px" readonly>

<br><br>

<input id="ext" value=".txt" style="padding:5px;width:100px;text-align:center">

<br><br>

<!-- ✅ NEW: provider input -->
<input id="provider" placeholder="Optional provider URL" style="padding:5px;width:60%">

<br><br>

<button onclick="generate()">Generate Number</button>
<button onclick="generateFile()">Generate Filename</button>
<button onclick="copy()">Copy</button>

<script>
async function generate() {
  try {
    const provider = document.getElementById("provider").value;
    const url = provider ? "/generate?provider=" + encodeURIComponent(provider) : "/generate";

    const res = await fetch(url);
    const text = await res.text();
    document.getElementById("output").value = text;
  } catch (err) {
    alert("Error: " + err.message);
  }
}

async function generateFile() {
  try {
    const ext = document.getElementById("ext").value || ".txt";
    const provider = document.getElementById("provider").value;

    let url = "/filename?ext=" + encodeURIComponent(ext);
    if (provider) {
      url += "&provider=" + encodeURIComponent(provider);
    }

    const res = await fetch(url);
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
    return res.end(html);
  }

  // 🔹 GENERATE NUMBER (with optional provider)
  else if (req.url.startsWith("/generate")) {
    const urlObj = new URL(req.url, "http://localhost:3000");
    const provider = urlObj.searchParams.get("provider");

    if (provider) {
      fetch(provider)
        .then(r => r.text())
        .then(data => {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end(data);
        })
        .catch(() => {
          res.writeHead(500);
          res.end("Error fetching external provider");
        });
      return;
    }

    const num = generateUnique();
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(num);
  }

  // 🔹 GENERATE FILENAME (with optional provider)
  else if (req.url.startsWith("/filename")) {
    const urlObj = new URL(req.url, "http://localhost:3000");
    const ext = urlObj.searchParams.get("ext") || ".txt";
    const provider = urlObj.searchParams.get("provider");

    if (provider) {
      fetch(provider)
        .then(r => r.text())
        .then(data => {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end(data);
        })
        .catch(() => {
          res.writeHead(500);
          res.end("Error fetching external provider");
        });
      return;
    }

    const name = generateUniqueFilename(ext);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(name);
  }

}).listen(3000, () => {
  console.log("Open http://localhost:3000");
});
