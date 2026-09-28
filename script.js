/* ==========================================
   AVL TREE ADVENTURE
   Interactive AVL Tree Learning Game
========================================== */


/* ---------- AVL NODE ---------- */

class AVLNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}


/* ---------- GAME STATE ---------- */

let root = null;

let score = 0;
let xp = 0;
let lives = 3;
let level = 1;

let targetNumbers = [30, 20, 40];

let quizAnswered = false;


/* ---------- DOM ---------- */

const valueInput = document.getElementById("valueInput");
const treeContainer = document.getElementById("treeContainer");

const scoreElement = document.getElementById("score");
const xpElement = document.getElementById("xp");
const livesElement = document.getElementById("lives");
const levelElement = document.getElementById("level");
const healthElement = document.getElementById("health");

const messageElement = document.getElementById("treeStatus");
const logElement = document.getElementById("log");

const traversalResult = document.getElementById("traversalResult");

const missionTitle = document.getElementById("missionTitle");
const missionText = document.getElementById("missionText");
const targetNumbersElement = document.getElementById("targetNumbers");

const rotationModal = document.getElementById("rotationModal");
const rotationTitle = document.getElementById("rotationTitle");
const rotationDescription = document.getElementById("rotationDescription");
const rotationDiagram = document.getElementById("rotationDiagram");


/* ---------- AVL HELPERS ---------- */

function height(node) {
    return node ? node.height : 0;
}


function updateHeight(node) {
    if (!node) return;

    node.height =
        1 + Math.max(height(node.left), height(node.right));
}


function balanceFactor(node) {
    if (!node) return 0;

    return height(node.left) - height(node.right);
}


/* ---------- RIGHT ROTATION ---------- */

function rightRotate(y) {

    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    updateHeight(y);
    updateHeight(x);

    showRotation(
        "LL Case — Right Rotation",
        "The left side became too heavy. A right rotation restores balance.",
        "↙️  🌳  ↘️"
    );

    addLog(
        "🔄",
        `Right rotation performed around ${y.value}.`
    );

    return x;
}


/* ---------- LEFT ROTATION ---------- */

function leftRotate(x) {

    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    updateHeight(x);
    updateHeight(y);

    showRotation(
        "RR Case — Left Rotation",
        "The right side became too heavy. A left rotation restores balance.",
        "↖️  🌳  ↗️"
    );

    addLog(
        "🔄",
        `Left rotation performed around ${x.value}.`
    );

    return y;
}


/* ---------- INSERT ---------- */

function insert(node, value) {

    if (!node) {
        return new AVLNode(value);
    }

    if (value < node.value) {
        node.left = insert(node.left, value);
    }
    else if (value > node.value) {
        node.right = insert(node.right, value);
    }
    else {
        return node;
    }

    updateHeight(node);

    const balance = balanceFactor(node);


    /* LL */

    if (balance > 1 && value < node.left.value) {
        return rightRotate(node);
    }


    /* RR */

    if (balance < -1 && value > node.right.value) {
        return leftRotate(node);
    }


    /* LR */

    if (balance > 1 && value > node.left.value) {

        node.left = leftRotate(node.left);

        addLog(
            "🔀",
            `Left-Right rotation sequence used at ${node.value}.`
        );

        return rightRotate(node);
    }


    /* RL */

    if (balance < -1 && value < node.right.value) {

        node.right = rightRotate(node.right);

        addLog(
            "🔀",
            `Right-Left rotation sequence used at ${node.value}.`
        );

        return leftRotate(node);
    }

    return node;
}


/* ---------- MINIMUM NODE ---------- */

function minValueNode(node) {

    let current = node;

    while (current.left) {
        current = current.left;
    }

    return current;
}


/* ---------- DELETE ---------- */

function deleteNode(node, value) {

    if (!node) return node;


    if (value < node.value) {

        node.left = deleteNode(node.left, value);

    }
    else if (value > node.value) {

        node.right = deleteNode(node.right, value);

    }
    else {

        if (!node.left || !node.right) {

            const temp = node.left || node.right;

            if (!temp) {
                node = null;
            }
            else {
                node = temp;
            }

        }
        else {

            const temp = minValueNode(node.right);

            node.value = temp.value;

            node.right =
                deleteNode(node.right, temp.value);
        }
    }


    if (!node) return node;

    updateHeight(node);

    const balance = balanceFactor(node);


    /* LL */

    if (balance > 1 && balanceFactor(node.left) >= 0) {
        return rightRotate(node);
    }


    /* LR */

    if (balance > 1 && balanceFactor(node.left) < 0) {

        node.left = leftRotate(node.left);

        return rightRotate(node);
    }


    /* RR */

    if (balance < -1 && balanceFactor(node.right) <= 0) {
        return leftRotate(node);
    }


    /* RL */

    if (balance < -1 && balanceFactor(node.right) > 0) {

        node.right = rightRotate(node.right);

        return leftRotate(node);
    }


    return node;
}


/* ---------- INSERT BUTTON ---------- */

function insertValue() {

    const value = Number(valueInput.value);

    if (!Number.isInteger(value)) {

        showMessage(
            "⚠️ Enter a valid whole number."
        );

        return;
    }


    if (findNode(root, value)) {

        showMessage(
            "⚠️ That value already exists in the tree."
        );

        addLog(
            "⚠️",
            `${value} already exists.`
        );

        return;
    }


    root = insert(root, value);

    score += 10;
    xp += 5;

    updateStats();

    addLog(
        "🌱",
        `${value} was planted in your AVL tree. +10 points`
    );

    showMessage(
        `Great! ${value} was inserted.`
    );

    valueInput.value = "";

    renderTree();

    checkMission();
}


/* ---------- DELETE BUTTON ---------- */

function deleteValue() {

    const value = Number(valueInput.value);

    if (!Number.isInteger(value)) {

        showMessage(
            "⚠️ Enter a value to delete."
        );

        return;
    }


    if (!findNode(root, value)) {

        showMessage(
            `❌ ${value} is not in the tree.`
        );

        lives--;

        if (lives < 0) lives = 0;

        updateStats();

        addLog(
            "💔",
            `${value} was not found. You lost a life.`
        );

        return;
    }


    root = deleteNode(root, value);

    score += 8;
    xp += 4;

    updateStats();

    addLog(
        "🗑️",
        `${value} was deleted from the tree. +8 points`
    );

    showMessage(
        `${value} was successfully removed.`
    );

    valueInput.value = "";

    renderTree();
}


/* ---------- SEARCH ---------- */

function searchValue() {

    const value = Number(valueInput.value);

    if (!Number.isInteger(value)) {

        showMessage(
            "⚠️ Enter a number to search."
        );

        return;
    }


    const found = findNode(root, value);

    document
        .querySelectorAll(".node")
        .forEach(node => {
            node.classList.remove("searching");
        });


    if (found) {

        const nodeElements =
            document.querySelectorAll(".node");

        nodeElements.forEach(element => {

            if (
                Number(element.dataset.value) === value
            ) {
                element.classList.add("searching");
            }

        });

        score += 5;
        xp += 2;

        updateStats();

        showMessage(
            `🔍 Found ${value}! Excellent searching.`
        );

        addLog(
            "🔍",
            `${value} was found in the AVL tree. +5 points`
        );

    }
    else {

        showMessage(
            `❌ ${value} was not found.`
        );

        addLog(
            "🔎",
            `${value} does not exist in the tree.`
        );
    }
}


/* ---------- FIND ---------- */

function findNode(node, value) {

    if (!node) return null;

    if (node.value === value) {
        return node;
    }

    if (value < node.value) {
        return findNode(node.left, value);
    }

    return findNode(node.right, value);
}


/* ---------- RANDOM ---------- */

function randomValue() {

    const value =
        Math.floor(Math.random() * 99) + 1;

    valueInput.value = value;

    insertValue();
}


/* ---------- CLEAR ---------- */

function clearTree() {

    root = null;

    renderTree();

    score = Math.max(0, score - 5);

    updateStats();

    addLog(
        "🧹",
        "The tree was cleared. Time to grow a new one!"
    );

    showMessage(
        "🌱 Your tree is ready for a new adventure."
    );
}


/* ---------- TREE RENDERING ---------- */

function renderTree() {

    if (!root) {

        treeContainer.innerHTML = `
            <div class="empty-tree">
                <div class="big-tree">🌱</div>
                <h2>Your tree is waiting...</h2>
                <p>Insert a number to plant your first node!</p>
            </div>
        `;

        healthElement.textContent = "100%";

        return;
    }


    treeContainer.innerHTML = "";

    const tree = document.createElement("div");

    tree.className = "tree";

    tree.appendChild(createNodeElement(root));

    treeContainer.appendChild(tree);

    updateHealth();
}


/* ---------- CREATE TREE ELEMENT ---------- */

function createNodeElement(node) {

    const wrapper =
        document.createElement("div");

    wrapper.className = "tree-node-wrapper";


    const nodeElement =
        document.createElement("div");

    nodeElement.className = "node";

    nodeElement.dataset.value = node.value;

    nodeElement.innerHTML = `
        ${node.value}
        <span class="balance ${Math.abs(balanceFactor(node)) <= 1 ? "good" : "bad"}">
            ${balanceFactor(node)}
        </span>
    `;

    wrapper.appendChild(nodeElement);


    const info =
        document.createElement("div");

    info.className = "node-info";

    info.textContent =
        `height: ${node.height}`;

    wrapper.appendChild(info);


    if (node.left || node.right) {

        const children =
            document.createElement("div");

        children.className = "children";


        if (node.left) {

            const left =
                document.createElement("div");

            left.className = "child";

            left.appendChild(
                createNodeElement(node.left)
            );

            children.appendChild(left);

        }
        else {

            children.appendChild(
                createEmptyChild()
            );
        }


        if (node.right) {

            const right =
                document.createElement("div");

            right.className = "child";

            right.appendChild(
                createNodeElement(node.right)
            );

            children.appendChild(right);

        }
        else {

            children.appendChild(
                createEmptyChild()
            );
        }


        wrapper.appendChild(children);
    }


    return wrapper;
}


/* ---------- EMPTY CHILD ---------- */

function createEmptyChild() {

    const empty =
        document.createElement("div");

    empty.className = "child";

    empty.innerHTML = `
        <div style="
            width:58px;
            height:58px;
            border:2px dashed #334b6b;
            border-radius:50%;
            opacity:.35;
        "></div>
    `;

    return empty;
}


/* ---------- HEALTH ---------- */

function updateHealth() {

    if (!root) {

        healthElement.textContent = "100%";

        return;
    }


    let total = 0;
    let balanced = 0;


    function walk(node) {

        if (!node) return;

        total++;

        if (Math.abs(balanceFactor(node)) <= 1) {
            balanced++;
        }

        walk(node.left);
        walk(node.right);
    }


    walk(root);


    const health =
        total === 0
            ? 100
            : Math.round((balanced / total) * 100);

    healthElement.textContent =
        `${health}%`;

    if (health >= 90) {

        healthElement.style.color =
            "var(--green)";

    }
    else if (health >= 60) {

        healthElement.style.color =
            "var(--yellow)";

    }
    else {

        healthElement.style.color =
            "var(--red)";
    }
}


/* ---------- TRAVERSALS ---------- */

function inorder(node, result = []) {

    if (!node) return result;

    inorder(node.left, result);

    result.push(node.value);

    inorder(node.right, result);

    return result;
}


function preorder(node, result = []) {

    if (!node) return result;

    result.push(node.value);

    preorder(node.left, result);

    preorder(node.right, result);

    return result;
}


function postorder(node, result = []) {

    if (!node) return result;

    postorder(node.left, result);

    postorder(node.right, result);

    result.push(node.value);

    return result;
}


function showInorder() {

    const result =
        inorder(root).join(" → ") || "Empty";

    traversalResult.textContent = result;

    addLog(
        "🧭",
        `Inorder: ${result}`
    );
}


function showPreorder() {

    const result =
        preorder(root).join(" → ") || "Empty";

    traversalResult.textContent = result;

    addLog(
        "🧭",
        `Preorder: ${result}`
    );
}


function showPostorder() {

    const result =
        postorder(root).join(" → ") || "Empty";

    traversalResult.textContent = result;

    addLog(
        "🧭",
        `Postorder: ${result}`
    );
}


/* ---------- MISSION ---------- */

function checkMission() {

    const values =
        inorder(root);

    const completed =
        targetNumbers.every(
            number => values.includes(number)
        );


    if (completed) {

        score += 50;
        xp += 30;

        level++;

        updateStats();

        addLog(
            "🏆",
            `Mission complete! Level ${level} unlocked! +50 points`
        );

        missionTitle.textContent =
            "🎉 Mission Complete!";

        missionText.textContent =
            "Amazing! You successfully grew the target AVL tree.";

        generateNewMission();
    }
}


/* ---------- NEW MISSION ---------- */

function generateNewMission() {

    const first =
        Math.floor(Math.random() * 50) + 10;

    const second =
        Math.max(1, first - 10);

    const third =
        first + 10;

    targetNumbers =
        [first, second, third];

    targetNumbersElement.textContent =
        targetNumbers.join(", ");

    missionTitle.textContent =
        `Level ${level} Mission`;

    missionText.textContent =
        "Plant all target values while keeping your tree balanced.";
}


/* ---------- STATS ---------- */

function updateStats() {

    scoreElement.textContent = score;

    xpElement.textContent = xp;

    livesElement.textContent = lives;

    levelElement.textContent = level;
}


/* ---------- MESSAGE ---------- */

function showMessage(message) {

    messageElement.textContent = message;
}


/* ---------- LOG ---------- */

function addLog(icon, message) {

    const item =
        document.createElement("div");

    item.className = "log-item";

    item.innerHTML = `
        <span>${icon}</span>
        <p>${message}</p>
    `;

    logElement.prepend(item);
}


/* ---------- ROTATION MODAL ---------- */

function showRotation(title, description, diagram) {

    rotationTitle.textContent = title;

    rotationDescription.textContent =
        description;

    rotationDiagram.textContent =
        diagram;

    rotationModal.classList.remove("hidden");
}


function closeRotation() {

    rotationModal.classList.add("hidden");
}


/* ---------- QUIZ ---------- */

function setupQuiz() {

    const buttons =
        document.querySelectorAll(
            ".quiz-options button"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (quizAnswered) return;

                const answer =
                    button.dataset.answer;

                const feedback =
                    document.getElementById(
                        "quizFeedback"
                    );


                if (answer === "-1") {

                    feedback.textContent =
                        "🎉 Correct! -1 is a valid AVL balance factor.";

                    feedback.style.color =
                        "var(--green)";

                    score += 20;
                    xp += 15;

                    quizAnswered = true;

                    updateStats();

                    addLog(
                        "🧠",
                        "Quiz solved correctly! +20 points"
                    );

                }
                else {

                    feedback.textContent =
                        "❌ Not quite. AVL nodes can have balance factors -1, 0 or +1.";

                    feedback.style.color =
                        "var(--red)";

                    lives--;

                    if (lives < 0) lives = 0;

                    updateStats();
                }
            }
        );

    });
}


/* ---------- EVENT LISTENERS ---------- */

document
    .getElementById("insertBtn")
    .addEventListener(
        "click",
        insertValue
    );


document
    .getElementById("deleteBtn")
    .addEventListener(
        "click",
        deleteValue
    );


document
    .getElementById("searchBtn")
    .addEventListener(
        "click",
        searchValue
    );


document
    .getElementById("randomBtn")
    .addEventListener(
        "click",
        randomValue
    );


document
    .getElementById("clearBtn")
    .addEventListener(
        "click",
        clearTree
    );


document
    .getElementById("inorderBtn")
    .addEventListener(
        "click",
        showInorder
    );


document
    .getElementById("preorderBtn")
    .addEventListener(
        "click",
        showPreorder
    );


document
    .getElementById("postorderBtn")
    .addEventListener(
        "click",
        showPostorder
    );


document
    .getElementById("clearLog")
    .addEventListener(
        "click",
        () => {
            logElement.innerHTML = "";
        }
    );


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeRotation
    );


document
    .getElementById("continueBtn")
    .addEventListener(
        "click",
        closeRotation
    );


valueInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            insertValue();
        }

    }
);


/* ---------- START GAME ---------- */

setupQuiz();

updateStats();

renderTree();

addLog(
    "🌳",
    "AVL Tree Adventure started!"
);

addLog(
    "📚",
    "Remember: every AVL node must have a balance factor of -1, 0 or +1."
);
