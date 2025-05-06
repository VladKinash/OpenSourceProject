import { io } from "socket.io-client";

async function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function run() {
    const SERVER = "http://localhost:3000";
    const alice = io(SERVER);
    const bob = io(SERVER);

    alice.on("connect", () => console.log("Alice connected"));
    bob.on("connect", () => console.log("Bob   connected"));

    alice.on("gameState", (state) => {
    console.log("Alice sees:", state);
    });
    bob.on("gameState", (state) => {
    console.log("Bob   sees:", state);
    });

    alice.on("created", async ({ roomId }) => {
    console.log("Room created:", roomId);
    bob.emit("joinGame", { roomId, playerName: "Bob" });
    await delay(200);
    alice.emit("startGame", { roomId });
    });

    bob.on("error", (msg) => console.error("Bob error:", msg));
    alice.on("error", (msg) => console.error("Alice error:", msg));

    alice.emit("createGame", { playerNames: ["Alice"] });

    await delay(5000);
    alice.disconnect();
    bob.disconnect();
    process.exit(0);
}

run();
